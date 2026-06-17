// Utilidad compartida para tratar los errores que devuelve la API.
//
// Laravel manda los errores de validacion (422) con esta forma:
//   { errors: { nombre: ["mensaje"], precio: ["otro"] } }
// y aqui los aplanamos a { nombre: "mensaje", precio: "otro" } para
// pintarlos debajo de cada input.

// Devuelve un objeto {campo: mensaje} si el error es de validacion 422,
// o null si no lo es (para que el componente muestre un error generico).
export const parseErrores422 = (err) => {
  const errores = err?.response?.data?.errors
  if (!errores) return null

  const salida = {}
  for (const campo in errores) {
    salida[campo] = Array.isArray(errores[campo]) ? errores[campo][0] : errores[campo]
  }
  return salida
}

// Mensaje generico de respaldo para errores que no son de validacion.
export const MENSAJE_ERROR_SERVIDOR = 'Error del servidor. Inténtalo de nuevo.'
