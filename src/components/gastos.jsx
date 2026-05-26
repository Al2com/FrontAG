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

  // cargo datos al entrar
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

  // tractor = 1500L por turbo, mochila = 12L por mochila
  const calcularLitros = (fum) => {
    const unidades = fum.metodo_aplicacion === 'tractor' ? fum.turbos : fum.mochilas
    const litrosPorUnidad = fum.metodo_aplicacion === 'tractor' ? 1500 : 12
    return unidades * litrosPorUnidad
  }

  // formatea "2025-03-12 08:00:00" a "12/03"
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    return `${dia}/${mes}`
  }

  // agrupa operaciones por tipo y dentro por operario con sus fechas y horas
  const agruparOperacionesPorTipo = (parcelaId) => {
    const agrupado = {}
    getOperacionesParcela(parcelaId).forEach(op => {
      if (!agrupado[op.tipo_operacion]) agrupado[op.tipo_operacion] = {}
      if (!agrupado[op.tipo_operacion][op.operario]) agrupado[op.tipo_operacion][op.operario] = []
      agrupado[op.tipo_operacion][op.operario].push({
        fecha: formatearFecha(op.hora_inicio),
        horas: Number(op.duracion_minutos || 0) / 60,
        precio: Number(op.precio || 0),
      })
    })
    return agrupado
  }

  // agrupa productos de las fumigaciones de una parcela filtrando por metodo
  const getProductosPorMetodo = (parcelaId, metodo) => {
    const mapa = {}
    getFumigacionesParcela(parcelaId)
      .filter(f => f.metodo_aplicacion === metodo)
      .forEach(fum => {
        const unidades = metodo === 'tractor' ? fum.turbos : fum.mochilas
        if (!fum.productos) return
        fum.productos.forEach(prod => {
          const cantidad = prod.pivot.dosis_introducida * unidades
          const coste = cantidad * Number(prod.precio || 0)
          if (mapa[prod.id]) {
            mapa[prod.id].cantidad += cantidad
            mapa[prod.id].coste += coste
          } else {
            mapa[prod.id] = {
              id: prod.id,
              nombre: prod.nombre,
              unidad: prod.unidad,
              precioPorUnidad: Number(prod.precio || 0),
              cantidad,
              coste,
            }
          }
        })
      })
    return Object.values(mapa)
  }

  // resumen de una explotacion agrupando todas sus parcelas
  const getResumenExplotacion = (parcelas) => {
    let horasOperaciones = 0, costeOperaciones = 0
    let litrosTractor = 0, costeTractor = 0, materialTractor = 0
    let litrosMochila = 0, costeMochila = 0, materialMochila = 0

    parcelas.forEach(parcela => {
      getOperacionesParcela(parcela.id).forEach(op => {
        horasOperaciones += Number(op.duracion_minutos || 0)
        costeOperaciones += Number(op.precio || 0)
      })
      getFumigacionesParcela(parcela.id).forEach(fum => {
        const litros = calcularLitros(fum)
        if (fum.metodo_aplicacion === 'tractor') {
          litrosTractor += litros
          costeTractor += Number(fum.precio || 0)
        } else {
          litrosMochila += litros
          costeMochila += Number(fum.precio || 0)
        }
      })
      getProductosPorMetodo(parcela.id, 'tractor').forEach(p => { materialTractor += p.coste })
      getProductosPorMetodo(parcela.id, 'mochila').forEach(p => { materialMochila += p.coste })
    })

    return { horasOperaciones, costeOperaciones, litrosTractor, costeTractor, materialTractor, litrosMochila, costeMochila, materialMochila }
  }

  // coste total de una parcela sumando todo
  const getCosteParcela = (parcelaId) => {
    const gastoOps = getOperacionesParcela(parcelaId).reduce((acc, op) => acc + Number(op.precio || 0), 0)
    const gastoFums = getFumigacionesParcela(parcelaId).reduce((acc, fum) => acc + Number(fum.precio || 0), 0)
    const gastoMaterial = [
      ...getProductosPorMetodo(parcelaId, 'tractor'),
      ...getProductosPorMetodo(parcelaId, 'mochila')
    ].reduce((acc, p) => acc + p.coste, 0)
    return gastoOps + gastoFums + gastoMaterial
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

      {/* resumen por explotacion */}
      <h3 className="rentabilidad-titulo-seccion">Por Explotación</h3>

      {Object.entries(parcelasPorExplotacion).map(([nombreExplo, parcelas]) => {
        const costeExplo = parcelas.reduce((acc, p) => acc + getCosteParcela(p.id), 0)
        const estaAbierta = explotacionAbierta === nombreExplo
        const resumen = getResumenExplotacion(parcelas)

        return (
          <div key={nombreExplo} className="rentabilidad-card">
            <div className="rentabilidad-cabecera" onClick={() => toggleExplotacion(nombreExplo)}>
              <div className="rentabilidad-cabecera-izq">
                <img src="./explotaciones.svg" alt="explotacion" />
                <h4>{nombreExplo}</h4>
              </div>
              <div className="rentabilidad-cabecera-der">
                <span className="rentabilidad-coste">{costeExplo.toFixed(2)} €</span>
                <img src="./plus.png" alt="plus" />
              </div>
            </div>

            {estaAbierta && (
              <div className="rentabilidad-desplegable">
                <div className="rentabilidad-fila-parcela">
                  <span>Operaciones · {(resumen.horasOperaciones / 60).toFixed(1)} h</span>
                  <span>{resumen.costeOperaciones.toFixed(2)} €</span>
                </div>
                {resumen.litrosTractor > 0 && (
                  <div className="rentabilidad-fila-parcela">
                    <span>Fumigaciones tractor · {resumen.litrosTractor.toLocaleString()} L</span>
                    <span>{resumen.costeTractor.toFixed(2)} €</span>
                  </div>
                )}
                {resumen.materialTractor > 0 && (
                  <div className="rentabilidad-fila-parcela">
                    <span>Material químico tractor</span>
                    <span>{resumen.materialTractor.toFixed(2)} €</span>
                  </div>
                )}
                {resumen.litrosMochila > 0 && (
                  <div className="rentabilidad-fila-parcela">
                    <span>Fumigaciones mochila hierba · {resumen.litrosMochila.toLocaleString()} L</span>
                    <span>{resumen.costeMochila.toFixed(2)} €</span>
                  </div>
                )}
                {resumen.materialMochila > 0 && (
                  <div className="rentabilidad-fila-parcela">
                    <span>Material químico mochila hierba</span>
                    <span>{resumen.materialMochila.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* desglose completo por parcela en tabla */}
      <h3 className="rentabilidad-titulo-seccion">Por Parcela</h3>

      {listaParcelas.map(parcela => {
        const fumigacionesParcela = getFumigacionesParcela(parcela.id)
        const operacionesAgrupadas = agruparOperacionesPorTipo(parcela.id)
        const costeOperaciones = getOperacionesParcela(parcela.id).reduce((acc, op) => acc + Number(op.precio || 0), 0)
        const costeFumigaciones = fumigacionesParcela.reduce((acc, fum) => acc + Number(fum.precio || 0), 0)
        const productosTractor = getProductosPorMetodo(parcela.id, 'tractor')
        const productosMochila = getProductosPorMetodo(parcela.id, 'mochila')
        const costeProductosTractor = productosTractor.reduce((acc, p) => acc + p.coste, 0)
        const costeProductosMochila = productosMochila.reduce((acc, p) => acc + p.coste, 0)
        const costeTotal = costeOperaciones + costeFumigaciones + costeProductosTractor + costeProductosMochila
        const fumigacionesTractor = fumigacionesParcela.filter(f => f.metodo_aplicacion === 'tractor')
        const fumigacionesMochila = fumigacionesParcela.filter(f => f.metodo_aplicacion === 'mochila')
        const estaAbierta = parcelaAbierta === parcela.id

        return (
          <div key={parcela.id} className="rentabilidad-card">
            <div className="rentabilidad-cabecera" onClick={() => toggleParcela(parcela.id)}>
              <div className="rentabilidad-cabecera-izq">
                <img src="./parcela.svg" alt="parcela" />
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
                <table className="tabla-operaciones">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Detalle</th>
                      <th>Horas</th>
                      <th>Litros</th>
                      <th>Importe</th>
                    </tr>
                  </thead>
                  <tbody>

                    {/* operaciones agrupadas por tipo, dentro por operario con todas las fechas */}
                    {Object.entries(operacionesAgrupadas).map(([tipo, porOperario]) => {
                      const precioTipo = Object.values(porOperario).flat().reduce((acc, e) => acc + e.precio, 0)
                      return Object.entries(porOperario).map(([operario, entradas], i) => {
                        const horasOperario = entradas.reduce((acc, e) => acc + e.horas, 0)
                        const detalle = entradas.map(e => `${e.fecha} ${e.horas.toFixed(1)}h`).join(' · ')
                        return (
                          <tr key={`${tipo}-${operario}`}>
                            <td style={{ textTransform: 'capitalize', fontWeight: i === 0 ? 600 : 400 }}>
                              {i === 0 ? tipo : ''} — {operario}
                            </td>
                            <td className="detalle-fechas">{detalle}</td>
                            <td>{horasOperario.toFixed(1)} h</td>
                            <td>—</td>
                            {/* precio solo en la primera fila del tipo */}
                            <td>{i === 0 ? `${precioTipo.toFixed(2)} €` : ''}</td>
                          </tr>
                        )
                      })
                    })}

                    <tr className="tabla-separador"><td colSpan={5}></td></tr>

                    {/* fumigaciones tractor con material indentado debajo */}
                    {fumigacionesTractor.length === 0
                      ? (
                        <tr>
                          <td colSpan={5} style={{ fontStyle: 'italic', color: 'var(--c-texto-apagado)' }}>
                            Sin fumigaciones con tractor
                          </td>
                        </tr>
                      )
                      : fumigacionesTractor.map(fum => (
                        <>
                          <tr key={`tractor-${fum.id}`}>
                            <td>Tractor</td>
                            <td className="detalle-fechas">{formatearFecha(fum.hora_inicio)} · {fum.turbos} turbo{fum.turbos !== 1 ? 's' : ''}</td>
                            <td>—</td>
                            <td>{calcularLitros(fum).toLocaleString()} L</td>
                            <td>{Number(fum.precio).toFixed(2)} €</td>
                          </tr>
                          {fum.productos?.map(prod => {
                            const cantidad = prod.pivot.dosis_introducida * fum.turbos
                            const coste = cantidad * Number(prod.precio || 0)
                            return (
                              <tr key={`prod-t-${fum.id}-${prod.id}`} className="tabla-fila-material">
                                <td> {prod.nombre}</td>
                                <td>{prod.pivot.dosis_introducida} {prod.unidad}/turbo · {cantidad.toFixed(2)} {prod.unidad}</td>
                                <td>—</td>
                                <td>—</td>
                                <td>{coste.toFixed(2)} €</td>
                              </tr>
                            )
                          })}
                        </>
                      ))
                    }

                    <tr className="tabla-separador"><td colSpan={5}></td></tr>

                    {/* fumigaciones mochila hierba con material indentado debajo */}
                    {fumigacionesMochila.length === 0
                      ? (
                        <tr>
                          <td colSpan={5} style={{ fontStyle: 'italic', color: 'var(--c-texto-apagado)' }}>
                            Sin fumigaciones con mochila
                          </td>
                        </tr>
                      )
                      : fumigacionesMochila.map(fum => (
                        <>
                          <tr key={`mochila-${fum.id}`}>
                            <td>Mochila hierba</td>
                            <td className="detalle-fechas">{formatearFecha(fum.hora_inicio)} · {fum.operario} · {fum.mochilas} mochila{fum.mochilas !== 1 ? 's' : ''}</td>
                            <td>{(fum.duracion_minutos / 60).toFixed(1)} h</td>
                            <td>{calcularLitros(fum)} L</td>
                            <td>{Number(fum.precio).toFixed(2)} €</td>
                          </tr>
                          {fum.productos?.map(prod => {
                            const cantidad = prod.pivot.dosis_introducida * fum.mochilas
                            const coste = cantidad * Number(prod.precio || 0)
                            return (
                              <tr key={`prod-m-${fum.id}-${prod.id}`} className="tabla-fila-material">
                                <td>{prod.nombre}</td>
                                <td>{prod.pivot.dosis_introducida} {prod.unidad}/mochila · {cantidad.toFixed(2)} {prod.unidad}</td>
                                <td>—</td>
                                <td>—</td>
                                <td>{coste.toFixed(2)} €</td>
                              </tr>
                            )
                          })}
                        </>
                      ))
                    }

                    {/* fila total */}
                    <tr className="tabla-total">
                      <td colSpan={4}><strong>TOTAL</strong></td>
                      <td><strong>{costeTotal.toFixed(2)} €</strong></td>
                    </tr>

                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Gastos