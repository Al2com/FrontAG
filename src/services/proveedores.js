import axios from './axios.js';

const base = '/api/proveedores';

const getProveedores = () => {
    return axios.get(base).then(response => response.data);
};

export default { getProveedores };