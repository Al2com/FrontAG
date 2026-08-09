import axios from './axios.js';

const base = '/api/compras';

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

// filtros: { desde, hasta, proveedor_id } — todos opcionales
const getHistorialProducto = (productoId, filtros = {}) => {
    return axios.get(`/api/productos/${productoId}/compras`, { params: filtros })
        .then(res => res.data);
};

const getResumenProducto = (productoId, filtros = {}) => {
    return axios.get(`/api/productos/${productoId}/compras/resumen`, { params: filtros })
        .then(res => res.data);
};

export default { getCompras, postCrearCompra, getHistorialProducto, getResumenProducto };