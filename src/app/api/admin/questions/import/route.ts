import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Papa from 'papaparse'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Neautorizat" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ message: "Niciun fișier selectat" }, { status: 400 })
    }

    const fileContent = await file.text()

    const parsedData = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    })

    if (parsedData.errors.length > 0) {
      return NextResponse.json({ message: "Eroare la parsarea CSV-ului", errors: parsedData.errors }, { status: 400 })
    }

    const rows = parsedData.data as any[]
    let imported = 0
    let skipped = 0

    for (const row of rows) {
      const chapter = row['Capitol']?.trim()
      const text = row['Intrebare']?.trim()
      const optionA = row['A']?.trim()
      const optionB = row['B']?.trim()
      const optionC = row['C']?.trim()
      const optionD = row['D']?.trim()
      const optionE = row['E']?.trim()
      const correct = row['Raspuns corect']?.trim()

      if (!text || !optionA || !optionB || !correct) {
        skipped++
        continue
      }

      await prisma.question.create({
        data: {
          chapter: chapter || 'General',
          text,
          optionA,
          optionB,
          optionC: optionC || '',
          optionD: optionD || '',
          optionE: optionE || '',
          correct
        }
      })
      imported++
    }

    return NextResponse.json({ message: `Import finalizat: ${imported} adăugate, ${skipped} sărite.` })
  } catch (error: any) {
    console.error("Import error", error)
    return NextResponse.json({ message: "Eroare la importul întrebărilor", error: error.message }, { status: 500 })
  }
}
