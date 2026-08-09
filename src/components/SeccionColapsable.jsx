import { useEffect, useRef, useState } from 'react'
import './Style/seccionColapsable.css'

// Cabecera clicable (botón, accesible por teclado) + contenido que se
// pliega/despliega con una transición suave. El alto real se mide con
// ResizeObserver porque CSS no puede animar max-height hasta "auto": hay que
// animar hacia un valor en px (el alto del contenido), y no fijo, para que
// siga funcionando si el contenido cambia de tamaño (p. ej. al filtrar).
// El observer se limita a suscribirse: no llama a setState de forma síncrona
// en el cuerpo del efecto, solo dentro de su propio callback (async).
const SeccionColapsable = ({ titulo, cantidad, abierta, onToggle, children }) => {
  const contenidoRef = useRef(null)
  const [alturaAbierta, setAlturaAbierta] = useState(0)

  useEffect(() => {
    const el = contenidoRef.current
    if (!el || !abierta) return

    const observer = new ResizeObserver(() => setAlturaAbierta(el.scrollHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [abierta])

  return (
    <div className="seccion-colapsable">
      <button
        type="button"
        className="seccion-colapsable-cabecera"
        onClick={onToggle}
        aria-expanded={abierta}
      >
        <span className={`seccion-colapsable-chevron ${abierta ? 'abierta' : ''}`} aria-hidden="true">▾</span>
        <h2>{titulo} ({cantidad})</h2>
      </button>

      <div className="seccion-colapsable-contenido" style={{ maxHeight: abierta ? `${alturaAbierta}px` : '0px' }}>
        <div ref={contenidoRef} className="seccion-colapsable-interior">
          {children}
        </div>
      </div>
    </div>
  )
}

export default SeccionColapsable
