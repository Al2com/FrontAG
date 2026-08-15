// Paleta fija para identificar visualmente cada parcela a manta en el
// calendario de riego. El índice de una parcela en la lista ordenada por id
// determina su color, así que es estable mientras no cambien las parcelas.
const PALETA = [
  '#1B4332', '#40916C', '#52B788', '#E9A800', '#4A90D9',
  '#DC3545', '#8E44AD', '#D97706', '#0E7490', '#A3324A',
]

export function colorParcela(indice) {
  return PALETA[indice % PALETA.length]
}
