import BarraSemaforo from './BarraSemaforo'

// posiciona la parcela segun su percentil exacto de margen/hanegada frente
// al resto de parcelas de la misma explotacion (100% = azul = mas rentable)
const ETIQUETAS = { alta: 'Alta', media: 'Media', baja: 'Baja' }
const POLARIDAD = { alta: 'positiva', media: 'neutra', baja: 'negativa' }

const RentabilidadBarra = ({ categoria, percentil }) => {
  const sinDatos = !categoria || percentil === null || percentil === undefined

  return (
    <BarraSemaforo
      posicion={sinDatos ? 0 : percentil}
      etiqueta={sinDatos ? '' : `Rentabilidad: ${ETIQUETAS[categoria] ?? '-'}`}
      polaridad={sinDatos ? null : POLARIDAD[categoria]}
      sinDatos={sinDatos}
      mensajeSinDatos="Rentabilidad: sin datos comparables"
    />
  )
}

export default RentabilidadBarra
