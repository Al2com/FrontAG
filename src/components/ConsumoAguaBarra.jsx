import BarraSemaforo from './BarraSemaforo'

// escala absoluta (no relativa a otras parcelas, a diferencia de la barra de
// rentabilidad): 100 L/hanegada/aplicacion = eficiente, 250 = derroche
const LIMITE_BAJO = 100
const LIMITE_ALTO = 250

const clasificar = (valor) => {
  if (valor <= 150) return { texto: 'Bajo', polaridad: 'positiva' }
  if (valor <= 200) return { texto: 'Medio', polaridad: 'neutra' }
  return { texto: 'Alto', polaridad: 'negativa' }
}

const ConsumoAguaBarra = ({ litrosPorHanegadaPorAplicacion }) => {
  const sinDatos = litrosPorHanegadaPorAplicacion === null || litrosPorHanegadaPorAplicacion === undefined

  if (sinDatos) {
    return (
      <BarraSemaforo
        titulo="Consumo agua turbo por parcela"
        sinDatos
        mensajeSinDatos="Consumo: sin aplicaciones de tractor"
      />
    )
  }

  const { texto, polaridad } = clasificar(litrosPorHanegadaPorAplicacion)

  // aqui el azul (bueno) es el consumo BAJO, al reves que en la barra de
  // rentabilidad (donde el azul es el valor ALTO): se invierte la posicion,
  // no el degradado, asi que a menor consumo mas cerca del extremo azul (100%)
  const proporcion = Math.min(1, Math.max(0, (litrosPorHanegadaPorAplicacion - LIMITE_BAJO) / (LIMITE_ALTO - LIMITE_BAJO)))
  const posicion = (1 - proporcion) * 100

  return (
    <BarraSemaforo
      titulo="Consumo agua turbo por parcela"
      posicion={posicion}
      etiqueta={`Consumo: ${texto}`}
      polaridad={polaridad}
    />
  )
}

export default ConsumoAguaBarra
