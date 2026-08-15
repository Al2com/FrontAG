import { useState } from 'react'
import riegoMantaService from '../../services/riegoManta'
import Modal from '../Modal/Modal.jsx'

const formatoEuro = (v) => `${Number(v || 0).toFixed(2)} €`

// evento = null (nuevo riego, elige parcelas) o el evento a editar
// (agrupado por lote_id o suelto), con sus filas ya guardadas
const FormRiegoManta = ({ parcelas, evento = null, onClose, onGuardado }) => {
  const esEdicion = !!evento
  const hoy = new Date().toISOString().slice(0, 10)

  const [fecha, setFecha] = useState(evento?.fecha?.slice(0, 10) ?? hoy)
  const [precio, setPrecio] = useState(evento?.precio_por_hanegada ?? '')
  const [parcelaIds, setParcelaIds] = useState(
    evento ? evento.filas.map(f => f.parcela_id) : []
  )
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [modalConfirm, setModalConfirm] = useState(false)

  const togglePartcela = (id) => {
    setParcelaIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // en edicion las hanegadas son las YA guardadas (histórico); en creación,
  // las actuales de la parcela seleccionada
  const importeEstimado = esEdicion
    ? evento.filas.reduce((acc, f) => acc + Number(f.hanegadas) * Number(precio || 0), 0)
    : parcelaIds.reduce((acc, id) => {
      const p = parcelas.find(pp => pp.id === id)
      return acc + (p ? Number(p.dimension_hanegadas) * Number(precio || 0) : 0)
    }, 0)

  const validar = () => {
    setError('')
    if (!fecha) { setError('Elige una fecha'); return false }
    if (precio === '' || Number(precio) < 0) { setError('Indica el precio por hanegada'); return false }
    if (!esEdicion && parcelaIds.length === 0) { setError('Marca al menos una parcela'); return false }
    return true
  }

  const guardar = () => {
    if (!validar()) return
    setModalConfirm(true)
  }

  const confirmarGuardar = () => {
    setModalConfirm(false)
    setError(''); setMensaje('')

    const accion = esEdicion
      ? (evento.lote_id
        ? riegoMantaService.actualizarLote(evento.lote_id, { fecha, precio_por_hanegada: Number(precio) })
        : riegoMantaService.actualizar(evento.filas[0].id, { fecha, precio_por_hanegada: Number(precio) }))
      : riegoMantaService.guardar({ fecha, precio_por_hanegada: Number(precio), parcela_ids: parcelaIds })

    accion
      .then(() => {
        setMensaje('Guardado correctamente')
        if (onGuardado) onGuardado()
      })
      .catch(err => {
        const msg = err.response?.data?.errors
          ? Object.values(err.response.data.errors)[0][0]
          : 'No se pudo guardar el riego'
        setError(msg)
      })
  }

  return (
    <div style={overlay}>
      <div style={caja}>
        <h3 style={{ marginTop: 0 }}>{esEdicion ? 'Editar riego a manta' : 'Añadir riego a manta'}</h3>

        <label>Fecha</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={input} />

        <label>Precio por hanegada (€)</label>
        <input
          type="number" step="0.01" min="0" value={precio}
          onChange={e => setPrecio(e.target.value)} style={input} placeholder="Ej: 8.50"
        />

        {esEdicion ? (
          <>
            <label>Parcelas de este riego</label>
            <ul style={{ margin: '4px 0 8px', paddingLeft: '18px' }}>
              {evento.filas.map(f => {
                const p = parcelas.find(pp => pp.id === f.parcela_id)
                return <li key={f.id}>{p?.nombre ?? `Parcela ${f.parcela_id}`} · {f.hanegadas} hanegadas</li>
              })}
            </ul>
          </>
        ) : (
          <>
            <label>Parcelas a manta</label>
            <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--c-borde)', borderRadius: '6px', padding: '6px', marginBottom: '8px' }}>
              {parcelas.length === 0 && <p style={{ margin: 0, fontSize: '13px' }}>No hay parcelas a manta.</p>}
              {parcelas.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', fontWeight: 400 }}>
                  <input
                    type="checkbox"
                    checked={parcelaIds.includes(p.id)}
                    onChange={() => togglePartcela(p.id)}
                  />
                  {p.nombre || `Pol. ${p.poligono} - Par. ${p.parcela}`} ({p.dimension_hanegadas} han.)
                </label>
              ))}
            </div>
          </>
        )}

        <div style={{ fontSize: '13px', color: 'var(--c-texto-apagado)', marginBottom: '8px' }}>
          Importe estimado: <strong>{formatoEuro(importeEstimado)}</strong>
          {!esEdicion && parcelaIds.length > 1 && ` (repartido entre ${parcelaIds.length} parcelas)`}
        </div>

        {error && <p style={{ color: '#dc3545', margin: '6px 0' }}>{error}</p>}
        {mensaje && <p style={{ color: '#1B4332', margin: '6px 0' }}>{mensaje}</p>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button type="button" onClick={guardar}>Guardar</button>
          <button type="button" onClick={onClose} className="btn-cancel">Cerrar</button>
        </div>
      </div>

      {modalConfirm && (
        <Modal
          mesajeError={esEdicion ? '¿Guardar los cambios de este riego?' : `¿Registrar este riego para ${parcelaIds.length} parcela(s)?`}
          cerrarModal={() => setModalConfirm(false)}
          onConfirmar={confirmarGuardar}
        />
      )}
    </div>
  )
}

const overlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.4)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000
}
const caja = {
  background: '#fff', padding: '24px', borderRadius: '10px',
  width: '380px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto',
  display: 'flex', flexDirection: 'column', gap: '2px'
}
const input = { width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }

export default FormRiegoManta
