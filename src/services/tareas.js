import axios from 'axios';

const baseUrl = 'http://localhost/api/tareas';

const getLista = () => {
    const request = axios.get(baseUrl)
    return request.then (response => response.data);
}

const marcarRealizada = (tipo, id) => {
    const request = axios.put(`${baseUrl}/${tipo}/${id}`)
    return request.then(response => response.data)
}


const marcarRevisada = (tipo, id) => {
    const request = axios.put(`${baseUrl}/${tipo}/${id}/revisada`)
    return request.then(response => response.data)
}


export default { getLista,marcarRealizada, marcarRevisada };