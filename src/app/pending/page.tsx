"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function PendingApproval() {
  const { data: session } = useSession()
  const userEmail = session?.user?.email || "adresa_ta_de_email@exemplu.com"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-blue-600">

          <div className="text-center mb-8">
             <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
               Activează-ți Accesul Complet
             </h2>
             <p className="text-lg text-gray-600 mb-4">
               <small>Pentru a debloca setul complet de 45 de întrebări, cronometrul și istoricul detaliat, este necesară achitarea licenței.</small>
             </p>
              <p className="mb-2">
                 <small><span className="font-semibold">Pasul următor:</span> După efectuarea transferului, echipa noastră va verifica tranzacția și va activa contul. Procesarea se face de regulă în 24 de ore, imediat ce plata devine vizibilă. Vei primi un email de confirmare când contul tău devine activ.</small>
              </p>
              <p className="mb-2">
                 <small><span className="font-semibold">*IMPORTANT:</span> Numele și Prenumele trebuie să coincidă cu Nume Prenume furnizate la crearea contului.</small>
              </p>
              <p>
                <small><span className="font-semibold">Date FACTURARE:</span> La detalii plată, în momentul transferului, vă rugăm să menționați detalii pentru factură.</small>
              </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
             <div className="flex items-center justify-center mb-6">
                 <span className="text-2xl font-bold text-gray-900 mr-2">Cost acces:</span>
                 <span className="text-3xl font-extrabold text-blue-700">80 lei</span>
                 <span className="text-gray-500 ml-2 font-medium">(plată unică)</span>
             </div>

             <div className="bg-white rounded p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Te rugăm să efectuezi transferul în următorul cont:</h3>

                <ul className="space-y-4 text-gray-700">
                   <li className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-semibold w-40 text-gray-900">Nume Beneficiar:</span>
                      <span className="">Ciofu Maria Alexandra PFA</span>
                   </li>
                   <li className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-semibold w-40 text-gray-900">IBAN:</span>
                      <span className="font-bold text-lg tracking-wider">RO60 RZBR 0000 0600 1051 9448</span>
                   </li>
                   <li className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-semibold w-40 text-gray-900">Bancă:</span>
                      <span>Raiffeisen Bank</span>
                   </li>
                   <li className="flex flex-col sm:flex-row sm:items-center pt-2 border-t border-dashed">
                      <span className="font-bold text-red-600 w-40">Detalii plată / Referință (Obligatoriu):</span>
                      <span className="font-bold text-red-700 bg-red-50 px-2 py-1 rounded select-all">platformă testare Nume Prenume*</span>
                   </li>
                </ul>
             </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              &larr; Înapoi la pagina principală
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
