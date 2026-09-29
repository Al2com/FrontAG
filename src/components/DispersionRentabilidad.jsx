import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ReferenceLine, Cell,
} from 'recharts'
import { COLOR_ESTADO } from '../utils/estadoRentabilidad'

const formatoEuro = (valor) => (valor === null || valor === undefined ? '-' : `${valor.toFixed(2)} €`)

// Tooltip propio: el formatter por defecto de Recharts no deja mostrar
// varios campos a la vez con el mismo formato que el resto de la pestaña.
// Solo ganancia (no gastos/ingresos por separado): es lo que responde a la
// pregunta que hace el gráfico, "¿quién gana más?"
const TooltipParcela = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const ganancia = d.ingresos - d.gastos
  const gananciaPorHanegada = d.hanegadas > 0 ? ganancia / d.hanegadas : null

  return (
    <div className="rentabilidad-desplegable">
      <div className="tooltip-parcela-nombre">{d.nombre}</div>
      <div className="rentabilidad-fila-parcela">
        <span>Ganancia total</span>
        <span>{formatoEuro(ganancia)}</span>
      </div>
      <div className="rentabilidad-fila-parcela">
        <span>Ganancia por hanegada</span>
        <span>{formatoEuro(gananciaPorHanegada)}</span>
      </div>
    </div>
  )
}

// Rentabilidad de cada parcela en un plano gastos/ingresos: por encima de la
// diagonal (ingresos > gastos) hay beneficio, por debajo pérdidas. El tamaño
// de la burbuja son las hanegadas y el color es rentable/umbral/pérdidas
// según calcularEstado, el mismo criterio que usa la tabla de esta tarjeta.
//
// datos: [{ nombre, gastos, ingresos, hanegadas, gastoPorHanegada, estado }]
const DispersionRentabilidad = ({ datos, alturaMinima = 320 }) => {
  if (!datos || datos.length === 0) {
    return <p className="rentabilidad-vacio">No hay datos para mostrar.</p>
  }

  const maximoEje = Math.max(...datos.map(d => Math.max(d.gastos, d.ingresos)), 0)

  return (
    <div style={{ width: '100%', height: alturaMinima }}>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" />
          <XAxis
            dataKey="gastos"
            type="number"
            name="Gastos"
            stroke="var(--c-texto-apagado)"
            tickFormatter={formatoEuro}
          />
          <YAxis
            dataKey="ingresos"
            type="number"
            name="Ingresos"
            stroke="var(--c-texto-apagado)"
            tickFormatter={formatoEuro}
          />
          <ZAxis dataKey="hanegadas" range={[80, 700]} name="Hanegadas" />
          <ReferenceLine
            segment={[{ x: 0, y: 0 }, { x: maximoEje, y: maximoEje }]}
            stroke="var(--c-texto-apagado)"
            strokeDasharray="4 4"
          />
          <Tooltip cursor={{ strokeDasharray: '3 3', stroke: 'var(--c-borde)' }} content={<TooltipParcela />} />
          <Scatter data={datos}>
            {datos.map((d, i) => <Cell key={i} fill={COLOR_ESTADO[d.estado]} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DispersionRentabilidad
