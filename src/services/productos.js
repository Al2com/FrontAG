import axios from 'axios';

const baseUrl = 'http://localhost/api/productos/lista';

const getProductos = () => {
    const request = axios.get(baseUrl)
    return request.then (response => response.data);
}


export default { getProductos };