import axios from './axios.js';

const baseUrl = '/api/gastos-riego';

// guarda el recibo de un mes (parcela, anio, mes e importes por concepto)
const guardar = (datos) => {
    return axios.post(baseUrl, datos).then(res => res.data);
};

// trae lo ya registrado de una parcela en un mes/anio
const porMes = (parcelaId, anio, mes) => {
    return axios.get(`${baseUrl}/${parcelaId}/${anio}/${mes}`).then(res => res.data);
};

// trae todos los apuntes de riego del admin
const listar = () => {
    return axios.get(baseUrl).then(res => res.data);
};

// borra un apunte de riego por id
const borrar = (id) => {
    return axios.delete(`${baseUrl}/${id}`).then(res => res.data);
};

export default { guardar, porMes, listar, borrar };
