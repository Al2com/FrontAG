import axios from './axios.js';

const base = '/compras';

const getCompras = () => {
    return axios.get(base).then(response => response.data);
};

const postCrearCompra = (formData) => {
    const token = sessionStorage.getItem("token");
    return axios.post(`${base}/crear`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then(res => res.data);
};

export default { getCompras, postCrearCompra };