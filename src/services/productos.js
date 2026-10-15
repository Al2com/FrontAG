import axios from './axios.js';

const base = '/api/productos';
const baseUrl = `${base}/lista`

const getProductos = () => {
    const request = axios.get(baseUrl)
    return request.then (response => response.data);
}


const getProducto = (id) => {
    return axios.get(`${baseUrl}/${id}`).then(res => res.data);
}

// manda los datos modificados al back para actualizar la parcela
const putActualizarProductos = (id, formData) => {
  return axios.put(`${baseUrl}/${id}`, formData).then(res => res.data)

}

// elimina un producto del almacén; el back rechaza el borrado si tiene historial
const borrarProducto = (id) => {
  return axios.delete(`${baseUrl}/${id}`).then(res => res.data)
}

// historial del año: { compras, usos } (rediseño de almacén)
const getHistorial = (id) => {
  return axios.get(`${base}/${id}/historial`).then(res => res.data)
}

export default { getProductos,getProducto,putActualizarProductos,borrarProducto,getHistorial }