export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const spinner = (
    <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} role="status" aria-label="Loading" />
  )

  if (fullPage) {
    return (
      <div className="loading-screen">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {spinner}
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Loading...</span>
        </div>
      </div>
    )
  }

  return spinner
}
