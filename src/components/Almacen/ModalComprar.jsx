import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import comprasService from '../../services/compras.js'
import '../Style/almacen.css'
import '../Style/forms.css'

const hoy = () => new Date().toISOString().slice(0, 10)

// Formulario de alta de compra. Si viene productoId, el producto va fijo
// (desde "Comprar más" del detalle); si no, se elige en un desplegable.
const ModalComprar = ({ productos = [], productoId = '', onCerrar, onGuardado }) => {
  const [form, setForm] = useState({
    producto_id: productoId || '',
    fecha: hoy(),
    cantidad: '',
    precio_unitario: '',
    proveedor: '',
    albaran: '',
    notas: '',
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const alPulsar = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [onCerrar])

  const set = (campo) => (e) => setForm(f => ({ ...f, [campo]: e.target.value }))
  const prodFijo = productoId ? productos.find(p => String(p.id) === String(productoId)) : null

  const enviar = (e) => {
    e.preventDefault()
    if (!form.producto_id || !(Number(form.cantidad) > 0)) {
      setError('Indica el producto y una cantidad mayor que cero.')
      return
    }
    setGuardando(true)
    setError('')
    comprasService.registrarCompra({
      producto_id: form.producto_id,
      fecha: form.fecha,
      cantidad: Number(form.cantidad),
      precio_unitario: form.precio_unitario === '' ? null : Number(form.precio_unitario),
      proveedor: form.proveedor || null,
      albaran: form.albaran || null,
      notas: form.notas || null,
    })
      .then(res => { onGuardado?.(res); onCerrar() })
      .catch(err => setError(err.response?.data?.mensaje || 'No se pudo registrar la compra.'))
      .finally(() => setGuardando(false))
  }

  return (
    <div className="fondo-modal" onClick={onCerrar}>
      <div className="alm-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="alm-modal-head">
          <div>
            <h2>Registrar compra</h2>
            {prodFijo && <div className="cat">{prodFijo.nombre}</div>}
          </div>
          <button className="alm-modal-cerrar" onClick={onCerrar} aria-label="Cerrar" title="Cerrar"><X /></button>
        </div>

        <form className="alm-form" onSubmit={enviar}>
          {!productoId && (
            <div className="form-grupo full">
              <label>Producto</label>
              <select value={form.producto_id} onChange={set('producto_id')}>
                <option value="">Selecciona…</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          )}
          <div className="form-grupo"><label>Fecha</label><input type="date" value={form.fecha} onChange={set('fecha')} /></div>
          <div className="form-grupo"><label>Cantidad</label><input type="number" step="0.01" min="0" value={form.cantidad} onChange={set('cantidad')} /></div>
          <div className="form-grupo"><label>Precio unitario (€)</label><input type="number" step="0.01" min="0" value={form.precio_unitario} onChange={set('precio_unitario')} /></div>
          <div className="form-grupo"><label>Proveedor</label><input type="text" maxLength={150} value={form.proveedor} onChange={set('proveedor')} /></div>
          <div className="form-grupo"><label>Albarán</label><input type="text" maxLength={50} value={form.albaran} onChange={set('albaran')} /></div>
          <div className="form-grupo full"><label>Notas</label><textarea rows={2} value={form.notas} onChange={set('notas')} /></div>

          {error && <span className="mensaje-error full">{error}</span>}

          <div className="form-actions full">
            <button type="button" className="btn-cancel" onClick={onCerrar}>Cancelar</button>
            <button type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Registrar compra'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalComprar
