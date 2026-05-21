// import { useEffect, useState } from 'react';
// import tareasService from '../services/tareas';
// import parcelasService from '../services/parcelas';
// import './Style/cards.css';

// const Rentabilidad = () => {

//   const [operaciones, setOperaciones] = useState([])
//   const [fumigaciones, setFumigaciones] = useState([])
//   const [parcelas, setParcelas] = useState([])
//   const [errorCarga, setErrorCarga] = useState('')

//   useEffect(() => {
//     tareasService.getLista()
//       .then(data => {
//         setOperaciones(data.operaciones)
//         setFumigaciones(data.fumigaciones)
//       })
//       .catch(() => setErrorCarga('Error al cargar las tareas'))

//     parcelasService.getResumenP()
//       .then(data => setParcelas(data))
//       .catch(() => setErrorCarga('Error al cargar las parcelas'))
//   }, [])

//   // Coste de una operacion: duracion en horas * 10€
//   const costeOperacion = (op) => {
//     return (op.duracion_minutos / 60) * 10
//   }

//   // Coste de una fumigacion: tractor 50€ fija, mochila duracion en horas * 10€
//   const costeFumigacion = (fum) => {
//     if (fum.metodo_aplicacion === 'tractor') return 50
//     return (fum.duracion_minutos / 60) * 10
//   }

//   // Suma los costes de cada parcela
//   const costesPorParcela = () => {
//     const costes = {}

//     operaciones.forEach(op => {
//       if (!costes[op.parcela_id]) costes[op.parcela_id] = 0
//       costes[op.parcela_id] += costeOperacion(op)
//     })

//     fumigaciones.forEach(fum => {
//       if (!costes[fum.parcela_id]) costes[fum.parcela_id] = 0
//       costes[fum.parcela_id] += costeFumigacion(fum)
//     })

//     return costes
//   }

//   // Agrupa los costes por explotacion sumando los de sus parcelas
//   const costesPorExplotacion = (porParcela) => {
//     const costes = {}

//     parcelas.forEach(parcela => {
//       const nombreExplo = parcela.explotacion?.nombre || 'Sin explotación'
//       if (!costes[nombreExplo]) costes[nombreExplo] = 0
//       costes[nombreExplo] += porParcela[parcela.id] || 0
//     })

//     return costes
//   }

//   const porParcela = costesPorParcela()
//   const porExplotacion = costesPorExplotacion(porParcela)

//   return (
//     <div>
//       <div className="menuExplo">
//         <div>
//           <h2>Rentabilidad</h2>
//           <p>Coste estimado por parcela y explotación</p>
//         </div>
//       </div>

//       {errorCarga && <span className="mensaje-error">{errorCarga}</span>}

//       {/* Por explotacion */}
//       <h3 style={{ padding: '10px' }}>Por Explotación</h3>
//       {Object.entries(porExplotacion).map(([nombre, coste]) => (
//         <div key={nombre} className="explotacionCard">
//           <h4>{nombre}</h4>
//           <p><strong>Coste total:</strong> {coste.toFixed(2)} €</p>
//         </div>
//       ))}

//       {/* Por parcela */}
//       <h3 style={{ padding: '10px' }}>Por Parcela</h3>
//       {parcelas.map(parcela => (
//         <div key={parcela.id} className="explotacionCard">
//           <h4>{parcela.nombre || `Polígono ${parcela.poligono} - Parcela ${parcela.parcela}`}</h4>
//           <p><strong>Variedad:</strong> {parcela.variedad}</p>
//           <p><strong>Explotación:</strong> {parcela.explotacion?.nombre}</p>
//           <p><strong>Coste total:</strong> {(porParcela[parcela.id] || 0).toFixed(2)} €</p>
//         </div>
//       ))}

//     </div>
//   )
// }

// export default Rentabilidad
import { useEffect, useState } from 'react';
import tareasService from '../services/tareas';
import parcelasService from '../services/parcelas';
import './Style/cards.css';

