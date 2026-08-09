import axios from "./axios.js";


const baseUrl = '/api/almacen/crear';
const baseUrl1 = '/api/almacen';



const createProducto = (formData) =>{
    const request = axios.post(baseUrl,formData)
    return request.then(response => response.data)

}
const getStockBajo = () => {
    const request = axios.get(`${baseUrl1}/stock-bajo`)
    return request.then(response => response.data)
}

// filtros: { anio } opcional
const getResumenGeneral = (filtros = {}) => {
    return axios.get(`${baseUrl1}/resumen`, { params: filtros }).then(response => response.data)
}

export default { createProducto, getStockBajo, getResumenGeneral };


