import { ReactLenis } from 'lenis/react'

function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={{ 
        lerp: 0.15,        // Molto più reattivo
        duration: 0.8,     
        smoothTouch: true,
        touchMultiplier: 1.5
    }}>
      {children}
    </ReactLenis>
  )
}

export default SmoothScroll