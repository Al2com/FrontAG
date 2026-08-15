import { useState, useEffect } from 'react'
import parcelasService from '../../services/parcelas'
import gastosRiegoService from '../../services/gastosRiego'
import Modal from '../Modal/Modal.jsx'

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const FormGastoRiego = ({ onClose, onGuardado, inicial = null }) => {
  const esEdicion = !!inicial
  const [parcelas, setParcelas] = useState([])
  const [form, setForm] = useState({
    parcela_id: inicial?.parcela_id ?? '',
    anio: inicial?.anio ?? new Date().getFullYear(),
    mes: inicial?.mes ?? (new Date().getMonth() + 1),
    agua: inicial?.agua ?? '',
    abono: inicial?.abono ?? '',
    mantenimiento: inicial?.mantenimiento ?? '',
  })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  // modal de confirmacion para guardar
  const [modalConfirm, setModalConfirm] = useState(false)

  // en edicion no hace falta el desplegable de parcelas
  useEffect(() => {
    if (esEdicion) return
    parcelasService.getResumenP()
      .then(data => setParcelas(data))
      .catch(() => setError('No se pudieron cargar las parcelas'))
  }, [])

  const parcelaSel = parcelas.find(p => p.id === Number(form.parcela_id))
  const rolSel = esEdicion ? inicial?.rol : parcelaSel?.rol
  // el abono solo en parcelas de goteo (en edicion uso el rol que llega en inicial)
  const mostrarAbono = rolSel === 'goteo'
  // el agua es el recibo mensual de goteo; una parcela a manta ya registra su
  // gasto de agua como riego por día (€/hanegada) desde el componente Riego
  const mostrarAgua = rolSel !== 'manta'

  const handle = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // valida y abre el modal de confirmacion
  const guardar = () => {
    setError(''); setMensaje('')
    if (!form.parcela_id) { setError('Elige una parcela'); return }

    const algunImporte = [form.agua, form.abono, form.mantenimiento]
      .some(v => v !== '' && v !== null && Number(v) > 0)
    if (!algunImporte) {
      setError('Mete al menos un importe (agua, abono o mantenimiento)')
      return
    }

    setModalConfirm(true)
  }

  // el usuario confirma en el modal y se guarda de verdad
  const confirmarGuardar = () => {
    setModalConfirm(false)

    const datos = {
      parcela_id: Number(form.parcela_id),
      anio: Number(form.anio),
      mes: Number(form.mes),
      agua: mostrarAgua && form.agua !== '' ? Number(form.agua) : null,
      abono: mostrarAbono && form.abono !== '' ? Number(form.abono) : null,
      mantenimiento: form.mantenimiento === '' ? null : Number(form.mantenimiento),
    }

    gastosRiegoService.guardar(datos)
      .then(() => {
        setMensaje('Guardado correctamente')
        if (onGuardado) onGuardado()
      })
      .catch(err => {
        const msg = err.response?.data?.errors
          ? Object.values(err.response.data.errors)[0][0]
          : 'No se pudo guardar el gasto de riego'
        setError(msg)
      })
  }

  return (
    <div style={overlay}>
      <div style={caja}>
        <h3 style={{ marginTop: 0 }}>{esEdicion ? 'Editar gasto de riego' : 'Añadir gasto de riego'}</h3>

        {esEdicion ? (
          <p style={{ margin: '4px 0 10px' }}>
            <strong>{inicial.parcela_nombre}</strong> · {meses[inicial.mes - 1]} {inicial.anio}
          </p>
        ) : (
          <>
            <label>Parcela</label>
            <select name="parcela_id" value={form.parcela_id} onChange={handle} style={input}>
              <option value="">Selecciona una parcela</option>
              {parcelas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre || `Pol. ${p.poligono} - Par. ${p.parcela}`} ({p.rol})
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Mes</label>
                <select name="mes" value={form.mes} onChange={handle} style={input}>
                  {meses.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Año</label>
                <input type="number" name="anio" value={form.anio} onChange={handle} style={input} />
              </div>
            </div>
          </>
        )}

        {mostrarAgua && (
          <>
            <label>Agua (€)</label>
            <input type="number" name="agua" value={form.agua} onChange={handle} step="0.01" min="0" style={input} placeholder="Ej: 30.00" />
          </>
        )}

        {mostrarAbono && (
          <>
            <label>Abono (€)</label>
            <input type="number" name="abono" value={form.abono} onChange={handle} step="0.01" min="0" style={input} placeholder="Ej: 15.00" />
          </>
        )}

        <label>Mantenimiento (€)</label>
        <input type="number" name="mantenimiento" value={form.mantenimiento} onChange={handle} step="0.01" min="0" style={input} placeholder="Opcional" />

        {error && <p style={{ color: '#dc3545', margin: '6px 0' }}>{error}</p>}
        {mensaje && <p style={{ color: '#1B4332', margin: '6px 0' }}>{mensaje}</p>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button type="button" onClick={guardar}>Guardar</button>
          <button type="button" onClick={onClose} className="btn-cancel">Cerrar</button>
        </div>
      </div>

      {/* modal de confirmacion para guardar el gasto de riego */}
      {modalConfirm && (
        <Modal
          mesajeError={esEdicion ? '¿Guardar los cambios de este recibo?' : '¿Estás seguro de guardar este gasto de riego?'}
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
  width: '360px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '2px'
}
const input = { width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }

export default FormGastoRiego
