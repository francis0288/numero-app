export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '32px 24px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 48, fontWeight: 300, color: 'var(--color-gold)', margin: '0 0 16px', lineHeight: 1 }}>
          404
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400, color: 'var(--color-dark)', margin: '0 0 8px' }}>
          Không tìm thấy trang
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-mid)', margin: 0, fontFamily: 'var(--font-ui)' }}>
          Trang bạn tìm kiếm không tồn tại.
        </p>
      </div>
    </div>
  )
}
