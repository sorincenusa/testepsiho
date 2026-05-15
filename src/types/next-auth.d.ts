import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    status: string
  }

  interface Session {
    user: {
      id: string
      role: string
      status: string
    } & DefaultSession["user"]
  }
}
