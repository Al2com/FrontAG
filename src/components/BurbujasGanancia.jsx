import './Style/burbujasGanancia.css'

// mismo criterio de tamaño que el resto de burbujas de la app: minimo
// visible, maximo razonable para no desbordar la card
const DIAMETRO_MIN = 60
const DIAMETRO_MAX = 170
// por debajo de este diámetro un importe tipo "1.234,56 €" a 13px ya no cabe
// sin desbordar el círculo ni encogerse hasta ilegible: se oculta el texto y
// el importe pasa a verse solo al pasar el cursor (title, tooltip nativo)
const DIAMETRO_MIN_PARA_VALOR = 90

const calcularDiametro = (valorAbsoluto, maximoAbsoluto) => {
  if (!maximoAbsoluto || maximoAbsoluto <= 0) return DIAMETRO_MIN
  const proporcion = Math.min(Math.max(valorAbsoluto / maximoAbsoluto, 0), 1)
  return DIAMETRO_MIN + proporcion * (DIAMETRO_MAX - DIAMETRO_MIN)
}

// mezcla el color base (rojo perdida / azul ganancia) con el fondo segun la
// magnitud: cuanto mayor es la ganancia o la perdida, mas saturada sale la
// burbuja; el 45% de suelo evita burbujas casi invisibles con poco importe
const colorPorMagnitud = (colorBase, valorAbsoluto, maximoAbsoluto) => {
  const proporcion = maximoAbsoluto > 0 ? Math.min(Math.max(valorAbsoluto / maximoAbsoluto, 0), 1) : 0
  const mezcla = 45 + proporcion * 55
  return `color-mix(in srgb, ${colorBase} ${mezcla}%, var(--c-blanco))`
}

// burbujas de ganancia neta por parcela: tamaño proporcional a la magnitud
// (perdida o ganancia, en valor absoluto), color por signo -> rojo si hay
// perdidas, azul (mas oscuro cuanta mas ganancia) si hay beneficio, gris si
// la parcela no tiene datos suficientes para calcular el margen
const BurbujasGanancia = ({ datos, formatoEuro }) => {
  if (!datos || datos.length === 0) {
    return <p className="rentabilidad-vacio">No hay datos para mostrar.</p>
  }

  const valoresConDatos = datos.filter(p => p.gananciaNeta !== null && p.gananciaNeta !== undefined)
  const maximoAbsoluto = valoresConDatos.length > 0
    ? Math.max(...valoresConDatos.map(p => Math.abs(p.gananciaNeta)))
    : 0

  return (
    <ul className="burbujas-ganancia" aria-label="Ganancia neta por parcela: tamaño según magnitud, rojo si hay pérdidas, azul si hay ganancia">
      {datos.map((p) => {
        const sinDatos = p.gananciaNeta === null || p.gananciaNeta === undefined
        const esPerdida = !sinDatos && p.gananciaNeta < 0
        const diametro = sinDatos ? DIAMETRO_MIN : calcularDiametro(Math.abs(p.gananciaNeta), maximoAbsoluto)
        const fondo = sinDatos
          ? 'color-mix(in srgb, var(--c-texto-apagado) 45%, var(--c-blanco))'
          : colorPorMagnitud(esPerdida ? 'var(--c-peligro)' : 'var(--estado-revisado)', Math.abs(p.gananciaNeta), maximoAbsoluto)

        const descripcion = sinDatos
          ? `${p.nombre}: sin datos suficientes para calcular el margen`
          : `${p.nombre}: ${esPerdida ? 'pérdida' : 'ganancia'} de ${formatoEuro(Math.abs(p.gananciaNeta))}${p.margen !== null ? `, margen ${p.margen.toFixed(2)}%` : ''}`

        // en burbujas pequeñas el importe no cabe: se quita del interior y
        // solo queda accesible al pasar el cursor, vía title (tooltip nativo)
        const valorVisible = diametro >= DIAMETRO_MIN_PARA_VALOR

        return (
          <li
            key={p.parcela_id}
            className="burbuja-ganancia"
            style={{ width: diametro, height: diametro, background: fondo }}
            aria-label={descripcion}
            title={valorVisible ? undefined : descripcion}
          >
            {valorVisible && (
              <span className="burbuja-ganancia-valor">
                {sinDatos ? '—' : `${esPerdida ? '-' : '+'}${formatoEuro(Math.abs(p.gananciaNeta))}`}
              </span>
            )}
            <span className="burbuja-ganancia-nombre">{p.nombre}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default BurbujasGanancia
