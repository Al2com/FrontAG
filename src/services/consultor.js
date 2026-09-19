import axios from 'axios'

const baseUrl = 'http://localhost/api/consultor'

const consultar = (mensajes) => {
    const token = sessionStorage.getItem('token')
    const request = axios.post(baseUrl, { mensajes }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return request.then(response => {
        console.log('respuesta del servidor:', response.data)
        return response.data
    })
}

export default { consultar }