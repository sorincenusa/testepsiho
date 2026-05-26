"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import DemoQuiz from "@/components/DemoQuiz"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const questionsPerPage = 5

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.status === "PENDING") {
      router.push("/pending")
    }
  }, [status, session, router])

  // Timer logic
  useEffect(() => {
    if (questions.length > 0 && !results && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [questions.length, results, isSubmitting])

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
    const s = (totalSeconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const startQuiz = async () => {
    setLoading(true)
    setError("")
    setResults(null)
    setAnswers({})
    setCurrentPage(0)
    setSecondsElapsed(0)

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
      const confirmSubmit = confirm("Nu ai răspuns la toate întrebările. Ești sigur că vrei să trimiți?")
      if (!confirmSubmit) return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           answers,
           duration: secondsElapsed
        })
      })

      const data = await res.json()
      if (res.ok) {
        router.push(`/history/${data.sessionId}`)
      } else {
        alert(data.message)
        setIsSubmitting(false)
      }
    } catch (err) {
      alert("A apărut o eroare la trimitere.")
      setIsSubmitting(false)
    }
  }

  const totalPages = Math.ceil(questions.length / questionsPerPage)
  const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage)

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(curr => curr + 1)
    window.scrollTo(0,0)
  }

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(curr => curr - 1)
    window.scrollTo(0,0)
  }

  if (status === "loading") return <div className="p-8 text-center">Se încarcă...</div>

  // Landing Page for Unauthenticated Users
  if (status === "unauthenticated") {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
              <header className="bg-white shadow">
                  <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                      <h1 className="text-3xl font-bold text-gray-900">Platformă Chestionare</h1>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">Autentificare</Link>
                          <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-4 py-2 rounded-md transition-colors">Înregistrare</Link>
                      </div>
                  </div>
              </header>
              <main className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto">
                      <h2 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
                          Testează-ți <span className="text-blue-600">Cunoștințele</span>
                      </h2>
                      <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl mb-1">
                          Pregătește-te eficient cu teste generate dinamic. Ai la dispoziție istoricul rezultatelor, rapoarte detaliate și algoritmi care pun accent pe capitolele pe care trebuie să le mai repeți.
                      </p>
                      <p className="mt-0 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl mb-1">
                        <small>Prin înregistrare, ești de acord cu prelucrarea datelor furnizate (nume și adresă de email) exclusiv în scopul accesării platformei de verificare cunoștințe.
Datele tale sunt confidențiale și nu vor fi vândute, distribuite sau transmise către terți fără acordul tău, cu excepția situațiilor prevăzute de lege.
Luăm măsuri rezonabile pentru protejarea și securizarea informațiilor transmise prin intermediul acestui site. Datele vor fi șterse în cursul lunii iulie.
Ai dreptul de a solicita oricând modificarea sau ștergerea datelor tale de contact printr-o cerere transmisă la adresa de email contact@psiho-hub.info</small>
                      </p>
                      <p className="mt-0 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl mb-3">
                        <small>IMPORTANT: Platforma de evaluare poate fi accesată de pe un singur IP</small>
                      </p>
                  </div>

                  <div className="w-full">
                      <DemoQuiz />
                  </div>
              </main>
          </div>
      )
  }

  // Dashboard for Authenticated Users
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white rounded-lg shadow px-6 py-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platformă Chestionare</h1>
            <p className="text-sm text-gray-500">Salut, {session?.user?.name || session?.user?.email}!</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center flex-wrap gap-2">
            <Link href="/history" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Istoric Teste
            </Link>
            {session?.user?.role === "ADMIN" && (
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

        {!loading && questions.length === 0 && !isSubmitting && (
          <div className="bg-white rounded-lg shadow px-6 py-12 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Ești gata să începi un nou test complet?</h2>
            <button
              onClick={startQuiz}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Start Chestionar (45 Întrebări)
            </button>
          </div>
        )}

        {loading && <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Se încarcă întrebările...</p></div>}

        {isSubmitting && <div className="text-center py-12 bg-white rounded-lg shadow"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div><p className="mt-4 text-gray-800 font-medium text-lg">Se procesează rezultatele...</p></div>}

        {questions.length > 0 && !isSubmitting && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow px-6 py-4 mb-6 sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
               <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <span className="font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded">Răspunsuri: {Object.keys(answers).length} / {questions.length}</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded border border-blue-200">Timp: {formatTime(secondsElapsed)}</span>
               </div>
               <span className="font-medium text-gray-500">Pagina {currentPage + 1} din {totalPages}</span>
            </div>

            {currentQuestions.map((q, index) => {
              const globalIndex = currentPage * questionsPerPage + index + 1;
              return (
              <div key={q.id} className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 uppercase last:mr-0 mr-1">
                    {q.chapter}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{globalIndex}. {q.text}</h3>

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

            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-center sm:text-left bg-white p-4 rounded-lg shadow">
                <button
                   onClick={prevPage}
                   disabled={currentPage === 0}
                   className={`px-6 py-2 rounded-md font-medium ${currentPage === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                   Înapoi
                </button>

                {currentPage < totalPages - 1 ? (
                   <button
                     onClick={nextPage}
                     className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                   >
                     Înainte
                   </button>
                ) : (
                   <button
                     onClick={submitQuiz}
                     className="px-8 py-3 bg-green-600 text-white text-lg rounded-md font-bold shadow-md hover:bg-green-700 animate-pulse"
                   >
                     Trimite Răspunsurile
                   </button>
                )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
