import axios from 'axios';

const baseUrl = 'http://localhost/api/tareas';

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
    const request = axios.delete(`http://localhost/api/operaciones/${id}`)
    return request.then(response => response.data)
}

// Elimina una fumigacion por su ID
const borrarFumigacion = (id) => {
    const request = axios.delete(`http://localhost/api/fumigaciones/${id}`)
    return request.then(response => response.data)
}

export default { getLista, marcarRealizada, marcarRevisada, getActividadReciente, borrarOperacion, borrarFumigacion };