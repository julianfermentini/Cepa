import { useEffect, useState } from 'react'
import { Wine } from 'lucide-react'

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
        <Wine className="w-12 h-12 text-gold-400" strokeWidth={1.4} />
        <h1
          className="font-serif font-semibold leading-none"
          style={{
            fontSize: 'clamp(4rem, 14vw, 9rem)',
            background:
              'linear-gradient(135deg, #f0d98a 0%, #d4af37 45%, #9a7a22 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          CEPA
        </h1>
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
