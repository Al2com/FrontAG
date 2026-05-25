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

  // coste total de una parcela: operaciones + fumigaciones
  const getCosteParcela = (parcelaId) => {
    const gastoOps = getOperacionesParcela(parcelaId).reduce((acc, op) => acc + Number(op.precio || 0), 0)
    const gastoFums = getFumigacionesParcela(parcelaId).reduce((acc, fum) => acc + Number(fum.precio || 0), 0)
    return gastoOps + gastoFums
  }

  // tractor = 1500L por turbo, mochila = 12L por mochila
  const calcularLitros = (fum) => {
    const unidades = fum.metodo_aplicacion === 'tractor' ? fum.turbos : fum.mochilas
    const litrosPorUnidad = fum.metodo_aplicacion === 'tractor' ? 1500 : 12
    return unidades * litrosPorUnidad
  }

  // agrupa todos los productos usados en las fumigaciones de una parcela
  // si el mismo producto aparece en varias fumigaciones lo acumula en uno solo
  const getProductosParcela = (parcelaId) => {
    const fumigaciones = getFumigacionesParcela(parcelaId)
    const mapa = {}

    fumigaciones.forEach(fum => {
      const unidades = fum.metodo_aplicacion === 'tractor' ? fum.turbos : fum.mochilas

      if (!fum.productos) return

      fum.productos.forEach(prod => {
        const cantidadFum = prod.pivot.dosis_introducida * unidades
        const costeFum = cantidadFum * Number(prod.precio || 0)

        if (mapa[prod.id]) {
          // si ya existe el producto sumamos cantidad y coste
          mapa[prod.id].cantidad += cantidadFum
          mapa[prod.id].coste += costeFum
        } else {
          mapa[prod.id] = {
            id: prod.id,
            nombre: prod.nombre,
            unidad: prod.unidad,
            precioPorUnidad: Number(prod.precio || 0),
            cantidad: cantidadFum,
            coste: costeFum,
          }
        }
      })
    })

    return Object.values(mapa)
  }

  const toggleParcela = (parcelaId) =>
    setParcelaAbierta(parcelaAbierta === parcelaId ? null : parcelaId)

  const toggleExplotacion = (nombre) =>
    setExplotacionAbierta(explotacionAbierta === nombre ? null : nombre)

  // agrupa parcelas por explotacion para el bloque de arriba
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

      {/* resumen por explotacion, solo muestra el coste total de cada una */}
      <h3 className="rentabilidad-titulo-seccion">Por Explotación</h3>

      {Object.entries(parcelasPorExplotacion).map(([nombreExplo, parcelas]) => {
        const costeExplo = parcelas.reduce((acc, p) => acc + getCosteParcela(p.id), 0)
        const estaAbierta = explotacionAbierta === nombreExplo

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

      {/* desglose completo por parcela */}
      <h3 className="rentabilidad-titulo-seccion">Por Parcela</h3>

      {listaParcelas.map(parcela => {
        const operacionesParcela = getOperacionesParcela(parcela.id)
        const fumigacionesParcela = getFumigacionesParcela(parcela.id)

        const costeOperaciones = operacionesParcela.reduce((acc, op) => acc + Number(op.precio || 0), 0)
        const costeFumigaciones = fumigacionesParcela.reduce((acc, fum) => acc + Number(fum.precio || 0), 0)
        const horasOperaciones = operacionesParcela.reduce((acc, op) => acc + Number(op.duracion_minutos || 0), 0)
        const horasFumigaciones = fumigacionesParcela.reduce((acc, fum) => acc + Number(fum.duracion_minutos || 0), 0)
        const litrosParcela = fumigacionesParcela.reduce((acc, fum) => acc + calcularLitros(fum), 0)

        // productos agrupados de todas las fumigaciones de esta parcela
        const productosParcela = getProductosParcela(parcela.id)
        const costeProductos = productosParcela.reduce((acc, p) => acc + p.coste, 0)

        const costeTotal = costeOperaciones + costeFumigaciones + costeProductos
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

                {/* operaciones: mano de obra, tractor, etc */}
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

                {/* fumigaciones: metodo, litros y productos usados en cada una */}
                <div className="rentabilidad-grupo">
                  <p className="rentabilidad-grupo-titulo">
                    <img src="./fumigar1.svg" alt="fumigaciones" />
                    Fumigaciones
                  </p>

                  {fumigacionesParcela.length === 0
                    ? <p className="rentabilidad-vacio">Sin fumigaciones este año</p>
                    : fumigacionesParcela.map(fum => {
                        const unidades = fum.metodo_aplicacion === 'tractor' ? fum.turbos : fum.mochilas
                        const litros = calcularLitros(fum)

                        return (
                          <div key={fum.id} className="rentabilidad-item">
                            <div>
                              <p className="rentabilidad-item-nombre">
                                {fum.metodo_aplicacion} — {fum.operario}
                              </p>

                              {/* litros segun turbos o mochilas */}
                              <p className="rentabilidad-item-detalle">
                                {fum.metodo_aplicacion === 'tractor'
                                  ? `${fum.turbos} turbo${fum.turbos !== 1 ? 's' : ''} · ${litros.toLocaleString()} L`
                                  : `${fum.mochilas} mochila${fum.mochilas !== 1 ? 's' : ''} · ${litros} L`
                                }
                              </p>

                              {/* productos que se usaron en esta fumigacion concreta */}
                              {fum.productos && fum.productos.length > 0 && (
                                <div className="rentabilidad-productos">
                                  {fum.productos.map(prod => {
                                    const totalProducto = prod.pivot.dosis_introducida * unidades
                                    return (
                                      <p key={prod.id} className="rentabilidad-item-detalle">
                                        {prod.nombre}: {prod.pivot.dosis_introducida} {prod.unidad}/unidad · {totalProducto.toFixed(2)} {prod.unidad} total
                                      </p>
                                    )
                                  })}
                                </div>
                              )}

                              {fum.duracion_minutos && (
                                <p className="rentabilidad-item-detalle">
                                  {(fum.duracion_minutos / 60).toFixed(1)} h
                                </p>
                              )}
                            </div>
                            <span className="rentabilidad-item-precio">{Number(fum.precio).toFixed(2)} €</span>
                          </div>
                        )
                      })
                  }

                  <div className="rentabilidad-subtotal">
                    <span>
                      Subtotal fumigaciones
                      {horasFumigaciones > 0 && ` · ${(horasFumigaciones / 60).toFixed(1)} h`}
                      {litrosParcela > 0 && ` · ${litrosParcela.toLocaleString()} L`}
                    </span>
                    <span>{costeFumigaciones.toFixed(2)} €</span>
                  </div>
                </div>

                {/* resumen de productos: todos los que se han usado en esta parcela agrupados */}
                {productosParcela.length > 0 && (
                  <div className="rentabilidad-grupo">
                    <p className="rentabilidad-grupo-titulo">
                      <img src="./productos.svg" alt="productos" />
                      Material utilizado
                    </p>

                    {productosParcela.map(prod => (
                      <div key={prod.id} className="rentabilidad-item">
                        <div>
                          <p className="rentabilidad-item-nombre">{prod.nombre}</p>
                          {/* cantidad total = suma de todas las fumigaciones donde aparece */}
                          <p className="rentabilidad-item-detalle">
                            {prod.cantidad.toFixed(2)} {prod.unidad} · {prod.precioPorUnidad.toFixed(2)} €/{prod.unidad}
                          </p>
                        </div>
                        <span className="rentabilidad-item-precio">{prod.coste.toFixed(2)} €</span>
                      </div>
                    ))}

                    <div className="rentabilidad-subtotal">
                      <span>Subtotal material</span>
                      <span>{costeProductos.toFixed(2)} €</span>
                    </div>
                  </div>
                )}

                {/* total final sumando operaciones + fumigaciones + material */}
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