import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Neautorizat" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const safeUsers = users.map(({ password, ...user }) => user)

  return NextResponse.json(safeUsers)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Neautorizat" }, { status: 401 })
  }

  try {
    const { userId, status, role } = await req.json()

    if (!userId) {
      return NextResponse.json({ message: "ID utilizator lipsă" }, { status: 400 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (role) updateData.role = role

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json({ message: "Utilizator actualizat cu succes" })
  } catch (error) {
    return NextResponse.json({ message: "Eroare la actualizarea utilizatorului" }, { status: 500 })
  }
}
