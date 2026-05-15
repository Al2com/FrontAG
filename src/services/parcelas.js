import axios from 'axios';

const baseUrl = 'http://localhost/api/parcelas';
const baseUrl1 = 'http://localhost/api/parcelas/resumen';
const baseUrl2 = 'http://localhost/api/parcelas/crear';

// cuenta el total de parcelas y sumas de hanegadas,tipo riego
const getCount = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

// trae el resumen detallado de todas las parcelas
const getResumenP = () => {
  const request = axios.get(baseUrl1)
  return request.then(response => response.data)
}

// crea una parcela nueva
const postCrear = (formData) => {
  const request = axios.post(baseUrl2, formData)
  return request.then(response => response.data)
}

// trae solo id, nombre, poligono y variedad para los selects
const getLista = () => {
  return axios.get('http://localhost/api/parcelas/lista').then(res => res.data)
}

// trae los datos de una parcela por su id para cargarlos en el formulario de edicion
const getParcela = (id) => {
  return axios.get(`${baseUrl}/${id}`).then(res => res.data)
}

// manda los datos modificados al back para actualizar la parcela
const putActualizar = (id, formData) => {
  return axios.put(`${baseUrl}/${id}`, formData).then(res => res.data)
}

const borrarParcela = (id) => {
  return axios.delete(`${baseUrl}/${id}`).then(res => res.data)
}

export default { getCount, getResumenP, postCrear, getLista, getParcela, putActualizar, borrarParcela }