import axios from 'axios';
const baseUrl = 'http://localhost/api/operaciones';
const baseUrl1 = 'http://localhost/api/fumigaciones';
const baseUrl2 = 'http://localhost/api/operaciones/crear';

const getLista = () => {
    return axios.get(`${baseUrl}`).then(res => res.data);
}

const getLista1 = () => {
    return axios.get(`${baseUrl1}`).then(res => res.data);
}

const postCrear = (formData) => {
    return axios.post(baseUrl2, formData).then(res => res.data)
}

const getOperacion = (id) => {
    return axios.get(`${baseUrl}/${id}`).then(res => res.data)
}

// Guarda los cambios de la operacion editada
const putActualizarOperacion = (id, formData) => {
    return axios.put(`${baseUrl}/${id}`, formData).then(res => res.data)
}

export default { getLista, getLista1, postCrear, getOperacion, putActualizarOperacion }