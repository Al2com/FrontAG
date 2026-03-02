import axios from 'axios';

const baseUrl = 'http://localhost/api/producto';

const getProductos = () => {
    const request = axios.get(baseUrl)
    return request.then (response => response.data);
}

export default { getProductos };