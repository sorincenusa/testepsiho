import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const dynamic = "force-dynamic";

export async function GET() {
  const allQuestions = await prisma.question.findMany()

  if (allQuestions.length === 0) {
    return NextResponse.json({ message: "Nu există întrebări în baza de date" }, { status: 404 })
  }

  let selectedQuestions = [...allQuestions]
  shuffleArray(selectedQuestions)

  selectedQuestions = selectedQuestions.slice(0, 5)

  const quizPayload = selectedQuestions.map(q => {
    const optionsRaw = [
      { text: q.optionA, letter: 'A' },
      { text: q.optionB, letter: 'B' },
      { text: q.optionC, letter: 'C' },
      { text: q.optionD, letter: 'D' },
      { text: q.optionE, letter: 'E' }
    ].filter(o => o.text && o.text.trim() !== '')

    shuffleArray(optionsRaw)

    return {
      id: q.id,
      chapter: q.chapter,
      text: q.text,
      options: optionsRaw.map(o => o.text)
    }
  })

  return NextResponse.json(quizPayload)
}
