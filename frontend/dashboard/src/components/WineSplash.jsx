import { useEffect, useState } from 'react'

const DURATION_MS = 1900

export default function WineSplash() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none select-none overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at center, #8F202C 0%, #5A1A24 55%, #0E0E10 100%)',
        animation: `cepa-wine-splash-bg ${DURATION_MS}ms ease-out forwards`,
      }}
    >
      <div
        className="flex flex-col items-center gap-5"
        style={{
          animation: `cepa-wine-splash-content ${DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
        }}
      >
        <h1
          className="font-grotesk font-bold leading-none text-white"
          style={{
            fontSize: 'clamp(4.5rem, 18vw, 10rem)',
            letterSpacing: '0.18em',
            textShadow: '0 4px 40px rgba(0,0,0,0.25)',
          }}
        >
          CEPA
        </h1>
        <div
          className="h-px w-24"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(255,255,255,0.75), transparent)',
            animation: `cepa-wine-splash-line ${DURATION_MS}ms ease-out forwards`,
            transformOrigin: 'center',
          }}
        />
      </div>
    </div>
  )
}
