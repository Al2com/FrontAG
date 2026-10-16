import { useEffect, useRef, useState } from 'react'
import analisisService from '../services/analisis'
import parcelasService from '../services/parcelas'
import gastosService from '../services/gastos'
import BarrasMargenParcela from './BarrasMargenParcela'
import ConsumoAguaBarra from './ConsumoAguaBarra'
import CabeceraOrden from './CabeceraOrden.jsx'
import { useOrdenTabla } from '../hooks/useOrdenTabla'
import { calcularEstado, COLOR_ESTADO, ETIQUETA_ESTADO } from '../utils/estadoRentabilidad'
import './Style/cards.css'
import './Style/search.css'
import './Style/forms.css'
import './Style/analisis.css'

// formatea en € con dos decimales; "-" si el valor no existe (division por
// cero evitada en el backend, que devuelve null en vez de 0/0)
const formatoEuro = (valor) => (valor === null || valor === undefined ? '-' : `${valor.toFixed(2)} €`)
const formatoEuroHng = (valor) => (valor === null || valor === undefined ? '-' : `${valor.toFixed(2)} €/hng`)
const formatoNumero = (valor, unidad = '') => (valor === null || valor === undefined ? '-' : `${valor}${unidad}`)

const TIPOS = [
  { valor: 'fumigacion', etiqueta: 'Fumigación' },
  { valor: 'poda', etiqueta: 'Poda' },
  { valor: 'riego', etiqueta: 'Riego' },
  { valor: 'abonado', etiqueta: 'Abonado' },
  { valor: 'mantenimiento', etiqueta: 'Mantenimiento' },
  { valor: 'tractor', etiqueta: 'Tractor' },
]

// tipos cuyo detalle (operacion a operacion, o recibo a recibo en el riego)
// vive en /api/gastos/resumen. "fumigacion" no entra: ya tiene su propio
// desglose de dos niveles
const TIPOS_CON_DETALLE = ['poda', 'riego', 'abonado', 'mantenimiento', 'tractor']

// KPI card interna reutilizable: etiqueta arriba, valor grande, y un subvalor
// opcional (p.ej. el €/hanegada bajo el total). Sin globos ni arcoíris.
const KpiCard = ({ etiqueta, valor, sub }) => (
  <div className="analisis-kpi">
    <span className="analisis-kpi-label">{etiqueta}</span>
    <span className="analisis-kpi-valor">{valor}</span>
    {sub !== undefined && sub !== null && <span className="analisis-kpi-sub">{sub}</span>}
  </div>
)

// Fila etiqueta/valor de un desglose, como lista limpia (sin globos).
const FilaDesglose = ({ children }) => (
  <div className="rentabilidad-fila-parcela">{children}</div>
)

// Desglose de fumigacion (tractor vs. mochila): dos KPI cards con el total de
// cada metodo y debajo las lineas (mano de obra, producto, litros).
const DesgloseFumigacion = ({ fumigacion }) => (
  <>
    <div className="analisis-kpis">
      <KpiCard etiqueta="Tractor" valor={formatoEuro(fumigacion.tractor.costeTotal)} />
      <KpiCard etiqueta="Mochila" valor={formatoEuro(fumigacion.mochila.costeTotal)} />
    </div>
    <div className="rentabilidad-desplegable">
      <FilaDesglose><span>Tractor: mano de obra</span><span>{formatoEuro(fumigacion.tractor.costeManoObra)}</span></FilaDesglose>
      <FilaDesglose><span>Tractor: producto</span><span>{formatoEuro(fumigacion.tractor.costeProducto)}</span></FilaDesglose>
      <FilaDesglose><span>Tractor: litros aplicados</span><span>{formatoNumero(fumigacion.tractor.litros)} L</span></FilaDesglose>
      <FilaDesglose><span>Mochila: mano de obra</span><span>{formatoEuro(fumigacion.mochila.costeManoObra)}</span></FilaDesglose>
      <FilaDesglose><span>Mochila: producto</span><span>{formatoEuro(fumigacion.mochila.costeProducto)}</span></FilaDesglose>
      <FilaDesglose><span>Mochila: litros aplicados</span><span>{formatoNumero(fumigacion.mochila.litros)} L</span></FilaDesglose>
      <div className="rentabilidad-total">
        <span>Total fumigación</span>
        <span>{formatoEuro(fumigacion.costeTotal)}</span>
      </div>
    </div>
  </>
)

