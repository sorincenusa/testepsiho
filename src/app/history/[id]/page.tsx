import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import ClientPrintButton from "./ClientPrintButton"

export default async function TestResultPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const testSession = await prisma.testSession.findUnique({
    where: { id: params.id },
    include: {
        answers: {
            include: { question: true }
        }
    }
  })

  if (!testSession || (testSession.userId !== session.user.id && session.user.role !== "ADMIN")) {
      return <div className="p-8 text-center text-red-600">Sesiune negăsită sau acces interzis.</div>
  }

  const getCorrectText = (q: any) => {
    switch(q.correct?.toUpperCase()) {
        case 'A': return q.optionA;
        case 'B': return q.optionB;
        case 'C': return q.optionC;
        case 'D': return q.optionD;
        case 'E': return q.optionE;
        default: return '';
    }
  }

  const formatTime = (totalSeconds: number | null) => {
    if (totalSeconds === null) return "N/A"
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
    const s = (totalSeconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white rounded-lg shadow px-6 py-4 mb-6 flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rezultate Test</h1>
            <p className="text-sm text-gray-500">
                Data: {new Date(testSession.createdAt).toLocaleString('ro-RO')}
            </p>
          </div>
          <div className="flex space-x-4 items-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Înapoi la meniu
            </Link>
            <ClientPrintButton />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-8 text-center border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Raport de Evaluare</h2>
              <p className="text-xl text-gray-600 mb-2">
                  Scor: <span className="font-bold text-blue-600">{testSession.score}</span> din {testSession.total}
              </p>
              <p className="text-md text-gray-500">Timp de rezolvare: {formatTime(testSession.duration)}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 print:bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Întrebare</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Răspunsul tău</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Răspuns corect</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testSession.answers.map((ans, i) => (
                    <tr key={ans.id} className={ans.isCorrect ? "bg-green-100 print:bg-green-100" : "bg-red-100 print:bg-red-100"}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-500">{i + 1}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <span className="font-semibold text-xs text-gray-500 block mb-1">{ans.question.chapter}</span>
                        {ans.question.text}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                        {ans.userAnswer}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {getCorrectText(ans.question)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>

      </div>
    </div>
  )
}
