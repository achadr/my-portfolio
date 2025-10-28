'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error)
    }
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-8">
          We apologize for the inconvenience. An error has occurred.
        </p>
        <button
          onClick={() => reset()}
          className="bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-950 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
