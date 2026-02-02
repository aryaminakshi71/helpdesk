import { HeadContent, Scripts } from '@tanstack/react-router'

export function ErrorPage({ error }: { error: Error | unknown }) {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
  const errorStack = error instanceof Error ? error.stack : undefined

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            {import.meta.env.DEV && errorStack && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600">Error Details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  <code>{errorStack}</code>
                </pre>
              </details>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = "/"}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
