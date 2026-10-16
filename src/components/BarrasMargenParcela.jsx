import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine,
} from 'recharts'

// Colores pedidos para el gráfico de rentabilidad por parcela: verde si la
// parcela gana (margen neto por hanegada >= 0), rojo si pierde.
const VERDE = '#3b6d11'
const ROJO = '#a32d2d'

const formatoEuro = (valor) => (valor === null || valor === undefined ? '-' : `${valor.toFixed(2)} €`)

// Un único gráfico de barras horizontales con el margen neto por hanegada de
// cada parcela del admin en el año seleccionado. Sustituye al antiguo mapa de
// dispersión (scatter) y al gráfico histórico: de un vistazo se ve quién es
// rentable (verde) y quién pierde (rojo) sin cruzar dos ejes.
//
// datos: [{ categoria: string, valor: number }]  (valor = €/hanegada neto)
const BarrasMargenParcela = ({ datos, alturaMinima = 220 }) => {
  if (!datos || datos.length === 0) {
    return <p className="rentabilidad-vacio">No hay datos para mostrar.</p>
  }

  return (
    <>
      {/* leyenda propia en HTML (no la de recharts) */}
      <div className="analisis-leyenda-chips">
        <span className="analisis-chip">
          <span className="analisis-chip-swatch" style={{ backgroundColor: VERDE }} />
          Rentable
        </span>
        <span className="analisis-chip">
          <span className="analisis-chip-swatch" style={{ backgroundColor: ROJO }} />
          Pérdidas
        </span>
      </div>

      <div style={{ width: '100%', height: Math.max(alturaMinima, datos.length * 40) }}>
        <ResponsiveContainer>
          <BarChart data={datos} layout="vertical" margin={{ left: 24, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" horizontal={false} />
            <XAxis type="number" stroke="var(--c-texto-apagado)" tickFormatter={(v) => formatoEuro(v)} />
            <YAxis type="category" dataKey="categoria" stroke="var(--c-texto-apagado)" width={120} />
            <ReferenceLine x={0} stroke="var(--c-texto-apagado)" />
            <Tooltip
              formatter={(valor) => [`${formatoEuro(valor)} / hanegada`, 'Margen neto']}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
              {datos.map((d) => (
                <Cell key={d.categoria} fill={d.valor >= 0 ? VERDE : ROJO} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

export default BarrasMargenParcela