// El riego no se registra como operacion: vive en gastos_riego (goteo: agua,
// mantenimiento, abono) y en riegos_manta. Ambos llegan juntos en el campo
// "riego" de /api/gastos/resumen, diferenciados por concepto ("manta" o no).
const DesgloseRiego = ({ lineasRiego, costeOperacionesRiego }) => {
  if (lineasRiego === null) return <p className="rentabilidad-vacio">Cargando gastos de riego…</p>

  const goteo = lineasRiego.filter(l => l.concepto !== 'manta')
  const manta = lineasRiego.filter(l => l.concepto === 'manta')
  const totalGoteo = goteo.reduce((suma, l) => suma + l.importe, 0)
  const totalManta = manta.reduce((suma, l) => suma + l.importe, 0)

  // el goteo se agrupa por concepto (agua / mantenimiento / abono): al usuario
  // le interesa el total de cada uno, no cada recibo por separado
  const goteoPorConcepto = goteo.reduce((acumulado, l) => {
    acumulado[l.concepto] = (acumulado[l.concepto] ?? 0) + l.importe
    return acumulado
  }, {})

  return (
    <>
      <div className="analisis-kpis">
        <KpiCard etiqueta="Riego por goteo" valor={formatoEuro(totalGoteo)} />
        <KpiCard etiqueta="Riego a manta" valor={formatoEuro(totalManta)} sub={`${manta.length} registro(s)`} />
      </div>

      <div className="rentabilidad-desplegable">
        {Object.entries(goteoPorConcepto).map(([concepto, importe]) => (
          <FilaDesglose key={concepto}>
            <span style={{ textTransform: 'capitalize' }}>Goteo: {concepto}</span>
            <span>{formatoEuro(importe)}</span>
          </FilaDesglose>
        ))}
        <FilaDesglose>
          <span>Riego a manta ({manta.length} registro(s))</span>
          <span>{formatoEuro(totalManta)}</span>
        </FilaDesglose>
        <FilaDesglose>
          <span>Mano de obra de riego (operaciones)</span>
          <span>{formatoEuro(costeOperacionesRiego)}</span>
        </FilaDesglose>
        <div className="rentabilidad-total">
          <span>Total riego</span>
          <span>{formatoEuro(totalGoteo + totalManta + (costeOperacionesRiego ?? 0))}</span>
        </div>
      </div>
    </>
  )
}

// Comparativa en dos barras horizontales CSS puras, proporcionales al mayor de
// los dos valores: la parcela actual en verde de la app, el punto de
// comparacion (media del resto u otra parcela) en gris.
const ComparativaBarras = ({ nombreParcela, etiquetaComparacion, parcelaPorHanegada, comparacionPorHanegada }) => {
  const maximo = Math.max(parcelaPorHanegada ?? 0, comparacionPorHanegada ?? 0)
  const ancho = (valor) => (maximo > 0 ? Math.max(((valor ?? 0) / maximo) * 100, 1) : 0)

  return (
    <div className="analisis-comp">
      <div className="analisis-comp-fila">
        <span className="analisis-comp-etiqueta">{nombreParcela}</span>
        <div className="analisis-comp-pista">
          <div className="analisis-comp-relleno analisis-comp-relleno--parcela" style={{ width: `${ancho(parcelaPorHanegada)}%` }} />
        </div>
        <span className="analisis-comp-valor">{formatoEuroHng(parcelaPorHanegada)}</span>
      </div>
      <div className="analisis-comp-fila">
        <span className="analisis-comp-etiqueta">{etiquetaComparacion}</span>
        <div className="analisis-comp-pista">
          <div className="analisis-comp-relleno analisis-comp-relleno--resto" style={{ width: `${ancho(comparacionPorHanegada)}%` }} />
        </div>
        <span className="analisis-comp-valor">{formatoEuroHng(comparacionPorHanegada)}</span>
      </div>
    </div>
  )
}

