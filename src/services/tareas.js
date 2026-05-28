import axios from './axios.js';
const baseUrl = '/api/tareas';

// este servivio se ultiliza para todo lo relacionado con la pagina operaciones que no son formulario 

const getLista = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data);
}

const marcarRealizada = (tipo, id) => {
    const request = axios.put(`${baseUrl}/${tipo}/${id}`)
    return request.then(response => response.data)
}

const marcarRevisada = (tipo, id) => {
    const request = axios.put(`${baseUrl}/${tipo}/${id}/revisada`)
    return request.then(response => response.data)
}

const getActividadReciente = () => {
    const request = axios.get(`${baseUrl}/actividad-reciente`)
    return request.then(response => response.data)
}

// Elimina una operacion por su id
const borrarOperacion = (id) => {
    const request = axios.delete(`/api/operaciones/${id}`)
    return request.then(response => response.data)
}

// Elimina una fumigacion por su ID
const borrarFumigacion = (id) => {
    const request = axios.delete(`/api/fumigaciones/${id}`)
    return request.then(response => response.data)
}

export default { getLista, marcarRealizada, marcarRevisada, getActividadReciente, borrarOperacion, borrarFumigacion };