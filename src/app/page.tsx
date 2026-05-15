"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

type Question = {
  id: string
  chapter: string
  text: string
  options: string[]
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      if (session?.user?.status === "PENDING") {
        router.push("/pending")
      }
    }
  }, [status, session, router])

  const startQuiz = async () => {
    setLoading(true)
    setError("")
    setResults(null)
    setAnswers({})

    try {
      const res = await fetch("/api/quiz")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Eroare la încărcarea întrebărilor")
      }

      setQuestions(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const submitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Te rugăm să răspunzi la toate întrebările înainte de a trimite.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      })

      const data = await res.json()
      if (res.ok) {
        setResults(data)
        setQuestions([])
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert("A apărut o eroare la trimitere.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") return <div className="p-8 text-center">Se încarcă...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white rounded-lg shadow px-6 py-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platformă Chestionare</h1>
            <p className="text-sm text-gray-500">Salut, {session.user.name || session.user.email}!</p>
          </div>
          <div className="flex space-x-4 items-center">
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Panou Admin
              </Link>
            )}
            <button onClick={() => signOut()} className="text-sm text-red-600 hover:text-red-800 font-medium">
              Deconectare
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {!loading && questions.length === 0 && !results && (
          <div className="bg-white rounded-lg shadow px-6 py-12 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Ești gata să începi un nou test?</h2>
            <button
              onClick={startQuiz}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Start Chestionar (45 Întrebări)
            </button>
          </div>
        )}

        {loading && <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Se procesează...</p></div>}

        {questions.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow px-6 py-4 mb-6 sticky top-0 z-10 flex justify-between items-center">
               <span className="font-semibold text-gray-700">Progres: {Object.keys(answers).length} / {questions.length}</span>
               <button
                  onClick={submitQuiz}
                  className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
                >
                  Trimite Răspunsurile
               </button>
            </div>

            {questions.map((q, index) => (
              <div key={q.id} className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 uppercase last:mr-0 mr-1">
                    {q.chapter}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{index + 1}. {q.text}</h3>

                <div className="space-y-3">
                  {q.options.map((opt, i) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <div
                        key={i}
                        onClick={() => handleSelectAnswer(q.id, opt)}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "hover:bg-gray-50 border-gray-300 text-gray-700"
                        }`}
                      >
                        {opt}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {results && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-8 text-center border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Rezultate Chestionar</h2>
              <p className="text-xl text-gray-600">Ai răspuns corect la <span className="font-bold text-green-600">{results.correctCount}</span> din {results.totalCount} întrebări.</p>
              <button onClick={startQuiz} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Începe un nou test</button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Întrebare</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Răspunsul tău</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Răspuns corect</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.results.map((r: any, i: number) => (
                    <tr key={r.questionId} className={r.isCorrect ? "bg-green-50" : "bg-red-50"}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="font-semibold text-xs text-gray-500 block mb-1">{r.chapter}</span>
                        {r.text}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{r.userAnswer}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{r.correctAnswer}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {r.isCorrect ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Corect</span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Incorect</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
