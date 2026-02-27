import axios from 'axios';

const baseUrl = 'http://localhost/api/propietarios';

const getPropietarios = () => {
    const request = axios.get(baseUrl)
    return request.then (response => response.data);
}

export default {getPropietarios};