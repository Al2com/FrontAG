import './Style/burbujasFlotantes.css'

// diametro minimo y maximo de una burbuja, igual criterio que BurbujasMetodos:
// un elemento con un valor muy bajo respecto al resto sigue siendo legible
const DIAMETRO_MIN = 60
const DIAMETRO_MAX = 160

const calcularDiametro = (valor, valorMaximo) => {
  if (!valorMaximo || valorMaximo <= 0) return DIAMETRO_MIN
  const proporcion = Math.min(Math.max(valor / valorMaximo, 0), 1)
  return DIAMETRO_MIN + proporcion * (DIAMETRO_MAX - DIAMETRO_MIN)
}

// nube de burbujas flotantes sin desglose (sin nivel de detalle): cada
// burbuja es un elemento independiente, con tamaño proporcional a su valor
// dentro del conjunto. Pensada para listas cortas de categorias (proveedores,
// productos...) donde no hace falta comparar tendencia ni orden temporal.
//
// datos: [{ id, etiqueta, valor }]
// formatoValor(valor) -> texto mostrado dentro de la burbuja y en su aria-label
// proporcional: si es false, todas las burbujas salen del mismo tamaño (KPIs
// en unidades distintas, p.ej. € total vs €/hanegada, donde comparar tamaños
// entre si seria enganoso aunque visualmente se quiera el mismo estilo)
const BurbujasFlotantes = ({ datos, formatoValor, vacio = 'Sin datos para mostrar.', proporcional = true }) => {
  if (!datos || datos.length === 0) {
    return <p className="rentabilidad-vacio">{vacio}</p>
  }

  const valorMaximo = proporcional ? Math.max(...datos.map(d => d.valor || 0)) : 0

  return (
    <ul className="burbujas-flotantes" aria-label="Comparativa proporcional al valor de cada elemento">
      {datos.map((item) => {
        const diametro = proporcional ? calcularDiametro(item.valor || 0, valorMaximo) : DIAMETRO_MAX
        return (
          <li
            key={item.id}
            className="burbuja-flotante"
            style={{ width: diametro, height: diametro }}
            aria-label={`${item.etiqueta}: ${formatoValor(item.valor)}`}
          >
            <span className="burbuja-flotante-valor">{formatoValor(item.valor)}</span>
            <span className="burbuja-flotante-etiqueta">{item.etiqueta}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default BurbujasFlotantes
