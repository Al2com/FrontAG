import { useEffect, useRef, useState } from 'react'
import analisisService from '../services/analisis'
import parcelasService from '../services/parcelas'
import gastosService from '../services/gastos'
import GraficoRentabilidad from './GraficoRentabilidad'
import BurbujasMetodos from './BurbujasMetodos'
import BurbujasGanancia from './BurbujasGanancia'
import BurbujasFlotantes from './BurbujasFlotantes'
import RentabilidadBarra from './RentabilidadBarra'
import BarraIngresosGastos from './BarraIngresosGastos'
import ConsumoAguaBarra from './ConsumoAguaBarra'
import { tramoMargen, LEYENDA_MARGEN } from '../utils/margenColor'
import './Style/cards.css'
import './Style/search.css'
import './Style/forms.css'
import './Style/analisis.css'

// formatea en € con dos decimales; "-" si el valor no existe (division por
// cero evitada en el backend, que devuelve null en vez de 0/0)
const formatoEuro = (valor) => (valor === null || valor === undefined ? '-' : `${valor.toFixed(2)} €`)
const formatoNumero = (valor, unidad = '') => (valor === null || valor === undefined ? '-' : `${valor}${unidad}`)

const TIPOS = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'fumigacion', etiqueta: 'Fumigación' },
  { valor: 'poda', etiqueta: 'Poda' },
  { valor: 'riego', etiqueta: 'Riego' },
  { valor: 'abonado', etiqueta: 'Abonado' },
  { valor: 'mantenimiento', etiqueta: 'Mantenimiento' },
  { valor: 'tractor', etiqueta: 'Tractor' },
]

// tipos cuyo detalle (operacion a operacion, o recibo a recibo en el riego)
// vive en /api/gastos/resumen. "todas" y "fumigacion" no entran: la primera no
// es un tipo real y la segunda ya tiene su propio desglose de dos niveles
const TIPOS_CON_DETALLE = ['poda', 'riego', 'abonado', 'mantenimiento', 'tractor']

// una burbuja por operacion: el importe manda el tamaño, y dentro se lee la
// fecha, el operario y (si lo hay) el material imputado a esa operacion
const burbujasDeOperaciones = (filas, prefijo) => filas.map((fila, indice) => ({
  id: `${prefijo}-${indice}`,
  etiqueta: fila.fecha,
  valor: fila.precio + (fila.precioMaterial ?? 0),
  detalle: fila.precioMaterial > 0
    ? `${fila.operario} · material ${formatoEuro(fila.precioMaterial)}`
    : fila.operario,
}))

// dos barras: la parcela seleccionada (color solido) frente a la media del
// resto de parcelas (barra con borde, sin rellenar), para que se distingan
// aunque no se perciban bien los colores
const GraficoComparativo = ({ parcela, media, nombreParcela }) => {
  const alturaMax = 120
  const anchoBarra = 64
  const gap = 48
  const margen = 20
  const anchoSvg = margen * 2 + anchoBarra * 2 + gap
  const baseY = alturaMax + 20
  const altoSvg = baseY + 24

  const maxValor = Math.max(parcela, media, 0.01)
  const alturaParcela = Math.max((parcela / maxValor) * alturaMax, 2)
  const alturaMedia = Math.max((media / maxValor) * alturaMax, 2)

  const xParcela = margen
  const xMedia = margen + anchoBarra + gap

  return (
    <svg
      viewBox={`0 0 ${anchoSvg} ${altoSvg}`}
      className="grafico-comparativo"
      role="img"
      aria-label={`${nombreParcela}: ${parcela.toFixed(2)} euros por hanegada. Media del resto de parcelas: ${media.toFixed(2)} euros por hanegada.`}
    >
      <line x1={margen - 10} y1={baseY} x2={anchoSvg - margen + 10} y2={baseY} stroke="var(--c-borde)" strokeWidth="1" />

      <rect x={xParcela} y={baseY - alturaParcela} width={anchoBarra} height={alturaParcela} rx="4" fill="var(--c-primario)" />
      <text x={xParcela + anchoBarra / 2} y={baseY - alturaParcela - 8} textAnchor="middle" className="grafico-valor">
        {parcela.toFixed(2)} €
      </text>
      <text x={xParcela + anchoBarra / 2} y={baseY + 16} textAnchor="middle" className="grafico-etiqueta">
        {nombreParcela}
      </text>

      <rect x={xMedia} y={baseY - alturaMedia} width={anchoBarra} height={alturaMedia} rx="4" fill="var(--c-fondo-verde)" stroke="var(--c-primario-medio)" strokeWidth="2" />
      <text x={xMedia + anchoBarra / 2} y={baseY - alturaMedia - 8} textAnchor="middle" className="grafico-valor">
        {media.toFixed(2)} €
      </text>
      <text x={xMedia + anchoBarra / 2} y={baseY + 16} textAnchor="middle" className="grafico-etiqueta">
        Media resto
      </text>
    </svg>
  )
}