const Analisis = () => {
  const anioActual = new Date().getFullYear()
  const anios = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3]

  const [parcelas, setParcelas] = useState([])
  const [parcelaId, setParcelaId] = useState('')
  const [anio, setAnio] = useState(anioActual.toString())
  const [tipo, setTipo] = useState('fumigacion')
  // false: polígono/parcela (por defecto); true: nombre de la parcela
  const [mostrarNombre, setMostrarNombre] = useState(false)

  // las respuestas del resumen solo traen id y nombre: poligono/parcela se
  // sacan de la lista de parcelas cargada al montar
  const etiquetaParcela = (p) => {
    const completa = parcelas.find(x => String(x.id) === String(p.id)) ?? p
    return mostrarNombre || completa.poligono == null
      ? completa.nombre
      : `Pol. ${completa.poligono} - Par. ${completa.parcela}`
  }
  const [resumen, setResumen] = useState(null)
  const [resumenTipo, setResumenTipo] = useState(null)
  const [gastosParcela, setGastosParcela] = useState(null)
  const [costesMetodo, setCostesMetodo] = useState(null)
  // parcela concreta con la que comparar en el Card 2, en vez de la media del
  // resto ('' = media del resto, el comportamiento de siempre)
  const [parcelaComparacionId, setParcelaComparacionId] = useState('')
  const [resumenComparacion, setResumenComparacion] = useState(null)
  const [costesMetodoComparacion, setCostesMetodoComparacion] = useState(null)
  // submetodo del desglose de fumigacion (solo relevante si tipo === 'fumigacion')
  const [metodoFumigacion, setMetodoFumigacion] = useState('todas')
  const [rentabilidad, setRentabilidad] = useState([])
  // vista del mapa de ganancia neta por parcela: gráfico por defecto, tabla
  // para las cifras exactas
  const [mostrarTablaMargen, setMostrarTablaMargen] = useState(false)
  const ordenMapa = useOrdenTabla()
  const [error, setError] = useState('')

  // cargo las parcelas del admin una vez, y selecciono la primera por defecto
  useEffect(() => {
    parcelasService.getLista()
      .then(lista => {
        setParcelas(lista)
        if (lista.length > 0) setParcelaId(String(lista[0].id))
      })
      .catch(() => setError('Error al cargar las parcelas'))
  }, [])

  // resumen SIN filtrar por tipo: alimenta el gasto total/hanegada y la
  // comparativa con el resto de parcelas, que no deben moverse al cambiar el
  // desglose del card de tipos
  useEffect(() => {
    if (!parcelaId) return
    setError('')
    analisisService.getResumenParcela(parcelaId, anio, 'todas')
      .then(data => setResumen(data))
      .catch(() => setError('Error al cargar el análisis'))
  }, [parcelaId, anio])

  // resumen del tipo seleccionado, solo para el card de desglose
  useEffect(() => {
    if (!parcelaId) return
    analisisService.getResumenParcela(parcelaId, anio, tipo)
      .then(data => setResumenTipo(data))
      .catch(() => setError('Error al cargar el desglose por tipo'))
  }, [parcelaId, anio, tipo])

  // El detalle operacion a operacion (y los importes de riego, que no son
  // operaciones) solo estan en /api/gastos/resumen, un endpoint caro que
  // recorre todas las parcelas. Se pide solo cuando el tipo seleccionado lo
  // necesita, y una unica vez por parcela+año: la respuesta ya trae TODOS los
  // tipos, asi que cambiar de poda a mantenimiento no vuelve a pedirla.
  // La clave viaja con los datos para no pintar los de la parcela anterior
  // mientras llega la respuesta nueva
  const claveDetallePedida = useRef(null)

  useEffect(() => {
    const clave = `${parcelaId}-${anio}`
    if (!parcelaId || !TIPOS_CON_DETALLE.includes(tipo) || claveDetallePedida.current === clave) return

    claveDetallePedida.current = clave
    gastosService.getResumen(anio)
      .then(data => {
        const parcela = data.porParcela.find(p => String(p.id) === String(parcelaId))
        setGastosParcela({ clave, datos: parcela ?? null })
      })
      .catch(() => {
        claveDetallePedida.current = null // que se reintente al volver a entrar
        setError('Error al cargar el detalle de gastos')
      })
  }, [parcelaId, anio, tipo])

  // gasto/hanegada y litros/dosis por metodo de la parcela seleccionada
  useEffect(() => {
    if (!parcelaId) return
    analisisService.getCostesMetodo(parcelaId, anio)
      .then(data => setCostesMetodo(data))
      .catch(() => setError('Error al cargar los costes por método'))
  }, [parcelaId, anio])

  // Si la parcela de comparacion elegida coincide con la parcela principal
  // (p.ej. porque se acaba de cambiar la principal a esa), se trata como "sin
  // elegir" (Media del resto): no tiene sentido comparar una parcela consigo
  // misma. Nota: si despues la principal vuelve a cambiar a una tercera
  // parcela, la eleccion anterior "revive" en vez de olvidarse del todo; es
  // un caso raro (exige encadenar dos cambios de parcela principal) y
  // evitarlo del todo requeriria leer/escribir un ref durante el render, que
  // el linter del proyecto no permite, asi que se acepta esta version simple.
  const parcelaComparacionEfectiva = parcelaComparacionId === parcelaId ? '' : parcelaComparacionId

  // resumen (mismo tipo/año que el Card 2) de la parcela elegida para
  // comparar, en vez de la media del resto; 'Media del resto' no pide nada
  // nuevo, ya viene en desglose.comparativa
  useEffect(() => {
    if (!parcelaComparacionEfectiva) return
    analisisService.getResumenParcela(parcelaComparacionEfectiva, anio, tipo)
      .then(data => setResumenComparacion({ clave: `${parcelaComparacionEfectiva}-${anio}-${tipo}`, datos: data }))
      .catch(() => setError('Error al cargar la comparativa con la parcela elegida'))
  }, [parcelaComparacionEfectiva, anio, tipo])

  // el filtro tractor/mochila de fumigacion solo tiene sentido si tipo es
  // exactamente 'fumigacion'; fuera de ahi se ignora el select
  // sin necesidad de resetearlo, asi conserva su valor si el usuario vuelve
  const metodoFumigacionEfectivo = tipo === 'fumigacion' ? metodoFumigacion : 'todas'

  // costes por metodo de la parcela de comparacion elegida: solo hace falta
  // si se compara con OTRA parcela (no la media) Y el filtro tractor/mochila
  // esta activo, para que la barra comparativa tambien respete el metodo
  useEffect(() => {
    if (!parcelaComparacionEfectiva || metodoFumigacionEfectivo === 'todas') return
    analisisService.getCostesMetodo(parcelaComparacionEfectiva, anio)
      .then(data => setCostesMetodoComparacion({ clave: `${parcelaComparacionEfectiva}-${anio}`, datos: data }))
      .catch(() => setError('Error al cargar el método de la parcela de comparación'))
  }, [parcelaComparacionEfectiva, metodoFumigacionEfectivo, anio])

  // rentabilidad de TODAS las parcelas del admin, para poder compararlas
  useEffect(() => {
    analisisService.getRentabilidad(anio)
      .then(data => setRentabilidad(data.parcelas))
      .catch(() => setError('Error al cargar la rentabilidad'))
  }, [anio])

  // litros de caldo del tractor por hanegada y por aplicacion individual (no
  // acumulado anual): litros_totales_tractor_anio / hanegadas / nº_aplicaciones.
  // numFumigaciones ya cuenta los registros de Fumigacion de tractor de la
  // parcela/año (ver AnalisisController::costesPorMetodo)
  const tractorMetodo = costesMetodo?.metodos?.tractor
  const litrosPorHanegadaPorAplicacion = tractorMetodo && costesMetodo.hanegadas > 0 && tractorMetodo.numFumigaciones > 0
    ? tractorMetodo.litros / costesMetodo.hanegadas / tractorMetodo.numFumigaciones
    : null

  // el desglose del card de tipos: la ultima respuesta SOLO si corresponde a
  // los filtros actuales (asi no se pinta el tipo anterior mientras llega la
  // peticion nueva)
  const resumenTipoVigente = resumenTipo
    && String(resumenTipo.parcela.id) === String(parcelaId)
    && String(resumenTipo.anio) === String(anio)
    && resumenTipo.tipo === tipo
    ? resumenTipo
    : null
  const desglose = resumenTipoVigente
  // solo se usa el detalle si corresponde a la parcela y al año actuales
  const gastosVigentes = gastosParcela?.clave === `${parcelaId}-${anio}` ? gastosParcela : null
  const lineasRiego = gastosVigentes ? (gastosVigentes.datos?.riego ?? []) : null
  const filasTipo = gastosVigentes?.datos?.operaciones?.find(o => o.tipo === tipo)?.filas ?? []
  const etiquetaTipo = TIPOS.find(t => t.valor === tipo)?.etiqueta ?? tipo
  const usaMetodoFumigacion = metodoFumigacionEfectivo !== 'todas'
  const etiquetaMetodoFumigacion = { tractor: 'Tractor', mochila: 'Mochila' }[metodoFumigacionEfectivo]

  // solo se usan si corresponden a los filtros vigentes (parcela/año/tipo o
  // metodo), igual criterio que el resto de "vigente" de este componente
  const comparacionVigente = resumenComparacion?.clave === `${parcelaComparacionEfectiva}-${anio}-${tipo}`
    ? resumenComparacion.datos
    : null
  const costesMetodoComparacionVigente = costesMetodoComparacion?.clave === `${parcelaComparacionEfectiva}-${anio}`
    ? costesMetodoComparacion.datos
    : null

  // gasto/hanegada de la parcela PRINCIPAL para el filtro actual (tipo, y si
  // aplica, metodo de fumigacion): la fuente cambia, pero el resto del Card 2
  // (barra comparativa) no necesita saber de donde viene el numero
  const gastoPorHanegadaPrincipal = usaMetodoFumigacion
    ? (costesMetodo ? costesMetodo.metodos[metodoFumigacionEfectivo].gastoPorHanegada : null)
    : (desglose ? desglose.comparativa.gastoPorHanegadaParcela : null)

  // destino de la comparativa: la media del resto, o la parcela elegida en el
  // select de comparacion, ambos respetando el mismo filtro de metodo
  const comparacion = !parcelaComparacionEfectiva
    ? (usaMetodoFumigacion
        ? (costesMetodo ? {
            etiqueta: 'Media resto',
            gastoTotal: costesMetodo.metodos[metodoFumigacionEfectivo].comparativa.gastoTotalMediaResto,
            gastoPorHanegada: costesMetodo.metodos[metodoFumigacionEfectivo].comparativa.gastoPorHanegadaMediaResto,
          } : null)
        : (desglose ? {
            etiqueta: 'Media resto',
            gastoTotal: desglose.comparativa.gastoTotalMediaResto,
            gastoPorHanegada: desglose.comparativa.gastoPorHanegadaMediaResto,
          } : null))
    : (usaMetodoFumigacion
        ? (costesMetodoComparacionVigente ? {
            etiqueta: etiquetaParcela(costesMetodoComparacionVigente.parcela),
            gastoTotal: costesMetodoComparacionVigente.metodos[metodoFumigacionEfectivo].costeTotal,
            gastoPorHanegada: costesMetodoComparacionVigente.metodos[metodoFumigacionEfectivo].gastoPorHanegada,
          } : null)
        : (comparacionVigente ? {
            etiqueta: etiquetaParcela(comparacionVigente.parcela),
            gastoTotal: comparacionVigente.gastoTotal,
            gastoPorHanegada: comparacionVigente.gastoPorHanegada,
          } : null))

  // ingresos, gastos y ganancia neta de la parcela seleccionada, de la misma
  // fuente que el resto de la pestaña (/api/analisis/rentabilidad)
  const rentabilidadParcela = rentabilidad.find(p => String(p.parcela_id) === String(parcelaId))
  const parcelaActual = parcelas.find(p => String(p.id) === String(parcelaId))
  const nombreParcela = parcelaActual ? etiquetaParcela(parcelaActual) : ''

  // hanegadas de la parcela y helpers €/hanegada para las KPI cards del Card 1
  const hanegadas = rentabilidadParcela?.hanegadas ?? resumen?.parcela.hanegadas ?? 0
  const porHng = (valor) => (hanegadas > 0 && valor !== null && valor !== undefined ? valor / hanegadas : null)

  // barra de progreso gastos/ingresos: proporción del gasto sobre el ingreso
  // (100% = se gasta todo lo que se ingresa; más allá hay pérdidas, se capa)
  const ratioGastos = rentabilidadParcela && rentabilidadParcela.ingresos > 0
    ? Math.min((rentabilidadParcela.costes / rentabilidadParcela.ingresos) * 100, 100)
    : (rentabilidadParcela && rentabilidadParcela.costes > 0 ? 100 : 0)

  // gastos/ingresos/hanegadas por parcela para el mapa y su tabla: mismas
  // cifras y mismo estado (rentable/umbral/pérdidas) en las dos vistas
  const datosMapa = rentabilidad
    .filter(p => p.hanegadas > 0)
    .map(p => ({
      parcelaId: p.parcela_id,
      nombre: etiquetaParcela({ id: p.parcela_id, nombre: p.nombre }),
      hanegadas: p.hanegadas,
      gastos: p.costes,
      ingresos: p.ingresos,
      gastoPorHanegada: p.costes / p.hanegadas,
      margenPorHanegada: (p.ingresos - p.costes) / p.hanegadas,
      estado: calcularEstado(p.ingresos, p.costes),
    }))
  const valorOrdenMapa = (fila, clave) => (clave === 'estado' ? ETIQUETA_ESTADO[fila.estado] : fila[clave])
  const datosMapaOrdenados = ordenMapa.ordenar(datosMapa, valorOrdenMapa)

  // datos del gráfico de barras: margen neto por hanegada de cada parcela
  const datosBarras = datosMapa.map(d => ({ categoria: d.nombre, valor: d.margenPorHanegada }))

  return (
    <div className="rentabilidad-contenedor">
      {error && <span className="mensaje-error">{error}</span>}

      {!parcelaId && !error && (
        <p className="rentabilidad-vacio">No hay parcelas para analizar.</p>
      )}

      <section className="analisis-parcela">
        <div className="analisis-parcela-cabecera">
          <div className="analisis-parcela-titulo-fila">
            <h2 className="analisis-parcela-titulo">{nombreParcela || 'Análisis de parcela'}</h2>
            <button
              type="button"
              className="analisis-alternar-nombre"
              onClick={() => setMostrarNombre(m => !m)}
              title="Alternar entre nombre y polígono/parcela"
            >
              nombre / ref.
            </button>
          </div>
          <div className="menuExplo">
            <div className="menu-button">
              <div className="filtro-explo">
                <div className="barra-select">
                  <select value={parcelaId} onChange={(e) => setParcelaId(e.target.value)}>
                    {parcelas.map(p => <option key={p.id} value={p.id}>{etiquetaParcela(p)}</option>)}
                  </select>
                </div>
              </div>
              <div className="filtro-explo">
                <div className="barra-select">
                  <select value={anio} onChange={(e) => setAnio(e.target.value)}>
                    {anios.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 1: resumen de rentabilidad (ingresos, gastos, ganancia neta) */}
        {rentabilidadParcela && (
          <div className="rentabilidad-card">
            <div className="rentabilidad-cabecera-izq">
              <img src="./analisis.svg" alt="Análisis" />
              <h4>Resumen de rentabilidad</h4>
            </div>
            <div className="rentabilidad-resumen">
              <span>{formatoNumero(hanegadas)} hanegadas</span>
            </div>

            <div className="analisis-kpis">
              <KpiCard
                etiqueta="Ingresos"
                valor={formatoEuro(rentabilidadParcela.ingresos)}
                sub={formatoEuroHng(porHng(rentabilidadParcela.ingresos))}
              />
              <KpiCard
                etiqueta="Gastos totales"
                valor={formatoEuro(rentabilidadParcela.costes)}
                sub={formatoEuroHng(resumen ? resumen.gastoPorHanegada : porHng(rentabilidadParcela.costes))}
              />
            </div>

            <div className={`analisis-neto ${rentabilidadParcela.gananciaNeta >= 0 ? 'es-positivo' : 'es-negativo'}`}>
              <div className="analisis-neto-cifras">
                <span className="analisis-neto-label">Ganancia neta</span>
                <span className="analisis-neto-valor">
                  {formatoEuro(rentabilidadParcela.gananciaNeta)}
                  <span className="analisis-neto-hng"> · {formatoEuroHng(rentabilidadParcela.gananciaNetaHanegada)}</span>
                </span>
              </div>
              <span className={`analisis-badge ${rentabilidadParcela.gananciaNeta >= 0 ? 'es-positivo' : 'es-negativo'}`}>
                {rentabilidadParcela.gananciaNeta >= 0 ? 'Beneficio' : 'Pérdidas'}
              </span>
            </div>

            {/* barra de progreso simple: proporción gastos/ingresos */}
            <div className="analisis-ratio">
              <div className="analisis-ratio-pista">
                <div className="analisis-ratio-relleno" style={{ width: `${ratioGastos}%` }} />
              </div>
              <div className="analisis-ratio-labels">
                <span>Gastos</span>
                <span>Ingresos</span>
              </div>
            </div>

            {rentabilidadParcela.sinDatos && (
              <p className="rentabilidad-vacio">Sin recolección o sin gastos registrados: el margen no se calcula.</p>
            )}
          </div>
        )}

        {/* Card 2: desglose por tipo de operación */}
        {resumen && (
          <div className="rentabilidad-card">
            <div className="rentabilidad-cabecera">
              <div className="rentabilidad-cabecera-izq"><h4>Desglose por tipo de operación</h4></div>
              <div className="filtro-explo">
                <div className="barra-select">
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {tipo === 'riego' ? (
              <DesgloseRiego
                lineasRiego={lineasRiego}
                costeOperacionesRiego={desglose?.gastoTotal ?? null}
              />
            ) : !desglose ? (
              <p className="rentabilidad-vacio">Cargando desglose…</p>
            ) : tipo === 'fumigacion' ? (
              <>
                <div className="filtro-explo">
                  <div className="barra-select">
                    <select value={metodoFumigacion} onChange={(e) => setMetodoFumigacion(e.target.value)}>
                      <option value="todas">Todas</option>
                      <option value="tractor">Tractor</option>
                      <option value="mochila">Mochila</option>
                    </select>
                  </div>
                </div>

                {metodoFumigacion === 'todas' ? (
                  desglose.fumigacion ? (
                    <DesgloseFumigacion fumigacion={desglose.fumigacion} />
                  ) : (
                    <div className="rentabilidad-desplegable">
                      <div className="rentabilidad-total">
                        <span>Total fumigación</span>
                        <span>{formatoEuro(desglose.gastoTotal)}</span>
                      </div>
                    </div>
                  )
                ) : !costesMetodo ? (
                  <p className="rentabilidad-vacio">Cargando datos de {etiquetaMetodoFumigacion.toLowerCase()}…</p>
                ) : (
                  <>
                    <div className="analisis-kpis">
                      <KpiCard
                        etiqueta={`Total ${metodoFumigacion}`}
                        valor={formatoEuro(costesMetodo.metodos[metodoFumigacion].costeTotal)}
                      />
                      <KpiCard
                        etiqueta="Gasto por hanegada"
                        valor={formatoEuroHng(costesMetodo.metodos[metodoFumigacion].gastoPorHanegada)}
                      />
                    </div>
                    <div className="rentabilidad-desplegable">
                      {costesMetodo.metodos[metodoFumigacion].productos.length === 0 ? (
                        <p className="rentabilidad-vacio">Sin productos aplicados con {metodoFumigacion} en {anio}.</p>
                      ) : costesMetodo.metodos[metodoFumigacion].productos.map(prod => (
                        <FilaDesglose key={prod.producto_id}>
                          <span>{prod.nombre}</span>
                          <span>{formatoEuro(prod.costeTotal)}</span>
                        </FilaDesglose>
                      ))}
                      <div className="rentabilidad-total">
                        <span>Total {metodoFumigacion}</span>
                        <span>{formatoEuro(costesMetodo.metodos[metodoFumigacion].costeTotal)}</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="analisis-kpis">
                  <KpiCard etiqueta={`Total ${etiquetaTipo.toLowerCase()}`} valor={formatoEuro(desglose.gastoTotal)} />
                  <KpiCard etiqueta="Gasto por hanegada" valor={formatoEuroHng(desglose.gastoPorHanegada)} />
                </div>
                <div className="rentabilidad-desplegable">
                  {filasTipo.length === 0 ? (
                    <p className="rentabilidad-vacio">Sin operaciones de {etiquetaTipo.toLowerCase()} registradas en {anio}.</p>
                  ) : filasTipo.map((fila, indice) => (
                    <FilaDesglose key={`${tipo}-${indice}`}>
                      <span>{fila.fecha} · {fila.operario}{fila.precioMaterial > 0 ? ` · material ${formatoEuro(fila.precioMaterial)}` : ''}</span>
                      <span>{formatoEuro(fila.precio + (fila.precioMaterial ?? 0))}</span>
                    </FilaDesglose>
                  ))}
                  <div className="rentabilidad-total">
                    <span>Total {etiquetaTipo.toLowerCase()} (mano de obra y material)</span>
                    <span>{formatoEuro(desglose.gastoTotal)}</span>
                  </div>
                </div>
              </>
            )}

            {/* comparativa con la media del resto (o con una parcela concreta
                elegida abajo), para ESE mismo tipo/metodo y año */}
            {desglose && (
              <>
                <h5 className="analisis-subtitulo-burbujas">Comparativa con el resto de parcelas</h5>

                <div className="filtro-explo">
                  <div className="barra-select">
                    <select value={parcelaComparacionEfectiva} onChange={(e) => setParcelaComparacionId(e.target.value)}>
                      <option value="">Media del resto</option>
                      {parcelas
                        .filter(p => String(p.id) !== String(parcelaId))
                        .map(p => <option key={p.id} value={p.id}>{etiquetaParcela(p)}</option>)}
                    </select>
                  </div>
                </div>

                {gastoPorHanegadaPrincipal === null || !comparacion ? (
                  <p className="rentabilidad-vacio">Cargando comparativa…</p>
                ) : (
                  <ComparativaBarras
                    nombreParcela={etiquetaParcela(desglose.parcela)}
                    etiquetaComparacion={comparacion.etiqueta}
                    parcelaPorHanegada={gastoPorHanegadaPrincipal}
                    comparacionPorHanegada={comparacion.gastoPorHanegada}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Card químico: gasto de productos por hanegada, tractor vs. mochila */}
        {costesMetodo && (
          <div className="rentabilidad-card">
            <div className="rentabilidad-cabecera-izq"><h4>Gasto de productos químicos por hanegada: tractor vs. mochila</h4></div>
            <ConsumoAguaBarra litrosPorHanegadaPorAplicacion={litrosPorHanegadaPorAplicacion} />
            <div className="analisis-kpis">
              <KpiCard
                etiqueta="Tractor"
                valor={formatoEuroHng(costesMetodo.metodos.tractor.gastoPorHanegada)}
                sub={`total ${formatoEuro(costesMetodo.metodos.tractor.costeTotal)}`}
              />
              <KpiCard
                etiqueta="Mochila"
                valor={formatoEuroHng(costesMetodo.metodos.mochila.gastoPorHanegada)}
                sub={`total ${formatoEuro(costesMetodo.metodos.mochila.costeTotal)}`}
              />
            </div>
            <div className="rentabilidad-desplegable">
              <FilaDesglose><span>Tractor: coste total</span><span>{formatoEuro(costesMetodo.metodos.tractor.costeTotal)}</span></FilaDesglose>
              <FilaDesglose><span>Mochila: coste total</span><span>{formatoEuro(costesMetodo.metodos.mochila.costeTotal)}</span></FilaDesglose>
              <FilaDesglose><span>Tractor: litros totales</span><span>{formatoNumero(costesMetodo.metodos.tractor.litros)} L</span></FilaDesglose>
              <FilaDesglose><span>Mochila: litros totales</span><span>{formatoNumero(costesMetodo.metodos.mochila.litros)} L</span></FilaDesglose>
            </div>
          </div>
        )}
      </section>

      {/* Card 3: rentabilidad por parcela — un único gráfico de barras
          horizontales (margen neto €/hanegada) o su tabla de cifras exactas */}
      {datosMapa.length > 0 && (
        <div className="rentabilidad-card">
          <div className="rentabilidad-cabecera">
            <div className="rentabilidad-cabecera-izq"><h4>Rentabilidad por parcela ({anio})</h4></div>
            <button
              type="button"
              className={`btn-vista ${mostrarTablaMargen ? 'activo' : ''}`}
              onClick={() => setMostrarTablaMargen(v => !v)}
            >
              <img src={mostrarTablaMargen ? './iconTable.png' : './cuadrado.png'} alt="vista" />
              {mostrarTablaMargen ? 'Gráfico' : 'Tabla'}
            </button>
          </div>

          {mostrarTablaMargen ? (
            <>
              <div className="leyenda-margen">
                {Object.keys(ETIQUETA_ESTADO).map(estado => (
                  <div className="leyenda-margen-item" key={estado}>
                    <span className="leyenda-margen-swatch" style={{ backgroundColor: COLOR_ESTADO[estado] }}></span>
                    <span>{ETIQUETA_ESTADO[estado]}{estado === 'umbral' ? ' (±10%)' : ''}</span>
                  </div>
                ))}
              </div>
              <table className="tabla-operaciones tabla-margen">
                <thead>
                  <tr>
                    <CabeceraOrden orden={ordenMapa} clave="nombre">Parcela</CabeceraOrden>
                    <CabeceraOrden orden={ordenMapa} clave="hanegadas">Hanegadas</CabeceraOrden>
                    <CabeceraOrden orden={ordenMapa} clave="gastos">Gasto total</CabeceraOrden>
                    <CabeceraOrden orden={ordenMapa} clave="ingresos">Ingreso total</CabeceraOrden>
                    <CabeceraOrden orden={ordenMapa} clave="margenPorHanegada">Margen €/hng</CabeceraOrden>
                    <CabeceraOrden orden={ordenMapa} clave="estado">Estado</CabeceraOrden>
                  </tr>
                </thead>
                <tbody>
                  {datosMapaOrdenados.map(d => (
                    <tr key={d.parcelaId}>
                      <td>{d.nombre}</td>
                      <td>{formatoNumero(d.hanegadas)}</td>
                      <td>{formatoEuro(d.gastos)}</td>
                      <td>{formatoEuro(d.ingresos)}</td>
                      <td>{formatoEuro(d.margenPorHanegada)}</td>
                      <td>
                        <span className={`chip-estado chip-estado--${d.estado}`}>{ETIQUETA_ESTADO[d.estado]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <BarrasMargenParcela datos={datosBarras} />
          )}
        </div>
      )}
    </div>
  )
}

export default Analisis
