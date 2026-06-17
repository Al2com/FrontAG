import axios from './axios.js';

const baseUrl = '/api/recolecciones';

const getRecolecciones = () => axios.get(baseUrl).then(res => res.data);

const getRecoleccion = (id) => axios.get(`${baseUrl}/${id}`).then(res => res.data);

const postCrear = (formData) => axios.post(`${baseUrl}/crear`, formData).then(res => res.data);

const putActualizar = (id, formData) => axios.put(`${baseUrl}/${id}`, formData).then(res => res.data);

const borrar = (id) => axios.delete(`${baseUrl}/${id}`).then(res => res.data);

export default { getRecolecciones, getRecoleccion, postCrear, putActualizar, borrar };
