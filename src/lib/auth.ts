import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@exemplu.com" },
        password: { label: "Parola", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Date de conectare lipsă")
        }

        const forwardedFor = req.headers ? req.headers["x-forwarded-for"] : null;
        let userIp = "unknown";
        if (forwardedFor) {
            userIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0].trim();
        } else if (req.headers && req.headers["x-real-ip"]) {
            userIp = Array.isArray(req.headers["x-real-ip"]) ? req.headers["x-real-ip"][0] : req.headers["x-real-ip"];
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error("Utilizator negăsit")
        }

        if (userIp !== "unknown") {
          let updatedIps = user.knownIps || [];
          if (!updatedIps.includes(userIp)) {
            if (updatedIps.length >= 2) {
              throw new Error("Contul a atins limita maximă de 2 dispozitive/rețele (IP-uri) diferite. Contactează administratorul.");
            }
            updatedIps.push(userIp);
            await prisma.user.update({
              where: { id: user.id },
              data: { knownIps: updatedIps }
            });
          }
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Parolă incorectă")
        }

        if (user.status !== "APPROVED") {
          throw new Error("Contul tău este în așteptarea aprobării de către un administrator.")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
}
