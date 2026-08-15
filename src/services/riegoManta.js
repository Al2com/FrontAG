import axios from './axios.js';

const baseUrl = '/api/riego-manta';

// lista riegos a manta, opcionalmente filtrados por parcela y/o año
const listar = (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.parcela_id) params.set('parcela_id', filtros.parcela_id);
    if (filtros.anio) params.set('anio', filtros.anio);
    const query = params.toString();
    return axios.get(query ? `${baseUrl}?${query}` : baseUrl).then(res => res.data);
};

// riegos de un mes concreto, para el calendario
const calendario = (anio, mes) => {
    return axios.get(`${baseUrl}/calendario?anio=${anio}&mes=${mes}`).then(res => res.data);
};

// crea un riego a manta para una o varias parcelas (mismo día y precio/hanegada)
const guardar = (datos) => {
    return axios.post(baseUrl, datos).then(res => res.data);
};

// edita un riego individual (fecha, precio_por_hanegada)
const actualizar = (id, datos) => {
    return axios.put(`${baseUrl}/${id}`, datos).then(res => res.data);
};

// edita todas las filas de un lote a la vez
const actualizarLote = (loteId, datos) => {
    return axios.put(`${baseUrl}/lote/${loteId}`, datos).then(res => res.data);
};

const borrar = (id) => {
    return axios.delete(`${baseUrl}/${id}`).then(res => res.data);
};

const borrarLote = (loteId) => {
    return axios.delete(`${baseUrl}/lote/${loteId}`).then(res => res.data);
};

export default { listar, calendario, guardar, actualizar, actualizarLote, borrar, borrarLote };
