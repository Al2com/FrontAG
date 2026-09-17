import axios from './axios.js';
const baseUrl = '/api/operaciones';

//este servicio se usa para todo lo relacionado con los formularios

// numero total de operaciones de la explotacion, para el contador del panel
const getTotal = () => {
    return axios.get(baseUrl).then(res => res.data.total);
}

const postCrear = (formData) => {
    return axios.post(`${baseUrl}/crear`, formData).then(res => res.data)
}

const getOperacion = (id) => {
    return axios.get(`${baseUrl}/${id}`).then(res => res.data)
}

// Guarda los cambios de la operacion editada
const putActualizarOperacion = (id, formData) => {
    return axios.put(`${baseUrl}/${id}`, formData).then(res => res.data)
}

export default { getTotal, postCrear, getOperacion, putActualizarOperacion }
