import { ReactLenis } from 'lenis/react'

function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={{ 
        lerp: 0.08,        // Leggermente più basso per meno "effetto scivolamento"
        duration: 1.0,     // Durata più breve = sensazione più veloce
        smoothTouch: true,
        touchMultiplier: 1.5
    }}>
      {children}
    </ReactLenis>
  )
}

export default SmoothScroll