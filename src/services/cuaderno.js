import axios from './axios.js'

const base = '/api/cuaderno-campo'

// Pide al back los datos del cuaderno para un año y cultivo concretos.
// Devuelve { anio, cultivo, parcelas, fechas, productos } (ver CuadernoController).
const getCuaderno = (anio, cultivo) => {
  return axios.get(base, { params: { anio, cultivo } }).then(res => res.data)
}

export default { getCuaderno }
