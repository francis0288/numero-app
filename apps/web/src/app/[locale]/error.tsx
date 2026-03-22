'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '32px 24px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400, color: 'var(--color-dark)', margin: '0 0 12px' }}>
          Có lỗi xảy ra
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-mid)', margin: '0 0 24px', fontFamily: 'var(--font-ui)' }}>
          {error.message}
        </p>
        <button
          onClick={reset}
          style={{
            backgroundColor: 'var(--color-gold)',
            color: 'white',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
          }}
        >
          Thử lại
        </button>
      </div>
    </div>
  )
}
