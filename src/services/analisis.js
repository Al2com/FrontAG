import axios from './axios.js';

// trae el analisis de una parcela (gasto/hanegada, desglose fumigacion, comparativa)
const getResumenParcela = (parcelaId, anio, tipo) => {
  return axios.get(`/api/analisis/resumen?parcela_id=${parcelaId}&anio=${anio}&tipo=${tipo}`).then(res => res.data);
};

export default { getResumenParcela };
