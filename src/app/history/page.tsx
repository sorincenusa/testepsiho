import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const sessions = await prisma.testSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white rounded-lg shadow px-6 py-4 mb-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 text-center sm:text-left">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Istoric Teste</h1>
            <p className="text-sm text-gray-500">{session.user.name || session.user.email}</p>
          </div>
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Înapoi la pagina principală
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
            {sessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    Nu ai susținut încă niciun test.
                </div>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {sessions.map(s => {
                        const percentage = Math.round((s.score / s.total) * 100);
                        const isPass = percentage >= 80;
                        return (
                            <li key={s.id} className="hover:bg-gray-50 transition-colors">
                                <Link href={`/history/${s.id}`} className="block px-6 py-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 text-center sm:text-left">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">
                                                Test susținut la {new Date(s.createdAt).toLocaleDateString('ro-RO')}
                                            </span>
                                            <span className="text-sm text-gray-500 mt-1">
                                                Ora: {new Date(s.createdAt).toLocaleTimeString('ro-RO')}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {s.score} / {s.total} puncte
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {percentage}%
                                            </span>
                                            <span className="text-gray-400">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>

      </div>
    </div>
  )
}
