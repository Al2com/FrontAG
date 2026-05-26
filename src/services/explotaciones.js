

//hay que pòner la ruta a pelo sino da error el despliegue 
import axios from './axios.js';
const baseUrl = '/explotaciones';
const baseUrl1 = '/explotaciones/resumen';
const baseUrl2 = '/explotaciones/crear';

const getCount = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}
const getResumen = () => {
  const request = axios.get(baseUrl1)
  return request.then(response => response.data)
}
const postCrear = (formData) => {
  const request = axios.post(baseUrl2, formData);
  return request.then(response => response.data);
}
const getExplo = (id) => {
  const request = axios.get(`${baseUrl}/${id}`)
  return request.then(response => response.data)
}
const putActualizar = (id, formData) => {
  const request = axios.put(`${baseUrl}/${id}`, formData)
  return request.then(response => response.data)
}
const borrarExplotacion = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`)
  return request.then(response => response.data)
}
export default { getCount, getResumen, postCrear, getExplo, putActualizar, borrarExplotacion }