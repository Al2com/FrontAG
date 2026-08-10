import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import analisisService from '../services/analisis'
import parcelasService from '../services/parcelas'
import GraficoRentabilidad from './GraficoRentabilidad'
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
            <div className="rentabilidad-desplegable">
              <div className="rentabilidad-fila-parcela">
                <span>Gasto total ({resumen.anio})</span>
                <span>{resumen.gastoTotal.toFixed(2)} €</span>
              </div>
              <div className="rentabilidad-fila-parcela">
                <span>Gasto por hanegada</span>
                <span>{resumen.gastoPorHanegada.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {resumen.fumigacion && (
            <div className="rentabilidad-card">
              <div className="rentabilidad-cabecera-izq"><h4>Fumigación</h4></div>
              <div className="rentabilidad-desplegable">
                <div className="rentabilidad-fila-parcela">
                  <span>Producto</span>
                  <span>{resumen.fumigacion.costeProducto.toFixed(2)} €</span>
                </div>
                <div className="rentabilidad-fila-parcela">
                  <span>Mano de obra</span>
                  <span>{resumen.fumigacion.costeManoObra.toFixed(2)} €</span>
                </div>
                <div className="rentabilidad-fila-parcela">
                  <span>Litros aplicados</span>
                  <span>{resumen.fumigacion.litros} L</span>
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
            <div className="rentabilidad-cabecera-izq"><h4>Gasto por hanegada: tractor vs. mochila</h4></div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={[
                  { metodo: 'Tractor', gastoPorHanegada: costesMetodo.metodos.tractor.gastoPorHanegada },
                  { metodo: 'Mochila', gastoPorHanegada: costesMetodo.metodos.mochila.gastoPorHanegada },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" />
                  <XAxis dataKey="metodo" stroke="var(--c-texto-apagado)" />
                  <YAxis stroke="var(--c-texto-apagado)" />
                  <Tooltip formatter={(v) => formatoEuro(v)} />
                  <Bar dataKey="gastoPorHanegada" name="€/hanegada" fill="var(--c-primario)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rentabilidad-desplegable">
              <div className="rentabilidad-fila-parcela">
                <span>Tractor: coste total</span>
                <span>{formatoEuro(costesMetodo.metodos.tractor.costeTotal)}</span>
              </div>
              <div className="rentabilidad-fila-parcela">
                <span>Mochila: coste total</span>
                <span>{formatoEuro(costesMetodo.metodos.mochila.costeTotal)}</span>
              </div>
            </div>
          </div>

          <div className="rentabilidad-card">
            <div className="rentabilidad-cabecera-izq"><h4>Litros aplicados por método</h4></div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={[
                  { metodo: 'Tractor', litros: costesMetodo.metodos.tractor.litros },
                  { metodo: 'Mochila', litros: costesMetodo.metodos.mochila.litros },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" />
                  <XAxis dataKey="metodo" stroke="var(--c-texto-apagado)" />
                  <YAxis stroke="var(--c-texto-apagado)" />
                  <Tooltip formatter={(v) => formatoNumero(v, ' L')} />
                  <Bar dataKey="litros" name="Litros" fill="var(--c-primario-claro)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {(costesMetodo.metodos.tractor.productos.length > 0 || costesMetodo.metodos.mochila.productos.length > 0) && (
              <div className="rentabilidad-desplegable">
                {['tractor', 'mochila'].map(metodo => (
                  costesMetodo.metodos[metodo].productos.length > 0 && (
                    <div key={metodo}>
                      <div className="rentabilidad-fila-parcela"><strong>{metodo === 'tractor' ? 'Tractor' : 'Mochila'}: dosis por producto</strong></div>
                      {costesMetodo.metodos[metodo].productos.map(p => (
                        <div className="rentabilidad-fila-parcela" key={p.producto_id}>
                          <span>{p.nombre} ({formatoNumero(p.dosisMedia, ` ${p.unidad}/aplicación`)})</span>
                          <span>{formatoNumero(p.cantidadTotal, ` ${p.unidad}`)} · {formatoEuro(p.costeTotal)}</span>
                        </div>
                      ))}
                    </div>
                  )
                ))}
              </div>
            )}
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
              {mostrarTablaMargen ? 'Tarjetas' : 'Tabla'}
            </button>
          </div>

          <div className="leyenda-margen">
            {LEYENDA_MARGEN.map(t => (
              <div className="leyenda-margen-item" key={t.clase}>
                <span className={`leyenda-margen-swatch ${t.clase}`}></span>
                <span>{t.etiqueta} ({t.rango})</span>
              </div>
            ))}
          </div>

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
            rentabilidad.map(p => {
              const tramo = tramoMargen(p.margen)
              return (
                <div className={`margen-card ${tramo.clase}`} key={p.parcela_id}>
                  <span className="margen-card-nombre">{p.nombre}</span>
                  <div className="margen-card-datos">
                    <span className="margen-valor">
                      {p.margen !== null ? `${p.margen.toFixed(2)}%` : tramo.etiqueta}
                    </span>
                    <span>Ganancia neta {formatoEuro(p.gananciaNeta)}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default Analisis
