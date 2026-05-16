
"use client"
import { useEffect } from "react"
export default function ClientPrintButton() {
    return (
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 print:hidden"
        >
          Descarcă PDF / Printează
        </button>
    )
}
