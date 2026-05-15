import axios from 'axios';

const baseUrl = 'http://localhost/api/explotaciones';
const baseUrl1 = 'http://localhost/api/explotaciones/resumen';
const baseUrl2 = 'http://localhost/api/explotaciones/crear';

// Trae el número total de explotaciones y sus nombres
const getCount = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

// Trae el resumen completo de cada explotacion con parcelas y hanegadas
const getResumen = () => {
  const request = axios.get(baseUrl1)
  return request.then(response => response.data)
}

// Crea una nueva explotacion
const postCrear = (formData) => {
  const request = axios.post(baseUrl2, formData);
  return request.then(response => response.data);
}

// Trae los datos de una explotacion por su ID para cargarlos en el formulario
const getExplo = (id) => {
  const request = axios.get(`${baseUrl}/${id}`)
  return request.then(response => response.data)
}

// Actualiza los datos de una explotacion por su ID
const putActualizar = (id, formData) => {
  const request = axios.put(`${baseUrl}/${id}`, formData)
  return request.then(response => response.data)
}
// Elimina una explotacion por su ID
const borrarExplotacion = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`)
  return request.then(response => response.data)
}
export default { getCount, getResumen, postCrear, getExplo, putActualizar, borrarExplotacion }