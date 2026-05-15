"use client"

import { useState } from "react"
import { UploadCloud } from "lucide-react"

export default function AdminQuestions() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        setFile(null)
      } else {
        setMessage({ text: data.message || "A apărut o eroare la import", type: 'error' })
      }
    } catch (err) {
      setMessage({ text: "A apărut o eroare de rețea", type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Importă Întrebări (CSV)</h2>

      <p className="text-sm text-gray-500 mb-6">
        Fișierul CSV trebuie să conțină următoarele coloane (numele exact pe primul rând):<br/>
        <strong>Id, Capitol, Intrebare, A, B, C, D, E, Raspuns corect</strong>
      </p>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Apasă pentru a încărca</span> sau trage un fișier
              </p>
              <p className="text-xs text-gray-500">CSV (MAX. 10MB)</p>
            </div>
            <input id="dropzone-file" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {file && <p className="text-sm text-gray-600">Fișier selectat: {file.name}</p>}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Se importă..." : "Importă datele"}
        </button>
      </form>
    </div>
  )
}
