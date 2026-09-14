import { useEffect, useState } from 'react'
import analisisService from '../services/analisis'
import parcelasService from '../services/parcelas'
import GraficoRentabilidad from './GraficoRentabilidad'
import BurbujasMetodos from './BurbujasMetodos'
import BurbujasGanancia from './BurbujasGanancia'
import BurbujasFlotantes from './BurbujasFlotantes'
import RentabilidadBarra from './RentabilidadBarra'
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

const Analisis = () => {
  const anioActual = new Date().getFullYear()
  const anios = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3]

  const [parcelas, setParcelas] = useState([])
  const [parcelaId, setParcelaId] = useState('')
  const [anio, setAnio] = useState(anioActual.toString())
  const [tipo, setTipo] = useState('todas')
  const [resumen, setResumen] = useState(null)
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

  // pido el analisis cada vez que cambia algun filtro, en cuanto hay parcela seleccionada
  useEffect(() => {
    if (!parcelaId) return
    setError('')
    analisisService.getResumenParcela(parcelaId, anio, tipo)
      .then(data => setResumen(data))
      .catch(() => setError('Error al cargar el análisis'))
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

  return (
    <div className="rentabilidad-contenedor">
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
          <div className="filtro-explo">
            <div className="barra-select">
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <span className="mensaje-error">{error}</span>}

      {!parcelaId && !error && (
        <p className="rentabilidad-vacio">No hay parcelas para analizar.</p>
      )}

      {resumen && (
        <>
          <div className="rentabilidad-card">
            <div className="rentabilidad-cabecera-izq">
              <img src="./analisis.svg" alt="Análisis" />
              <h4>{resumen.parcela.nombre}</h4>
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

          {resumen.fumigacion && (
            <div className="rentabilidad-card">
              <div className="rentabilidad-cabecera-izq"><h4>Fumigación: tractor vs. mochila</h4></div>
              <BurbujasMetodos
                tractor={{
                  costeTotal: resumen.fumigacion.tractor.costeTotal,
                  productos: [
                    { producto_id: 'producto', nombre: 'Producto', valor: resumen.fumigacion.tractor.costeProducto },
                    { producto_id: 'manoObra', nombre: 'Mano de obra', valor: resumen.fumigacion.tractor.costeManoObra },
                  ],
                }}
                mochila={{
                  costeTotal: resumen.fumigacion.mochila.costeTotal,
                  productos: [
                    { producto_id: 'producto', nombre: 'Producto', valor: resumen.fumigacion.mochila.costeProducto },
                    { producto_id: 'manoObra', nombre: 'Mano de obra', valor: resumen.fumigacion.mochila.costeManoObra },
                  ],
                }}
                valorPrincipal={(m) => m.costeTotal}
                etiquetaPrincipal={(m) => formatoEuro(m.costeTotal)}
                valorProducto={(p) => p.valor}
                etiquetaProducto={(p) => formatoEuro(p.valor)}
              />
              <div className="rentabilidad-desplegable">
                <div className="rentabilidad-fila-parcela">
                  <span>Tractor: litros aplicados</span>
                  <span>{resumen.fumigacion.tractor.litros} L</span>
                </div>
                <div className="rentabilidad-fila-parcela">
                  <span>Mochila: litros aplicados</span>
                  <span>{resumen.fumigacion.mochila.litros} L</span>
                </div>
              </div>
            </div>
          )}

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
        <>
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
        </>
      )}

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