// Desglose de fumigacion (tractor vs. mochila): mano de obra, producto y
// litros aplicados. Se reutiliza tal cual en el tipo "todas" y en "fumigacion".
const DesgloseFumigacion = ({ fumigacion }) => (
  <>
    <BurbujasMetodos
      tractor={{
        costeTotal: fumigacion.tractor.costeTotal,
        productos: [
          { producto_id: 'producto', nombre: 'Producto', valor: fumigacion.tractor.costeProducto },
          { producto_id: 'manoObra', nombre: 'Mano de obra', valor: fumigacion.tractor.costeManoObra },
        ],
      }}
      mochila={{
        costeTotal: fumigacion.mochila.costeTotal,
        productos: [
          { producto_id: 'producto', nombre: 'Producto', valor: fumigacion.mochila.costeProducto },
          { producto_id: 'manoObra', nombre: 'Mano de obra', valor: fumigacion.mochila.costeManoObra },
        ],
      }}
      valorPrincipal={(m) => m.costeTotal}
      etiquetaPrincipal={(m) => formatoEuro(m.costeTotal)}
      valorProducto={(p) => p.valor}
      etiquetaProducto={(p) => formatoEuro(p.valor)}
    />
    <div className="rentabilidad-desplegable">
      <div className="rentabilidad-fila-parcela">
        <span>Tractor: mano de obra</span>
        <span>{formatoEuro(fumigacion.tractor.costeManoObra)}</span>
      </div>
      <div className="rentabilidad-fila-parcela">
        <span>Tractor: producto</span>
        <span>{formatoEuro(fumigacion.tractor.costeProducto)}</span>
      </div>
      <div className="rentabilidad-fila-parcela">
        <span>Tractor: litros aplicados</span>
        <span>{formatoNumero(fumigacion.tractor.litros)} L</span>
      </div>
      <div className="rentabilidad-fila-parcela">
        <span>Mochila: mano de obra</span>
        <span>{formatoEuro(fumigacion.mochila.costeManoObra)}</span>
      </div>
      <div className="rentabilidad-fila-parcela">
        <span>Mochila: producto</span>
        <span>{formatoEuro(fumigacion.mochila.costeProducto)}</span>
      </div>
      <div className="rentabilidad-fila-parcela">
        <span>Mochila: litros aplicados</span>
        <span>{formatoNumero(fumigacion.mochila.litros)} L</span>
      </div>
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

  const burbujasGoteo = Object.entries(goteoPorConcepto).map(([concepto, importe]) => ({
    id: `goteo-${concepto}`,
    etiqueta: concepto,
    valor: importe,
  }))

  // cada riego a manta es un registro con su fecha y las hanegadas que se
  // regaron ese dia (las de la parcela en ese momento, no las actuales)
  const burbujasManta = manta.map((linea, indice) => ({
    id: `manta-${indice}`,
    etiqueta: linea.fecha,
    valor: linea.importe,
    detalle: linea.hanegadas !== null && linea.hanegadas !== undefined
      ? `${linea.hanegadas} hanegadas`
      : undefined,
  }))

  return (
    <>
      <h5 className="analisis-subtitulo-burbujas">Riego por goteo</h5>
      <BurbujasFlotantes
        datos={burbujasGoteo}
        formatoValor={(v) => formatoEuro(v)}
        vacio="Sin gastos de goteo registrados."
      />

      <h5 className="analisis-subtitulo-burbujas">Riego a manta</h5>
      <BurbujasFlotantes
        datos={burbujasManta}
        formatoValor={(v) => formatoEuro(v)}
        vacio="Sin riegos a manta registrados."
      />

      {/* los importes concepto a concepto y riego a riego ya se leen en las
          burbujas de arriba: aqui solo quedan los totales */}
      <div className="rentabilidad-desplegable">
        <div className="rentabilidad-fila-parcela">
          <span>Riego por goteo</span>
          <span>{formatoEuro(totalGoteo)}</span>
        </div>
        <div className="rentabilidad-fila-parcela">
          <span>Riego a manta ({manta.length} registro(s))</span>
          <span>{formatoEuro(totalManta)}</span>
        </div>
        <div className="rentabilidad-fila-parcela">
          <span>Mano de obra de riego (operaciones)</span>
          <span>{formatoEuro(costeOperacionesRiego)}</span>
        </div>

        <div className="rentabilidad-total">
          <span>Total riego</span>
          <span>{formatoEuro(totalGoteo + totalManta + (costeOperacionesRiego ?? 0))}</span>
        </div>
      </div>
    </>
  )
}

