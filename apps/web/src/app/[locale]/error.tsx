'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-xl font-medium text-[#2C2C2C] mb-4">
          Something went wrong
        </h2>
        <p className="text-sm text-[#888888] mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-[#7B5EA7] text-white rounded-xl px-6 py-3"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
