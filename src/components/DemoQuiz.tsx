"use client"
import { useState } from "react"
import Link from "next/link"

type Question = {
  id: string
  chapter: string
  text: string
  options: string[]
}

export default function DemoQuiz() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")

  const startQuiz = async () => {
    setLoading(true)
    setError("")
    setResults(null)
    setAnswers({})

    try {
      const res = await fetch("/api/demo")
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
      const confirmSubmit = confirm("Nu ai răspuns la toate întrebările. Ești sigur că vrei să trimiți?")
      if (!confirmSubmit) return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/demo/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      })

      const data = await res.json()
      if (res.ok) {
        setResults(data)
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert("A apărut o eroare la trimitere.")
    } finally {
        setIsSubmitting(false)
    }
  }

  if (loading) {
      return <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Se pregătește demo-ul...</p></div>
  }

  if (isSubmitting) {
      return <div className="text-center py-12 bg-white rounded-lg shadow"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div><p className="mt-4 text-gray-800 font-medium text-lg">Se corectează testul demo...</p></div>
  }

  if (results) {
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-8 max-w-4xl mx-auto">
            <div className="px-6 py-8 text-center border-b border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Rezultat Demo</h2>
                <p className="text-xl text-gray-600 mb-6">Ai răspuns corect la <span className="font-bold text-blue-600">{results.correctCount}</span> din {results.totalCount} întrebări.</p>
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg max-w-lg mx-auto mb-8">
                    <h3 className="text-xl font-bold text-blue-800 mb-2">Vrei să continui?</h3>
                    <p className="text-blue-600 mb-4">Creează-ți un cont pentru a avea acces la setul complet de 45 de întrebări, cronometru și istoric detaliat al testelor.</p>
                    <Link href="/register" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-md font-bold text-lg hover:bg-blue-700 shadow-md">
                        Vreau Acces Complet
                    </Link>
                </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Întrebare</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Răspunsul tău</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Răspuns corect</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.results.map((r: any, i: number) => (
                    <tr key={r.questionId} className={r.isCorrect ? "bg-green-100" : "bg-red-100"}>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <span className="font-semibold text-xs text-gray-500 block mb-1">{r.chapter}</span>
                        {r.text}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                        {r.userAnswer}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {r.correctAnswer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      )
  }

  if (questions.length > 0) {
      return (
          <div className="space-y-6 max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-lg shadow px-6 py-4 mb-6 sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-center sm:text-left">
               <span className="font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded">Răspunsuri: {Object.keys(answers).length} / {questions.length}</span>
               <span className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded border border-blue-200">Mod Demo</span>
            </div>

            {questions.map((q, index) => {
              return (
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
                            ? "bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm"
                            : "hover:bg-gray-50 border-gray-300 text-gray-700"
                        }`}
                      >
                        {opt}
                      </div>
                    )
                  })}
                </div>
              </div>
            )})}

            <div className="flex flex-col sm:flex-row justify-end items-center space-y-4 sm:space-y-0 bg-white text-center sm:text-left w-full p-4 rounded-lg shadow">
                 <button
                     onClick={submitQuiz}
                     className="px-8 py-3 bg-green-600 text-white text-lg rounded-md font-bold shadow-md hover:bg-green-700 animate-pulse"
                   >
                     Trimite Răspunsurile Demo
                 </button>
            </div>
          </div>
      )
  }

  return (
      <div className="text-center mt-8">
        <button
          onClick={startQuiz}
          className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-md shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-transform transform hover:scale-105"
        >
          Încearcă Demo Gratuit
        </button>
      </div>
  )
}
