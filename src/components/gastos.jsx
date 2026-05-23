import { useEffect, useState } from 'react';
import tareasService from '../services/tareas';
import parcelasService from '../services/parcelas';
import './Style/cards.css';

const Gastos = () => {

  const [listaOperaciones, setListaOperaciones] = useState([])
  const [listaFumigaciones, setListaFumigaciones] = useState([])
  const [listaParcelas, setListaParcelas] = useState([])
  const [errorCarga, setErrorCarga] = useState('')
  const [campañaSeleccionada, setCampañaSeleccionada] = useState(new Date().getFullYear().toString())
  const [parcelaAbierta, setParcelaAbierta] = useState(null)
  const [explotacionAbierta, setExplotacionAbierta] = useState(null)

  useEffect(() => {
    tareasService.getLista()
      .then(datos => {
        setListaOperaciones(datos.operaciones)
        setListaFumigaciones(datos.fumigaciones)
      })
      .catch(() => setErrorCarga('Error al cargar las tareas'))

    parcelasService.getResumenP()
      .then(datos => setListaParcelas(datos))
      .catch(() => setErrorCarga('Error al cargar las parcelas'))
  }, [])

  const obtenerAños = () => {
    const años = new Set()
    listaOperaciones.forEach(op => años.add(op.hora_inicio.substring(0, 4)))
    listaFumigaciones.forEach(fum => años.add(fum.hora_inicio.substring(0, 4)))
    return Array.from(años).sort((a, b) => b - a)
  }

  const operacionesFiltradas = campañaSeleccionada === 'todas'
    ? listaOperaciones
    : listaOperaciones.filter(op => op.hora_inicio.startsWith(campañaSeleccionada))

  const fumigacionesFiltradas = campañaSeleccionada === 'todas'
    ? listaFumigaciones
    : listaFumigaciones.filter(fum => fum.hora_inicio.startsWith(campañaSeleccionada))

  const getOperacionesParcela = (parcelaId) =>
    operacionesFiltradas.filter(op => op.parcela_id === parcelaId)

  const getFumigacionesParcela = (parcelaId) =>
    fumigacionesFiltradas.filter(fum => fum.parcela_id === parcelaId)

  const getCosteParcela = (parcelaId) => {
    const gastoOps = getOperacionesParcela(parcelaId).reduce((acc, op) => acc + Number(op.precio || 0), 0)
    const gastoFums = getFumigacionesParcela(parcelaId).reduce((acc, fum) => acc + Number(fum.precio || 0), 0)
    return gastoOps + gastoFums
  }

  const toggleParcela = (parcelaId) =>
    setParcelaAbierta(parcelaAbierta === parcelaId ? null : parcelaId)

  const toggleExplotacion = (nombre) =>
    setExplotacionAbierta(explotacionAbierta === nombre ? null : nombre)

  // agrupa parcelas por explotacion
  const parcelasPorExplotacion = {}
  listaParcelas.forEach(parcela => {
    const nombreExplo = parcela.explotacion?.nombre || 'Sin explotación'
    if (!parcelasPorExplotacion[nombreExplo]) parcelasPorExplotacion[nombreExplo] = []
    parcelasPorExplotacion[nombreExplo].push(parcela)
  })

  return (
    <div className="rentabilidad-contenedor">
      <div className="menuExplo">
        <div>
          <h2>Gastos</h2>
          <p>Gastos por parcela y explotación</p>
        </div>
        <div className="barra-select">
          <select value={campañaSeleccionada} onChange={(e) => setCampañaSeleccionada(e.target.value)}>
            <option value="todas">Todas las campañas</option>
            {obtenerAños().map(año => (
              <option key={año} value={año}>{año}</option>
            ))}
          </select>
        </div>
      </div>

      {errorCarga && <span className="mensaje-error">{errorCarga}</span>}

      {/* por explotacion */}
      <h3 className="rentabilidad-titulo-seccion">Por Explotación</h3>

      {Object.entries(parcelasPorExplotacion).map(([nombreExplo, parcelas]) => {
        const costeExplo = parcelas.reduce((acc, p) => acc + getCosteParcela(p.id), 0)
        const estaAbierta = explotacionAbierta === nombreExplo

        return (
          <div key={nombreExplo} className="rentabilidad-card">
            <div className="rentabilidad-cabecera" onClick={() => toggleExplotacion(nombreExplo)}>
              <div className="rentabilidad-cabecera-izq">
               <img src="./explotaciones.svg" alt="explotacion"/>
                <h4>{nombreExplo}</h4>
              </div>
              <div className="rentabilidad-cabecera-der">
                <span className="rentabilidad-coste">{costeExplo.toFixed(2)} €</span>
                 <img src="./plus.png" alt="plus" />
               
              </div>
            </div>

            {estaAbierta && (
              <div className="rentabilidad-desplegable">
                {parcelas.map(parcela => (
                  <div key={parcela.id} className="rentabilidad-fila-parcela">
                    <span>{parcela.nombre || `Pol. ${parcela.poligono} - Par. ${parcela.parcela}`}</span>
                    <span>{getCosteParcela(parcela.id).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* por parcela */}
      <h3 className="rentabilidad-titulo-seccion">Por Parcela</h3>

      {listaParcelas.map(parcela => {
        const operacionesParcela = getOperacionesParcela(parcela.id)
        const fumigacionesParcela = getFumigacionesParcela(parcela.id)
        const costeOperaciones = operacionesParcela.reduce((acc, op) => acc + Number(op.precio || 0), 0)
        const costeFumigaciones = fumigacionesParcela.reduce((acc, fum) => acc + Number(fum.precio || 0), 0)
        const horasOperaciones = operacionesParcela.reduce((acc, op) => acc + Number(op.duracion_minutos || 0), 0)
        const horasFumigaciones = fumigacionesParcela.reduce((acc, fum) => acc + Number(fum.duracion_minutos || 0), 0)
        const costeTotal = costeOperaciones + costeFumigaciones
        const estaAbierta = parcelaAbierta === parcela.id

        return (
          <div key={parcela.id} className="rentabilidad-card">
            <div className="rentabilidad-cabecera" onClick={() => toggleParcela(parcela.id)}>
              <div className="rentabilidad-cabecera-izq">
                   <img src="./parcela.svg" alt="explotacion" />

               
                <h4>{parcela.nombre || `Pol. ${parcela.poligono} - Par. ${parcela.parcela}`}</h4>
              </div>
              <div className="rentabilidad-cabecera-der">
                <span className="rentabilidad-coste">{costeTotal.toFixed(2)} €</span>
                   <img src="./plus.png" alt="plus" />
              </div>
            </div>

            <div className="rentabilidad-resumen">
              <span>{parcela.explotacion?.nombre}</span>
              <span>{parcela.variedad}</span>
            </div>

            {estaAbierta && (
              <div className="rentabilidad-desplegable">

                {/* operaciones */}
                <div className="rentabilidad-grupo">
                  <p className="rentabilidad-grupo-titulo">
                       <img src="./operaciones.svg" alt="operaciones" />
                    Operaciones
                  </p>

                  {operacionesParcela.length === 0
                    ? <p className="rentabilidad-vacio">Sin operaciones este año</p>
                    : operacionesParcela.map(op => (
                      <div key={op.id} className="rentabilidad-item">
                        <div>
                          <p className="rentabilidad-item-nombre">{op.tipo_operacion} — {op.operario}</p>
                          <p className="rentabilidad-item-detalle">
                            {(op.duracion_minutos / 60).toFixed(1)} h
                          </p>
                        </div>
                        <span className="rentabilidad-item-precio">{Number(op.precio).toFixed(2)} €</span>
                      </div>
                    ))
                  }

                  <div className="rentabilidad-subtotal">
                    <span>Subtotal operaciones ({(horasOperaciones / 60).toFixed(1)} h)</span>
                    <span>{costeOperaciones.toFixed(2)} €</span>
                  </div>
                </div>

                {/* fumigaciones */}
                <div className="rentabilidad-grupo">
                  <p className="rentabilidad-grupo-titulo">
                     <img src="./fumigar1.svg" alt="fumigaciones" />
                    Fumigaciones
                  </p>

                  {fumigacionesParcela.length === 0
                    ? <p className="rentabilidad-vacio">Sin fumigaciones este año</p>
                    : fumigacionesParcela.map(fum => (
                      <div key={fum.id} className="rentabilidad-item">
                        <div>
                          <p className="rentabilidad-item-nombre">{fum.metodo_aplicacion} — {fum.operario}</p>
                          <p className="rentabilidad-item-detalle">
                            {(fum.duracion_minutos / 60).toFixed(1)} h
                          </p>
                        </div>
                        <span className="rentabilidad-item-precio">{Number(fum.precio).toFixed(2)} €</span>
                      </div>
                    ))
                  }

                  <div className="rentabilidad-subtotal">
                    <span>Subtotal fumigaciones ({(horasFumigaciones / 60).toFixed(1)} h)</span>
                    <span>{costeFumigaciones.toFixed(2)} €</span>
                  </div>
                </div>

                {/* total final */}
                <div className="rentabilidad-total">
                  <span>TOTAL</span>
                  <span>{costeTotal.toFixed(2)} €</span>
                </div>

              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Gastos