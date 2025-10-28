import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link
          href="/"
          className="bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-950 transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
        >
          Go back home
        </Link>
      </div>
    </main>
  )
}
