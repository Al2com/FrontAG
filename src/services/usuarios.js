import axios from 'axios';

const baseUrl = 'http://localhost/api/usuarios';

const getUsuarios = () => {
    const request = axios.get(baseUrl)
    return request.then (response => response.data);
}

export default { getUsuarios };