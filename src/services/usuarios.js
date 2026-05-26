import axios from './axios.js';

const baseUrl = '/api/usuarios';

const getUsuarios = () => {
    const request = axios.get(baseUrl)
    return request.then (response => response.data);

}

export default { getUsuarios };