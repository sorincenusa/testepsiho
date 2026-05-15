"use client"

import { useState, useEffect } from "react"
import { Check, X, Shield } from "lucide-react"

type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users")
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  const updateUser = async (userId: string, data: { status?: string; role?: string }) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...data }),
    })

    if (res.ok) {
      fetchUsers()
    } else {
      alert("Eroare la actualizare")
    }
  }

  if (loading) return <div>Se încarcă...</div>

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.id}>
            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-600 truncate">{user.name || "Fără Nume"}</p>
                <p className="flex items-center text-sm text-gray-500">
                  {user.email}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  user.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.status === 'APPROVED' ? 'Aprobat' :
                   user.status === 'REJECTED' ? 'Respins' : 'În Așteptare'}
                </span>

                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>

                {user.status === 'PENDING' && (
                  <div className="flex space-x-2">
                    <button onClick={() => updateUser(user.id, { status: 'APPROVED' })} className="text-green-600 hover:text-green-900" title="Aprobă">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => updateUser(user.id, { status: 'REJECTED' })} className="text-red-600 hover:text-red-900" title="Respinge">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {user.role !== 'ADMIN' && (
                  <button onClick={() => updateUser(user.id, { role: 'ADMIN' })} className="text-purple-600 hover:text-purple-900" title="Promovează Admin">
                    <Shield className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
        {users.length === 0 && (
          <li className="px-4 py-4 sm:px-6 text-center text-gray-500">Nu există utilizatori</li>
        )}
      </ul>
    </div>
  )
}