const Analisis = () => {
  const anioActual = new Date().getFullYear()
  const anios = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3]

  const [parcelas, setParcelas] = useState([])
  const [parcelaId, setParcelaId] = useState('')
  const [anio, setAnio] = useState(anioActual.toString())
  const [tipo, setTipo] = useState('todas')
  const [resumen, setResumen] = useState(null)
  const [resumenTipo, setResumenTipo] = useState(null)
  const [gastosParcela, setGastosParcela] = useState(null)
  const [costesMetodo, setCostesMetodo] = useState(null)
  const [rentabilidad, setRentabilidad] = useState([])
  const [historico, setHistorico] = useState([])
  const [mostrarTablaMargen, setMostrarTablaMargen] = useState(false)
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

  // resumen del tipo seleccionado, solo para el card de desglose; con "todas"
  // se reutiliza el resumen general y se ahorra la peticion
  useEffect(() => {
    if (!parcelaId || tipo === 'todas') return
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

  // rentabilidad de TODAS las parcelas del admin, para poder compararlas
  useEffect(() => {
    analisisService.getRentabilidad(anio)
      .then(data => setRentabilidad(data.parcelas))
      .catch(() => setError('Error al cargar la rentabilidad'))
  }, [anio])

  // histórico (todos los años con datos): no depende del año seleccionado, se pide una vez
  useEffect(() => {
    analisisService.getRentabilidadHistorico()
      .then(data => setHistorico(data.anios))
      .catch(() => setError('Error al cargar el histórico de rentabilidad'))
  }, [])

  // litros de caldo del tractor por hanegada y por aplicacion individual (no
  // acumulado anual): litros_totales_tractor_anio / hanegadas / nº_aplicaciones.
  // numFumigaciones ya cuenta los registros de Fumigacion de tractor de la
  // parcela/año (ver AnalisisController::costesPorMetodo)
  const tractorMetodo = costesMetodo?.metodos?.tractor
  const litrosPorHanegadaPorAplicacion = tractorMetodo && costesMetodo.hanegadas > 0 && tractorMetodo.numFumigaciones > 0
    ? tractorMetodo.litros / costesMetodo.hanegadas / tractorMetodo.numFumigaciones
    : null

  // el desglose del card de tipos: el resumen general cuando es "todas", y si
  // no, la ultima respuesta SOLO si corresponde a los filtros actuales (asi no
  // se pinta el tipo anterior mientras llega la peticion nueva)
  const resumenTipoVigente = resumenTipo
    && String(resumenTipo.parcela.id) === String(parcelaId)
    && String(resumenTipo.anio) === String(anio)
    && resumenTipo.tipo === tipo
    ? resumenTipo
    : null
  const desglose = tipo === 'todas' ? resumen : resumenTipoVigente
  // solo se usa el detalle si corresponde a la parcela y al año actuales
  const gastosVigentes = gastosParcela?.clave === `${parcelaId}-${anio}` ? gastosParcela : null
  const lineasRiego = gastosVigentes ? (gastosVigentes.datos?.riego ?? []) : null
  const filasTipo = gastosVigentes?.datos?.operaciones?.find(o => o.tipo === tipo)?.filas ?? []
  const burbujasTipo = burbujasDeOperaciones(filasTipo, tipo)
  const etiquetaTipo = TIPOS.find(t => t.valor === tipo)?.etiqueta ?? tipo

  // ingresos, gastos y ganancia neta de la parcela seleccionada, de la misma
  // fuente que el resto de la pestaña (/api/analisis/rentabilidad)
  const rentabilidadParcela = rentabilidad.find(p => String(p.parcela_id) === String(parcelaId))
  const nombreParcela = resumen?.parcela?.nombre
    ?? parcelas.find(p => String(p.id) === String(parcelaId))?.nombre
    ?? ''

  return (
    <div className="rentabilidad-contenedor">
      {error && <span className="mensaje-error">{error}</span>}

      {!parcelaId && !error && (
        <p className="rentabilidad-vacio">No hay parcelas para analizar.</p>
      )}

      <section className="analisis-parcela">
        <div className="analisis-parcela-cabecera">
          <h2 className="analisis-parcela-titulo">{nombreParcela || 'Análisis de parcela'}</h2>
          <div className="menuExplo">
            <div className="menu-button">
              <div className="filtro-explo">
                <div className="barra-select">
                  <select value={parcelaId} onChange={(e) => setParcelaId(e.target.value)}>
                    {parcelas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
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

        {rentabilidadParcela && (
          <BarraIngresosGastos
            ingresos={rentabilidadParcela.ingresos}
            gastos={rentabilidadParcela.costes}
            gananciaNeta={rentabilidadParcela.gananciaNeta}
            margen={rentabilidadParcela.margen}
            sinDatos={rentabilidadParcela.sinDatos}
          />
        )}

        {resumen && (
          <>
            {/* Card 1: gasto total y gasto por hanegada del año completo */}
            <div className="rentabilidad-card">
              <div className="rentabilidad-cabecera-izq">
                <img src="./analisis.svg" alt="Análisis" />
                <h4>Gasto de la parcela</h4>
              </div>
              <div className="rentabilidad-resumen">
                <span>{resumen.parcela.hanegadas} hanegadas</span>
              </div>
              <RentabilidadBarra
                categoria={resumen.rentabilidad?.categoria}
                percentil={resumen.rentabilidad?.percentil}
              />
              <BurbujasFlotantes
                datos={[
                  { id: 'total', etiqueta: `Gasto total (${resumen.anio})`, valor: resumen.gastoTotal },
                  { id: 'hanegada', etiqueta: 'Gasto por hanegada', valor: resumen.gastoPorHanegada },
                ]}
                formatoValor={(v) => formatoEuro(v)}
                proporcional={false}
              />
            </div>

            {/* Card 2: desglose por tipo de operación */}
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
              ) : tipo === 'fumigacion' || tipo === 'todas' ? (
                desglose.fumigacion ? (
                  <DesgloseFumigacion fumigacion={desglose.fumigacion} />
                ) : (
                  <div className="rentabilidad-desplegable">
                    <div className="rentabilidad-total">
                      <span>Total {etiquetaTipo.toLowerCase()}</span>
                      <span>{formatoEuro(desglose.gastoTotal)}</span>
                    </div>
                  </div>
                )
              ) : (
                <>
                  <BurbujasFlotantes
                    datos={burbujasTipo}
                    formatoValor={(v) => formatoEuro(v)}
                    vacio={`Sin operaciones de ${etiquetaTipo.toLowerCase()} registradas en ${anio}.`}
                  />
                  <div className="rentabilidad-desplegable">
                    <div className="rentabilidad-fila-parcela">
                      <span>Gasto por hanegada</span>
                      <span>{formatoEuro(desglose.gastoPorHanegada)}</span>
                    </div>
                    <div className="rentabilidad-total">
                      <span>Total {etiquetaTipo.toLowerCase()} (mano de obra y material)</span>
                      <span>{formatoEuro(desglose.gastoTotal)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Card 3: comparativa con la media del resto de parcelas */}
            <div className="rentabilidad-card">
              <div className="rentabilidad-cabecera-izq"><h4>Gasto/hanegada vs. media del resto de parcelas</h4></div>
              <GraficoComparativo
                parcela={resumen.comparativa.gastoPorHanegadaParcela}
                media={resumen.comparativa.gastoPorHanegadaMediaResto}
                nombreParcela={resumen.parcela.nombre}
              />
            </div>
          </>
        )}

        {costesMetodo && (
          <div className="rentabilidad-card">
            <div className="rentabilidad-cabecera-izq"><h4>Gasto de productos químicos por hanegada: tractor vs. mochila</h4></div>
            <ConsumoAguaBarra litrosPorHanegadaPorAplicacion={litrosPorHanegadaPorAplicacion} />
            <BurbujasMetodos
              tractor={costesMetodo.metodos.tractor}
              mochila={costesMetodo.metodos.mochila}
              valorPrincipal={(m) => m.gastoPorHanegada}
              etiquetaPrincipal={(m) => formatoEuro(m.gastoPorHanegada)}
              valorProducto={(p) => p.costeTotal}
              etiquetaProducto={(p) => formatoEuro(p.costeTotal)}
            />
            <div className="rentabilidad-desplegable">
              <div className="rentabilidad-fila-parcela">
                <span>Tractor: coste total</span>
                <span>{formatoEuro(costesMetodo.metodos.tractor.costeTotal)}</span>
              </div>
              <div className="rentabilidad-fila-parcela">
                <span>Mochila: coste total</span>
                <span>{formatoEuro(costesMetodo.metodos.mochila.costeTotal)}</span>
              </div>
              <div className="rentabilidad-fila-parcela">
                <span>Tractor: litros totales</span>
                <span>{formatoNumero(costesMetodo.metodos.tractor.litros)} L</span>
              </div>
              <div className="rentabilidad-fila-parcela">
                <span>Mochila: litros totales</span>
                <span>{formatoNumero(costesMetodo.metodos.mochila.litros)} L</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Ganancia neta histórica: mismo componente y misma escala de color
          que el resto de gráficos de rentabilidad de la pestaña */}
      <div className="rentabilidad-card">
        <div className="rentabilidad-cabecera-izq"><h4>Ganancia neta histórica (todas las parcelas)</h4></div>
        <GraficoRentabilidad
          datos={historico.map(a => ({ categoria: String(a.anio), valor: a.gananciaNeta, margen: a.margen }))}
          nombreValor="Ganancia neta (€)"
        />
      </div>

      {rentabilidad.length > 0 && (
        <div className="rentabilidad-card">
          <div className="rentabilidad-cabecera">
            <div className="rentabilidad-cabecera-izq"><h4>Mapa de ganancia neta por parcela</h4></div>
            <button
              type="button"
              className={`btn-vista ${mostrarTablaMargen ? 'activo' : ''}`}
              onClick={() => setMostrarTablaMargen(v => !v)}
            >
              <img src={mostrarTablaMargen ? './iconTable.png' : './cuadrado.png'} alt="vista" />
              {mostrarTablaMargen ? 'Burbujas' : 'Tabla'}
            </button>
          </div>

          {mostrarTablaMargen ? (
            <div className="leyenda-margen">
              {LEYENDA_MARGEN.map(t => (
                <div className="leyenda-margen-item" key={t.clase}>
                  <span className={`leyenda-margen-swatch ${t.clase}`}></span>
                  <span>{t.etiqueta} ({t.rango})</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="leyenda-ganancia">
              <span><span className="leyenda-ganancia-swatch leyenda-ganancia-swatch--perdida"></span> Pérdida</span>
              <span><span className="leyenda-ganancia-swatch leyenda-ganancia-swatch--ganancia"></span> Ganancia (más oscuro = más ganancia)</span>
              <span><span className="leyenda-ganancia-swatch leyenda-ganancia-swatch--sin-datos"></span> Sin datos</span>
            </div>
          )}

          {mostrarTablaMargen ? (
            <table className="tabla-operaciones tabla-margen">
              <thead>
                <tr>
                  <th>Parcela</th>
                  <th>Ingresos (brutos)</th>
                  <th>Gastos</th>
                  <th>Ganancia neta</th>
                  <th>Margen</th>
                </tr>
              </thead>
              <tbody>
                {rentabilidad.map(p => {
                  const tramo = tramoMargen(p.margen)
                  return (
                    <tr key={p.parcela_id} className={tramo.clase}>
                      <td>{p.nombre}</td>
                      <td>{formatoEuro(p.ingresos)}</td>
                      <td>{formatoEuro(p.costes)}</td>
                      <td>{formatoEuro(p.gananciaNeta)}</td>
                      <td className="margen-valor">
                        {p.margen !== null ? `${p.margen.toFixed(2)}% · ${tramo.etiqueta}` : tramo.etiqueta}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <BurbujasGanancia datos={rentabilidad} formatoEuro={formatoEuro} />
          )}
        </div>
      )}
    </div>
  )
}

export default Analisis
