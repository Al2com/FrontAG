import axios from './axios.js'

const baseUrl = '/api/consultor'

const consultar = (mensajes) => {
    const request = axios.post(baseUrl, { mensajes })
    return request.then(response => {
        console.log('respuesta del servidor:', response.data)
        return response.data
    })
}

export default { consultar }

