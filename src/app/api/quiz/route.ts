import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: "Neautorizat" }, { status: 401 })
  }

  const userId = session.user.id

  const allQuestions = await prisma.question.findMany()

  if (allQuestions.length === 0) {
    return NextResponse.json({ message: "Nu există întrebări în baza de date" }, { status: 404 })
  }

  const userResponses = await prisma.response.findMany({
    where: { userId }
  })

  const answeredQuestionIds = new Set(userResponses.map(r => r.questionId))
  const recheckQuestionIds = new Set(
    userResponses.filter(r => r.status === "Recheck").map(r => r.questionId)
  )

  let availableQuestions = allQuestions.filter(q => !answeredQuestionIds.has(q.id))

  if (availableQuestions.length < 45) {
      availableQuestions = allQuestions
  }

  let userQuestions = availableQuestions.filter(q => recheckQuestionIds.has(q.id) || !answeredQuestionIds.has(q.id))

  shuffleArray(userQuestions)

  let prioritizedQuestions = userQuestions.slice(0, Math.ceil(45 * 0.8))

  let remainingQuestions = availableQuestions.filter(q => !prioritizedQuestions.includes(q))
  shuffleArray(remainingQuestions)

  let additionalQuestionsNeeded = Math.min(45 - prioritizedQuestions.length, remainingQuestions.length)
  let selectedQuestions = prioritizedQuestions.concat(remainingQuestions.slice(0, additionalQuestionsNeeded))

  selectedQuestions = selectedQuestions.slice(0, 45)

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
