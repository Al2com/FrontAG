import axios from './axios.js';

// trae el resumen de gastos ya calculado en el back para una campaña
const getResumen = (campana) => {
    return axios.get(`/api/gastos/resumen?campana=${campana}`).then(res => res.data);
};

export default { getResumen };