const Rentabilidad = () => {
  const [operaciones, setOperaciones] = useState([])
  const [fumigaciones, setFumigaciones] = useState([])
  const [parcelas, setParcelas] = useState([])
  const [errorCarga, setErrorCarga] = useState('')
  const [campañaSeleccionada, setCampañaSeleccionada] = useState(new Date().getFullYear())

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

  // Genera los años disponibles según los datos
  const añosDisponibles = () => {
    const años = new Set()
    operaciones.forEach(op => años.add(new Date(op.hora_inicio).getFullYear()))
    fumigaciones.forEach(fum => años.add(new Date(fum.hora_inicio).getFullYear()))
    return Array.from(años).sort((a, b) => b - a)
  }

  // Filtra por año seleccionado
  const operacionesFiltradas = operaciones.filter(op =>
    new Date(op.hora_inicio).getFullYear() === Number(campañaSeleccionada)
  )
  const fumigacionesFiltradas = fumigaciones.filter(fum =>
    new Date(fum.hora_inicio).getFullYear() === Number(campañaSeleccionada)
  )

  const costeOperacion = (op) => (op.duracion_minutos / 60) * 10
  const costeFumigacion = (fum) => {
    if (fum.metodo_aplicacion === 'tractor') return 50
    return (fum.duracion_minutos / 60) * 10
  }

  const costesPorParcela = () => {
    const costes = {}
    operacionesFiltradas.forEach(op => {
      if (!costes[op.parcela_id]) costes[op.parcela_id] = 0
      costes[op.parcela_id] += costeOperacion(op)
    })
    fumigacionesFiltradas.forEach(fum => {
      if (!costes[fum.parcela_id]) costes[fum.parcela_id] = 0
      costes[fum.parcela_id] += costeFumigacion(fum)
    })
    return costes
  }

  const costesPorExplotacion = (porParcela) => {
    const costes = {}
    parcelas.forEach(parcela => {
      const nombreExplo = parcela.explotacion?.nombre || 'Sin explotación'
      if (!costes[nombreExplo]) costes[nombreExplo] = 0
      costes[nombreExplo] += porParcela[parcela.id] || 0
    })
    return costes
  }

  const porParcela = costesPorParcela()
  const porExplotacion = costesPorExplotacion(porParcela)

  return (
    <div>
      <div className="menuExplo">
        <div>
          <h2>Rentabilidad</h2>
          <p>Coste estimado por parcela y explotación</p>
        </div>

        {/* Filtro campaña */}
        <div className="form-grupo">
          <label htmlFor="campaña">Campaña</label>
          <select
            id="campaña"
            value={campañaSeleccionada}
            onChange={(e) => setCampañaSeleccionada(e.target.value)}
          >
            {añosDisponibles().map(año => (
              <option key={año} value={año}>{año}</option>
            ))}
          </select>
        </div>
      </div>

      {errorCarga && <span className="mensaje-error">{errorCarga}</span>}

      {/* Por explotacion */}
      <h3 style={{ padding: '10px' }}>Por Explotación</h3>
      {Object.entries(porExplotacion).map(([nombre, coste]) => (
        <div key={nombre} className="explotacionCard">
          <h4>{nombre}</h4>
          <p><strong>Coste total:</strong> {coste.toFixed(2)} €</p>
        </div>
      ))}

      {/* Por parcela */}
      <h3 style={{ padding: '10px' }}>Por Parcela</h3>
      {parcelas.map(parcela => (
        <div key={parcela.id} className="explotacionCard">
          <h4>{parcela.nombre || `Polígono ${parcela.poligono} - Parcela ${parcela.parcela}`}</h4>
          <p><strong>Variedad:</strong> {parcela.variedad}</p>
          <p><strong>Explotación:</strong> {parcela.explotacion?.nombre}</p>
          <p><strong>Coste total:</strong> {(porParcela[parcela.id] || 0).toFixed(2)} €</p>
        </div>
      ))}
    </div>
  )
}

export default Rentabilidad