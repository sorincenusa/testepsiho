import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email și parola sunt obligatorii" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ message: "Un cont cu acest email există deja" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const userCount = await prisma.user.count()
    const role = userCount === 0 ? "ADMIN" : "USER"
    const status = userCount === 0 ? "APPROVED" : "PENDING"

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status
      }
    })

    return NextResponse.json({ message: "Cont creat cu succes", userId: user.id }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "A apărut o eroare la înregistrare" }, { status: 500 })
  }
}
