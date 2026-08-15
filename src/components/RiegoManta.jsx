import { useEffect, useMemo, useState } from 'react'
import parcelasService from '../services/parcelas'
import riegoMantaService from '../services/riegoManta'
import FormRiegoManta from './CreateForm/FormRiegoManta'
import Modal from './Modal/Modal.jsx'
import { colorParcela } from '../utils/colorParcela'
import './Style/riego.css'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const formatoEuro = (v) => `${Number(v || 0).toFixed(2)} €`

// suma "delta" meses a (anio, mes), devolviendo el par normalizado
const sumarMeses = (anio, mes, delta) => {
  const total = (mes - 1) + delta
  const a = anio + Math.floor(total / 12)
  const m = ((total % 12) + 12) % 12 + 1
  return { anio: a, mes: m }
}

// un mes en miniatura: cuadrícula de días con los chips de riego de ese día
const MesCalendario = ({ anio, mes, riegos, infoPorParcela }) => {
  const riegosPorDia = useMemo(() => {
    const mapa = {}
    riegos.forEach(r => {
      const dia = Number(String(r.fecha).slice(8, 10))
      if (!mapa[dia]) mapa[dia] = []
      mapa[dia].push(r)
    })
    return mapa
  }, [riegos])

  // huecos vacíos al principio para alinear con el día de la semana (lunes = 0)
  const primerDiaSemana = (new Date(anio, mes - 1, 1).getDay() + 6) % 7
  const diasEnMes = new Date(anio, mes, 0).getDate()
  const celdas = [
    ...Array(primerDiaSemana).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ]

  return (
    <div className="riego-calendario-mes">
      <h5 className="riego-calendario-titulo">{MESES[mes - 1]} {anio}</h5>
      <div className="riego-calendario-grid">
        {DIAS_SEMANA.map(d => <div key={d} className="riego-calendario-diasemana">{d}</div>)}
        {celdas.map((dia, i) => (
          <div key={i} className={`riego-calendario-dia ${dia === null ? 'riego-calendario-dia-vacia' : ''}`}>
            {dia !== null && (
              <>
                <span className="riego-calendario-numero">{dia}</span>
                <div className="riego-calendario-chips">
                  {(riegosPorDia[dia] || []).map(r => (
                    <span
                      key={r.id}
                      className="riego-calendario-chip"
                      style={{ backgroundColor: infoPorParcela[r.parcela_id]?.color }}
                      title={`${r.parcela?.nombre ?? ''}: ${formatoEuro(r.importe)}`}
                    >
                      {infoPorParcela[r.parcela_id]?.etiqueta}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const RiegoManta = () => {
  const hoy = new Date()
  const [parcelas, setParcelas] = useState([])
  // (anio, mes) del primer mes de la ventana de 3 meses visible
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [riegosPorMes, setRiegosPorMes] = useState({}) // { "anio-mes": [riegos] }
  const [riegosLista, setRiegosLista] = useState([])
  const [modal, setModal] = useState(null) // null | 'nuevo' | { evento }
  const [aBorrar, setABorrar] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    parcelasService.getResumenP()
      .then(data => setParcelas(data.filter(p => p.rol === 'manta').sort((a, b) => a.id - b.id)))
      .catch(() => setError('Error al cargar las parcelas'))
  }, [])

  // los 3 meses que se ven a la vez: el seleccionado y los dos siguientes
  const ventana = useMemo(() => [0, 1, 2].map(i => sumarMeses(anio, mes, i)), [anio, mes])

  const cargarMeses = () => {
    Promise.all(ventana.map(({ anio: a, mes: m }) => riegoMantaService.calendario(a, m)))
      .then(resultados => {
        const mapa = {}
        ventana.forEach(({ anio: a, mes: m }, i) => { mapa[`${a}-${m}`] = resultados[i] })
        setRiegosPorMes(mapa)
      })
      .catch(() => setError('Error al cargar el calendario'))
  }
  useEffect(cargarMeses, [anio, mes])

  const cargarLista = () => {
    riegoMantaService.listar({ anio })
      .then(setRiegosLista)
      .catch(() => setError('Error al cargar el listado de riegos'))
  }
  useEffect(cargarLista, [anio])

  const recargarTodo = () => { cargarMeses(); cargarLista() }

  // color + número estables por parcela: la posición en la lista ordenada por
  // id. El número identifica la parcela en el calendario sin depender solo
  // del color (daltonismo), y coincide con el que se ve en la leyenda
  const infoPorParcela = useMemo(() => {
    const mapa = {}
    parcelas.forEach((p, i) => { mapa[p.id] = { color: colorParcela(i), etiqueta: i + 1 } })
    return mapa
  }, [parcelas])

  // desliza la ventana de 3 meses un mes hacia delante o hacia atrás
  const cambiarVentana = (delta) => {
    const { anio: a, mes: m } = sumarMeses(anio, mes, delta)
    setAnio(a); setMes(m)
  }

  // agrupo el listado por lote_id (o por su propio id si va suelto): un evento = una fila en la lista
  const eventos = useMemo(() => {
    const mapa = {}
    riegosLista.forEach(r => {
      const clave = r.lote_id || `solo-${r.id}`
      if (!mapa[clave]) {
        mapa[clave] = { clave, lote_id: r.lote_id, fecha: r.fecha, precio_por_hanegada: r.precio_por_hanegada, filas: [] }
      }
      mapa[clave].filas.push(r)
    })
    return Object.values(mapa).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
  }, [riegosLista])

  const borrarEvento = (evento) => setABorrar(evento)
  const confirmarBorrar = () => {
    const accion = aBorrar.lote_id
      ? riegoMantaService.borrarLote(aBorrar.lote_id)
      : riegoMantaService.borrar(aBorrar.filas[0].id)
    accion
      .then(() => { recargarTodo(); setABorrar(null) })
      .catch(() => { setError('No se pudo borrar el riego'); setABorrar(null) })
  }

  return (
    <div className="riego-manta">
      <div className="menu-button" style={{ gap: '10px', marginBottom: '12px' }}>
        <button type="button" onClick={() => setModal('nuevo')}>+ Añadir riego</button>
      </div>

      {error && <span className="mensaje-error">{error}</span>}

      {/* leyenda: color + número de cada parcela a manta */}
      <div className="riego-leyenda">
        {parcelas.map((p) => (
          <div className="riego-leyenda-item" key={p.id}>
            <span className="riego-leyenda-swatch" style={{ backgroundColor: infoPorParcela[p.id]?.color }}>{infoPorParcela[p.id]?.etiqueta}</span>
            <span>{p.nombre || `Pol. ${p.poligono} - Par. ${p.parcela}`}</span>
          </div>
        ))}
        {parcelas.length === 0 && !error && <span className="riego-leyenda-vacio">No hay parcelas a manta registradas.</span>}
      </div>

      {/* calendario: 3 meses a la vez para seguir el riego de un vistazo */}
      <div className="rentabilidad-card">
        <div className="riego-calendario-cabecera">
          <button type="button" onClick={() => cambiarVentana(-1)}>‹</button>
          <h4>{MESES[mes - 1]} {anio} – {MESES[ventana[2].mes - 1]} {ventana[2].anio}</h4>
          <button type="button" onClick={() => cambiarVentana(1)}>›</button>
        </div>

        <div className="riego-calendario-ventana">
          {ventana.map(({ anio: a, mes: m }) => (
            <MesCalendario
              key={`${a}-${m}`}
              anio={a}
              mes={m}
              riegos={riegosPorMes[`${a}-${m}`] || []}
              infoPorParcela={infoPorParcela}
            />
          ))}
        </div>
      </div>

      {/* listado de eventos de riego (individuales o en grupo) */}
      <h3 className="rentabilidad-titulo-seccion">Historial de riegos a manta ({anio})</h3>

      {eventos.length === 0 && !error && (
        <p style={{ color: 'var(--c-texto-apagado)' }}>Todavía no hay riegos a manta registrados este año.</p>
      )}

      {eventos.map(evento => {
        const total = evento.filas.reduce((acc, f) => acc + Number(f.importe), 0)
        return (
          <div key={evento.clave} className="rentabilidad-card">
            <div className="rentabilidad-cabecera">
              <div className="rentabilidad-cabecera-izq">
                <img src="./riego.svg" alt="riego" />
                <h4>{String(evento.fecha).slice(0, 10)}</h4>
              </div>
              <div className="rentabilidad-cabecera-der">
                <span className="rentabilidad-coste">{formatoEuro(total)}</span>
              </div>
            </div>
            <div className="rentabilidad-resumen">
              <span>{formatoEuro(evento.precio_por_hanegada)}/hanegada</span>
              <span>{evento.filas.length} parcela{evento.filas.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="rentabilidad-desplegable">
              {evento.filas.map(f => (
                <div className="rentabilidad-fila-parcela" key={f.id}>
                  <span>
                    <span className="riego-leyenda-swatch" style={{ backgroundColor: infoPorParcela[f.parcela_id]?.color, marginRight: '6px' }}>{infoPorParcela[f.parcela_id]?.etiqueta}</span>
                    {f.parcela?.nombre ?? `Parcela ${f.parcela_id}`} ({f.hanegadas} han.)
                  </span>
                  <span>{formatoEuro(f.importe)}</span>
                </div>
              ))}
              <div className="menu-button" style={{ gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModal({ evento })}>Editar</button>
                <button type="button" className="btn-eliminar" onClick={() => borrarEvento(evento)}>Borrar</button>
              </div>
            </div>
          </div>
        )
      })}

      {aBorrar && (
        <Modal
          mesajeError={`¿Borrar el riego del ${String(aBorrar.fecha).slice(0, 10)} (${aBorrar.filas.length} parcela${aBorrar.filas.length !== 1 ? 's' : ''})?`}
          cerrarModal={() => setABorrar(null)}
          onConfirmar={confirmarBorrar}
        />
      )}

      {modal === 'nuevo' && (
        <FormRiegoManta
          parcelas={parcelas}
          onClose={() => setModal(null)}
          onGuardado={() => { recargarTodo(); setModal(null) }}
        />
      )}
      {modal && modal !== 'nuevo' && (
        <FormRiegoManta
          parcelas={parcelas}
          evento={modal.evento}
          onClose={() => setModal(null)}
          onGuardado={() => { recargarTodo(); setModal(null) }}
        />
      )}
    </div>
  )
}

export default RiegoManta
