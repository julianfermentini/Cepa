import { useEffect, useState } from 'react'

const SEEN_KEY = 'cepa_welcome_seen'
const DURATION_MS = 2200

export default function WelcomeSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    return !sessionStorage.getItem(SEEN_KEY)
  })

  useEffect(() => {
    if (!visible) return
    sessionStorage.setItem(SEEN_KEY, '1')
    const t = setTimeout(() => setVisible(false), DURATION_MS)
    return () => clearTimeout(t)
  }, [visible])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none select-none"
      style={{
        background:
          'radial-gradient(ellipse at center, #2d0a10 0%, #1a0408 60%, #0d0205 100%)',
        animation: `cepa-splash-bg ${DURATION_MS}ms ease-out forwards`,
      }}
    >
      <div
        className="flex flex-col items-center gap-6"
        style={{
          animation: `cepa-splash-content ${DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
        }}
      >
        <img
          src="/img/iconoCEPA.png"
          alt="Cepa"
          draggable={false}
          className="select-none"
          style={{
            width: 'clamp(12rem, 28vw, 22rem)',
            height: 'auto',
            filter: 'drop-shadow(0 10px 40px rgba(212,175,55,0.25))',
          }}
        />
        <div
          className="h-px w-28"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(212,175,55,0.7), transparent)',
            animation: `cepa-splash-line ${DURATION_MS}ms ease-out forwards`,
            transformOrigin: 'center',
          }}
        />
      </div>
    </div>
  )
}
