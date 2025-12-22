import { ReactLenis } from 'lenis/react'

function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={{ 
        lerp: 0.1, // L'inerzia (più basso è, più è "pesante" e fluido)
        duration: 1.5, 
        smoothTouch: true 
    }}>
      {children}
    </ReactLenis>
  )
}

export default SmoothScroll