import axios from './axios.js';

const baseUrl = '/api/trabajadores';

const getTrabajadores = () => {
    return axios.get(baseUrl).then(res => res.data);
};

const crearTrabajador = (datos) => {
    return axios.post(baseUrl, datos).then(res => res.data);
};

export default { getTrabajadores, crearTrabajador };
