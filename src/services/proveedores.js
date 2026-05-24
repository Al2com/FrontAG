import axios from './axios.js';

const base = 'http://localhost/api/proveedores';

const getProveedores = () => {
    return axios.get(base).then(response => response.data);
};

export default { getProveedores };