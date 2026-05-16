import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: "Neautorizat" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const { answers, duration } = await req.json()

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ message: "Niciun răspuns trimis" }, { status: 400 })
    }

    const questionIds = Object.keys(answers)

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    })

    const sessionAnswersData = []
    let correctCount = 0
    const upsertPromises = []

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
      const status = isCorrect ? "Checked" : "Recheck"

      if (isCorrect) correctCount++

      sessionAnswersData.push({
        questionId: q.id,
        userAnswer: userAnswerText,
        isCorrect
      })

      upsertPromises.push(
        prisma.response.upsert({
          where: {
            userId_questionId: {
              userId,
              questionId: q.id
            }
          },
          update: {
            userAnswer: userAnswerText,
            isCorrect,
            status,
          },
          create: {
            userId,
            questionId: q.id,
            userAnswer: userAnswerText,
            isCorrect,
            status
          }
        })
      )
    }

    // Run all database updates simultaneously to vastly improve speed
    await Promise.all([
        ...upsertPromises,
        prisma.testSession.create({
            data: {
                userId,
                score: correctCount,
                total: questions.length,
                duration: duration || null,
                answers: {
                    create: sessionAnswersData
                }
            }
        })
    ])

    // Find the session ID to return to the user
    // We fetch it right after creation to ensure we have the correct one
    const testSession = await prisma.testSession.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      sessionId: testSession?.id,
      correctCount,
      totalCount: questions.length
    })

  } catch (error) {
    return NextResponse.json({ message: "Eroare la procesarea răspunsurilor" }, { status: 500 })
  }
}
