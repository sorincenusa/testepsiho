import Link from "next/link"

export default function PendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          În așteptarea aprobării
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Contul tău a fost creat cu succes, dar trebuie să fie aprobat de un administrator înainte de a te putea conecta și a accesa chestionarele.
        </p>
        <div className="mt-6">
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Înapoi la pagina de autentificare
          </Link>
        </div>
      </div>
    </div>
  )
}
