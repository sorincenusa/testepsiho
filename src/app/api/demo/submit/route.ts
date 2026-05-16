import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { answers } = await req.json()

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ message: "Niciun răspuns trimis" }, { status: 400 })
    }

    const questionIds = Object.keys(answers)

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    })

    const results = []
    let correctCount = 0

    for (const q of questions) {
      const userAnswerText = answers[q.id]

      let correctAnswerText = ''
      switch (q.correct?.toUpperCase()) {
        case 'A': correctAnswerText = q.optionA; break;
        case 'B': correctAnswerText = q.optionB; break;
        case 'C': correctAnswerText = q.optionC; break;
        case 'D': correctAnswerText = q.optionD; break;
        case 'E': correctAnswerText = q.optionE; break;
      }

      const isCorrect = userAnswerText === correctAnswerText
      if (isCorrect) correctCount++

      results.push({
        questionId: q.id,
        chapter: q.chapter,
        text: q.text,
        userAnswer: userAnswerText,
        correctAnswer: correctAnswerText,
        isCorrect
      })
    }

    return NextResponse.json({
      correctCount,
      totalCount: questions.length,
      results
    })

  } catch (error) {
    return NextResponse.json({ message: "Eroare la procesarea răspunsurilor demo" }, { status: 500 })
  }
}
