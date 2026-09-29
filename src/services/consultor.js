import axios from './axios.js'

const baseUrl = '/api/consultor'

const consultar = (pregunta) => {
    return axios.post(baseUrl, { pregunta })
        .then(response => response.data)
}

export default { consultar }
