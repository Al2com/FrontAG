import { useState, useEffect } from 'react'
import gastosRiegoService from '../services/gastosRiego'
import FormGastoRiego from './CreateForm/FormGastoRiego'
import Modal from './Modal/Modal.jsx'
import './Style/cards.css'

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const GestionRiego = ({ onVolver = null }) => {
  const [gastos, setGastos] = useState([])
  const [error, setError] = useState('')
  const [filtroParcela, setFiltroParcela] = useState('todas')
  const [filtroAnio, setFiltroAnio] = useState('todos')
  const [mostrarTabla, setMostrarTabla] = useState(false)
  const [modal, setModal] = useState(null) // null | 'nuevo' | { inicial }
  // recibo pendiente de confirmar su borrado (null = no hay modal)
  const [reciboABorrar, setReciboABorrar] = useState(null)

  const cargar = () => {
    setError('')
    gastosRiegoService.listar()
      .then(data => setGastos(data))
      .catch(() => setError('Error al cargar los gastos de riego'))
  }

  useEffect(() => { cargar() }, [])

  const nombreParcela = (g) =>
    g.parcela?.nombre || `Pol. ${g.parcela?.poligono} - Par. ${g.parcela?.parcela}`

  // agrupo los apuntes por parcela + mes + año: cada recibo es un card/fila
  const recibos = {}
  gastos.forEach(g => {
    const key = `${g.parcela_id}-${g.anio}-${g.mes}`
    if (!recibos[key]) {
      recibos[key] = {
        key,
        parcela_id: g.parcela_id,
        parcela_nombre: nombreParcela(g),
        rol: g.parcela?.rol ?? null,
        anio: g.anio,
        mes: g.mes,
        lineas: [],
        ids: [],
        total: 0,
      }
    }
    recibos[key].lineas.push({ concepto: g.concepto, importe: Number(g.importe) })
    recibos[key].ids.push(g.id)
    recibos[key].total += Number(g.importe)
  })

  let listaRecibos = Object.values(recibos)
  if (filtroParcela !== 'todas') listaRecibos = listaRecibos.filter(r => String(r.parcela_id) === String(filtroParcela))
  if (filtroAnio !== 'todos') listaRecibos = listaRecibos.filter(r => String(r.anio) === String(filtroAnio))
  listaRecibos.sort((a, b) => b.anio - a.anio || b.mes - a.mes)

  const parcelasUnicas = [...new Map(gastos.map(g => [g.parcela_id, nombreParcela(g)])).entries()]
  const aniosUnicos = [...new Set(gastos.map(g => g.anio))].sort((a, b) => b - a)

  // abre el modal de confirmacion
  const borrarRecibo = (recibo) => {
    setReciboABorrar(recibo)
  }

  // el usuario confirma en el modal y se borra de verdad
  const confirmarBorrarRecibo = () => {
    if (!reciboABorrar) return
    Promise.all(reciboABorrar.ids.map(id => gastosRiegoService.borrar(id)))
      .then(() => { cargar(); setReciboABorrar(null) })
      .catch(() => { setError('No se pudo borrar el recibo'); setReciboABorrar(null) })
  }

  const editarRecibo = (recibo) => {
    const inicial = {
      parcela_id: recibo.parcela_id,
      parcela_nombre: recibo.parcela_nombre,
      rol: recibo.rol,
      anio: recibo.anio,
      mes: recibo.mes,
      agua: recibo.lineas.find(l => l.concepto === 'agua')?.importe ?? '',
      abono: recibo.lineas.find(l => l.concepto === 'abono')?.importe ?? '',
      mantenimiento: recibo.lineas.find(l => l.concepto === 'mantenimiento')?.importe ?? '',
    }
    setModal({ inicial })
  }

  const detalleTexto = (recibo) =>
    recibo.lineas.map(l => `${l.concepto}: ${l.importe.toFixed(2)} €`).join(' · ')

  return (
    <div className="rentabilidad-contenedor">
      <div className="menuExplo">
        <div className="menu-button" style={{ gap: '10px' }}>
          {onVolver && <button type="button" onClick={onVolver}>Atrás</button>}
          <button type="button" onClick={() => setModal('nuevo')}>+ Añadir riego</button>
          <div className="separador-btn"></div>
          <button
            className={`btn-vista ${mostrarTabla ? 'activo' : ''}`}
            onClick={() => setMostrarTabla(!mostrarTabla)}
          >
            <img src={mostrarTabla ? './iconTable.png' : './cuadrado.png'} alt="vista" />
            {mostrarTabla ? 'Tarjetas' : 'Tabla'}
          </button>
        </div>
      </div>

      <h3 className="rentabilidad-titulo-seccion">Goteo y mantenimiento</h3>

      <div className="menu-button" style={{ gap: '10px', marginBottom: '12px' }}>
        <select value={filtroParcela} onChange={e => setFiltroParcela(e.target.value)}>
          <option value="todas">Todas las parcelas</option>
          {parcelasUnicas.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
        </select>
        <select value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)}>
          <option value="todos">Todos los años</option>
          {aniosUnicos.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {error && <span className="mensaje-error">{error}</span>}

      {listaRecibos.length === 0 && !error && (
        <p style={{ color: 'var(--c-texto-apagado)' }}>Todavía no hay recibos de riego.</p>
      )}

      {/* VISTA TABLA */}
      {mostrarTabla && listaRecibos.length > 0 && (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Parcela</th>
              <th>Periodo</th>
              <th>Detalle</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaRecibos.map(recibo => (
              <tr key={recibo.key}>
                <td style={{ textTransform: 'capitalize' }}>
                  {recibo.parcela_nombre}{recibo.rol ? ` · ${recibo.rol}` : ''}
                </td>
                <td>{meses[recibo.mes - 1]} {recibo.anio}</td>
                <td className="detalle-fechas" style={{ textTransform: 'capitalize' }}>{detalleTexto(recibo)}</td>
                <td>{recibo.total.toFixed(2)} €</td>
                <td>
                  <div className="tabla-botones">
                    <button type="button" onClick={() => editarRecibo(recibo)}>Editar</button>
                    <button type="button" className="btn-eliminar" onClick={() => borrarRecibo(recibo)}>Borrar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* VISTA TARJETAS */}
      {!mostrarTabla && listaRecibos.map(recibo => (
        <div key={recibo.key} className="rentabilidad-card">
          <div className="rentabilidad-cabecera">
            <div className="rentabilidad-cabecera-izq">
              <img src="./parcela.svg" alt="parcela" />
              <h4>{recibo.parcela_nombre}</h4>
            </div>
            <div className="rentabilidad-cabecera-der">
              <span className="rentabilidad-coste">{recibo.total.toFixed(2)} €</span>
            </div>
          </div>

          <div className="rentabilidad-resumen">
            <span>{meses[recibo.mes - 1]} {recibo.anio}</span>
            {recibo.rol && <span style={{ textTransform: 'capitalize' }}>{recibo.rol}</span>}
          </div>

          <div className="rentabilidad-desplegable">
            {recibo.lineas.map((l, i) => (
              <div key={i} className="rentabilidad-fila-parcela">
                <span style={{ textTransform: 'capitalize' }}>{l.concepto}</span>
                <span>{l.importe.toFixed(2)} €</span>
              </div>
            ))}

            <div className="menu-button" style={{ gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={() => editarRecibo(recibo)}>Editar</button>
              <button type="button" className="btn-eliminar" onClick={() => borrarRecibo(recibo)}>Borrar</button>
            </div>
          </div>
        </div>
      ))}

      {/* modal de confirmacion para borrar un recibo */}
      {reciboABorrar && (
        <Modal
          mesajeError={`¿Borrar el recibo de ${reciboABorrar.parcela_nombre} (${meses[reciboABorrar.mes - 1]} ${reciboABorrar.anio})?`}
          cerrarModal={() => setReciboABorrar(null)}
          onConfirmar={confirmarBorrarRecibo}
        />
      )}

      {modal === 'nuevo' && (
        <FormGastoRiego
          onClose={() => setModal(null)}
          onGuardado={() => { cargar(); setModal(null) }}
        />
      )}

      {modal && modal !== 'nuevo' && (
        <FormGastoRiego
          inicial={modal.inicial}
          onClose={() => setModal(null)}
          onGuardado={() => { cargar(); setModal(null) }}
        />
      )}
    </div>
  )
}

export default GestionRiego
