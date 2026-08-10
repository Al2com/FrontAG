// Escala de color única para el margen de rentabilidad por parcela.
// Único sitio donde se definen los tramos: cualquier vista (tabla, cards,
// leyenda) debe pasar por aquí en vez de repetir los umbrales.
// fondo/texto deben coincidir con las clases .margen-* de analisis.css: el
// DOM (tabla/cards) pinta vía clase CSS, y Recharts (que no puede leer clases
// CSS en el atributo fill de un <Cell>) usa fondo directamente desde aquí.
export const TRAMOS_MARGEN = [
  { clase: 'margen-perdidas', etiqueta: 'Pérdidas', rango: '< 0%', limiteInferior: -Infinity, fondo: '#E24B4A', texto: '#501313' },
  { clase: 'margen-equilibrio', etiqueta: 'Equilibrio', rango: '0% – 10%', limiteInferior: 0, fondo: '#EF9F27', texto: '#412402' },
  { clase: 'margen-ganancia-baja', etiqueta: 'Ganancia baja', rango: '10% – 20%', limiteInferior: 10, fondo: '#C0DD97', texto: '#173404' },
  { clase: 'margen-ganancia-media', etiqueta: 'Ganancia media', rango: '20% – 30%', limiteInferior: 20, fondo: '#639922', texto: '#EAF3DE' },
  { clase: 'margen-ganancia-alta', etiqueta: 'Ganancia alta', rango: '≥ 30%', limiteInferior: 30, fondo: '#173404', texto: '#C0DD97' },
]

export const TRAMO_SIN_DATOS = { clase: 'margen-sin-datos', etiqueta: 'Sin datos', rango: '—', fondo: '#9AA0A6', texto: '#1F1F1F' }

// Devuelve el tramo (clase CSS + etiqueta) que corresponde a un margen (%).
// margen null/undefined => sin datos (parcela sin recolección o sin gastos,
// no se puede calcular sin dividir por cero).
export function tramoMargen(margen) {
  if (margen === null || margen === undefined || Number.isNaN(margen)) return TRAMO_SIN_DATOS

  // los limiteInferior están en orden ascendente: el último que el margen supera es el tramo
  let tramo = TRAMOS_MARGEN[0]
  for (const t of TRAMOS_MARGEN) {
    if (margen >= t.limiteInferior) tramo = t
  }
  return tramo
}

export const LEYENDA_MARGEN = [...TRAMOS_MARGEN, TRAMO_SIN_DATOS]
