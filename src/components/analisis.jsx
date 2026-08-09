import { useEffect, useState } from 'react'
import analisisService from '../services/analisis'
import parcelasService from '../services/parcelas'
import './Style/cards.css'
import './Style/search.css'
import './Style/forms.css'
import './Style/analisis.css'

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
    </div>
  )
}

export default Analisis
