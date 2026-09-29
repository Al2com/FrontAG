// Estado rentable/umbral/pérdidas de una parcela según gastos e ingresos:
// usado tanto por el color de la burbuja de DispersionRentabilidad como por
// el chip de su tabla, para que las dos vistas coincidan siempre.

// rentable si ingresos superan los gastos en más de un 10%, pérdidas si
// quedan más de un 10% por debajo, y "umbral" (equilibrio) en la banda del
// medio. Con gastos 0 no hay ratio que calcular: rentable si hay ingresos,
// si no, umbral (no hay datos suficientes para llamarlo pérdida)
export const calcularEstado = (ingresos, gastos) => {
  if (gastos <= 0) return ingresos > 0 ? 'rentable' : 'umbral'
  const diferenciaRelativa = (ingresos - gastos) / gastos
  if (diferenciaRelativa > 0.1) return 'rentable'
  if (diferenciaRelativa < -0.1) return 'perdidas'
  return 'umbral'
}

export const COLOR_ESTADO = {
  rentable: 'var(--grove)',
  umbral: 'var(--citrus)',
  perdidas: 'var(--persimmon)',
}

export const ETIQUETA_ESTADO = {
  rentable: 'Rentable',
  umbral: 'Umbral',
  perdidas: 'Pérdidas',
}
