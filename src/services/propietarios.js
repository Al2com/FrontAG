import axios from './axios.js';

const baseUrl = '/api/propietarios';

const getPropietarios = () => {
    const request = axios.get(baseUrl)
    return request.then (response => response.data);
}

export default {getPropietarios};