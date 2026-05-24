import axios from './axios.js';

const base = 'http://localhost/api/productos';
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
export default { getProductos,getProducto,putActualizarProductos }