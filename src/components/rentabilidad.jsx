import { useEffect, useState } from 'react';
import tareasService from '../services/tareas';
import parcelasService from '../services/parcelas';
import './Style/cards.css';
import './Style/search.css';

const Rentabilidad = () => {

  const [operaciones, setOperaciones] = useState([])
  const [fumigaciones, setFumigaciones] = useState([])
  const [parcelas, setParcelas] = useState([])
  const [errorCarga, setErrorCarga] = useState('')
  const [campaña, setCampaña] = useState(new Date().getFullYear().toString())
  const [vistaTabla, setVistaTabla] = useState(false)

  useEffect(() => {
    tareasService.getLista()
      .then(data => {
        setOperaciones(data.operaciones)
        setFumigaciones(data.fumigaciones)
      })
      .catch(() => setErrorCarga('Error al cargar las tareas'))

    parcelasService.getResumenP()
      .then(data => setParcelas(data))
      .catch(() => setErrorCarga('Error al cargar las parcelas'))
  }, [])

  const años = () => {
    const set = new Set()
    operaciones.forEach(op => set.add(op.hora_inicio.substring(0, 4)))
    fumigaciones.forEach(fum => set.add(fum.hora_inicio.substring(0, 4)))
    return Array.from(set).sort((a, b) => b - a)
  }

  // Si campaña es 'todas' muestra todo, si no filtra por año
  const opsFiltradas = campaña === 'todas'
    ? operaciones
    : operaciones.filter(op => op.hora_inicio.startsWith(campaña))

  const fumsFiltradas = campaña === 'todas'
    ? fumigaciones
    : fumigaciones.filter(fum => fum.hora_inicio.startsWith(campaña))

  const costeOp = (op) => op.precio ? Number(op.precio) : (op.duracion_minutos / 60) * 10
  const costeFum = (fum) => {
    if (fum.precio) return Number(fum.precio)
    if (fum.metodo_aplicacion === 'tractor') return 50
    return (fum.duracion_minutos / 60) * 10
  }

  const costePorParcela = {}
  opsFiltradas.forEach(op => {
    costePorParcela[op.parcela_id] = (costePorParcela[op.parcela_id] || 0) + costeOp(op)
  })
  fumsFiltradas.forEach(fum => {
    costePorParcela[fum.parcela_id] = (costePorParcela[fum.parcela_id] || 0) + costeFum(fum)
  })

  const costePorExplotacion = {}
  parcelas.forEach(parcela => {
    const explo = parcela.explotacion?.nombre || 'Sin explotación'
    costePorExplotacion[explo] = (costePorExplotacion[explo] || 0) + (costePorParcela[parcela.id] || 0)
  })

  return (
    <div>
      <div className="menuExplo">
        <div>
          <h2>Rentabilidad</h2>
          <p>Coste estimado por parcela y explotación</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="barra-select">
            <select value={campaña} onChange={(e) => setCampaña(e.target.value)}>
              <option value="todas">Todas</option>
              {años().map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          <div className="barra-select">
            <select
              value={vistaTabla ? 'tabla' : 'tarjeta'}
              onChange={(e) => setVistaTabla(e.target.value === 'tabla')}
            >
              <option value="tarjeta">Tarjetas</option>
              <option value="tabla">Tabla</option>
            </select>
          </div>
        </div>
      </div>

      {errorCarga && <span className="mensaje-error">{errorCarga}</span>}

      <h3 style={{ padding: '10px' }}>Por Explotación</h3>

      {vistaTabla ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Explotación</th>
              <th>Coste total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(costePorExplotacion).map(([nombre, coste]) => (
              <tr key={nombre}>
                <td>{nombre}</td>
                <td>{coste.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        Object.entries(costePorExplotacion).map(([nombre, coste]) => (
          <div key={nombre} className="explotacionCard">
            <h4>{nombre}</h4>
            <p><strong>Coste total:</strong> {coste.toFixed(2)} €</p>
          </div>
        ))
      )}

      <h3 style={{ padding: '10px' }}>Por Parcela</h3>

      {vistaTabla ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Parcela</th>
              <th>Variedad</th>
              <th>Explotación</th>
              <th>Coste total</th>
            </tr>
          </thead>
          <tbody>
            {parcelas.map(parcela => (
              <tr key={parcela.id}>
                <td>{parcela.nombre || `Pol. ${parcela.poligono} - Par. ${parcela.parcela}`}</td>
                <td>{parcela.variedad}</td>
                <td>{parcela.explotacion?.nombre}</td>
                <td>{(costePorParcela[parcela.id] || 0).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        parcelas.map(parcela => (
          <div key={parcela.id} className="explotacionCard">
            <h4>{parcela.nombre || `Polígono ${parcela.poligono} - Parcela ${parcela.parcela}`}</h4>
            <p><strong>Variedad:</strong> {parcela.variedad}</p>
            <p><strong>Explotación:</strong> {parcela.explotacion?.nombre}</p>
            <p><strong>Coste total:</strong> {(costePorParcela[parcela.id] || 0).toFixed(2)} €</p>
          </div>
        ))
      )}
    </div>
  )
}

export default Rentabilidad