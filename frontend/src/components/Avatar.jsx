const AVATAR_COLORS = [
  ['#09cca9', '#065f46'],
  ['#3b82f6', '#1e3a8a'],
  ['#f59e0b', '#78350f'],
  ['#ef4444', '#7f1d1d'],
  ['#8b5cf6', '#3b0764'],
  ['#ec4899', '#831843'],
  ['#06b6d4', '#164e63'],
  ['#84cc16', '#365314'],
]

function getColor(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export default function Avatar({ name = '?', size = 36, className = '' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const [bg, border] = getColor(name)

  return (
    <div
      className={`avatar ${className}`}
      title={name}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${bg}33, ${border}66)`,
        border: `1.5px solid ${bg}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: '600',
        color: bg,
        fontFamily: 'var(--font-primary)',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {initials || '?'}
    </div>
  )
}
