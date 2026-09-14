import { useState } from 'react'

// ordenacion de tabla compartida: alterna asc/desc al pulsar la misma
// columna, arranca de nuevo en asc al cambiar de columna. Un solo sitio
// para el comparador (numeros por valor, texto por localeCompare 'es') en
// vez de repetirlo en cada tabla de la app
export const useOrdenTabla = () => {
  const [columna, setColumna] = useState(null)
  const [direccion, setDireccion] = useState(1)

  const alternarOrden = (clave) => {
    if (columna === clave) setDireccion(d => -d)
    else { setColumna(clave); setDireccion(1) }
  }

  // obtenerValor(fila, clave) -> el valor por el que ordenar esa columna
  const ordenar = (lista, obtenerValor) => {
    if (!columna) return lista
    return [...lista].sort((a, b) => {
      const va = obtenerValor(a, columna)
      const vb = obtenerValor(b, columna)
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * direccion
      return String(va ?? '').localeCompare(String(vb ?? ''), 'es') * direccion
    })
  }

  return { columna, direccion, alternarOrden, ordenar }
}
