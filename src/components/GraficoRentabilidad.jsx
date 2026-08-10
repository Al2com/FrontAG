import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts'
import { tramoMargen } from '../utils/margenColor'

const formatoEuro = (valor) => (valor === null || valor === undefined ? '-' : `${valor.toFixed(2)} €`)

// Gráfico de barras reutilizable para ganancia neta: mismo tipo, ejes,
// tooltip y escala de color en cualquier sitio que lo use (por parcela de un
// año, o total por año histórico) para que las barras se lean igual y se
// puedan comparar sin esfuerzo entre ambos gráficos.
//
// datos: [{ categoria: string, valor: number, margen: number|null }]
// valor es SIEMPRE neto (ingresos - gastos), nunca ingresos brutos.
const GraficoRentabilidad = ({ datos, nombreValor = 'Ganancia neta (€)', alturaMinima = 220 }) => {
  if (!datos || datos.length === 0) {
    return <p className="rentabilidad-vacio">No hay datos para mostrar.</p>
  }

  return (
    <div style={{ width: '100%', height: Math.max(alturaMinima, datos.length * 40) }}>
      <ResponsiveContainer>
        <BarChart data={datos} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" />
          <XAxis type="number" stroke="var(--c-texto-apagado)" tickFormatter={formatoEuro} />
          <YAxis type="category" dataKey="categoria" stroke="var(--c-texto-apagado)" width={110} />
          <Tooltip
            formatter={(valor, nombre, item) => {
              const margen = item?.payload?.margen
              const sufijo = margen === null || margen === undefined ? ' (sin datos de margen)' : ` (margen ${margen.toFixed(2)}%)`
              return [`${formatoEuro(valor)}${sufijo}`, nombre]
            }}
          />
          <Legend />
          <Bar dataKey="valor" name={nombreValor} radius={[0, 4, 4, 0]}>
            {datos.map((d, i) => (
              <Cell key={i} fill={tramoMargen(d.margen).fondo} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GraficoRentabilidad
