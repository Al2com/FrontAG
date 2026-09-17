import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'

const formatoEuro = (valor) => (valor === null || valor === undefined ? '-' : `${valor.toFixed(2)} €`)

// Barra horizontal que compara el gasto/hanegada de la parcela seleccionada
// con la media del resto de parcelas del admin, o con OTRA parcela concreta
// elegida en el select de comparacion (etiquetaComparacion cambia segun cual
// sea), para ese MISMO tipo/metodo y año (el filtro ya lo hace el backend,
// aqui no se recalcula nada). Las dos barras comparten un unico color: rojo
// si la parcela gasta mas que el punto de comparacion, verde si gasta igual
// o menos, para que se lea como un semaforo de un vistazo.
const ComparativaMediaResto = ({ nombreParcela, etiquetaComparacion = 'Media resto', parcelaPorHanegada, comparacionPorHanegada }) => {
  const porEncimaDeLaComparacion = parcelaPorHanegada > comparacionPorHanegada
  const color = porEncimaDeLaComparacion ? 'var(--rentab-baja)' : 'var(--c-primario-medio)'

  const datos = [
    { categoria: nombreParcela, valor: parcelaPorHanegada },
    { categoria: etiquetaComparacion, valor: comparacionPorHanegada },
  ]

  return (
    <div style={{ width: '100%', height: 130 }}>
      <ResponsiveContainer>
        <BarChart data={datos} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" horizontal={false} />
          <XAxis type="number" stroke="var(--c-texto-apagado)" tickFormatter={(v) => formatoEuro(v)} />
          <YAxis type="category" dataKey="categoria" stroke="var(--c-texto-apagado)" width={110} />
          <Tooltip formatter={(valor) => [`${formatoEuro(valor)} / hanegada`, '']} />
          <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
            {datos.map((d) => (
              <Cell key={d.categoria} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ComparativaMediaResto
