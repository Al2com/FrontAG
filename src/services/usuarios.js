import axios from './axios.js';

const baseUrl = '/usuarios';

const getUsuarios = () => {
    const request = axios.get(baseUrl)
    return request.then (response => response.data);

}

export default { getUsuarios };