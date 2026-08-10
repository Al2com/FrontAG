import axios from './axios.js';

// trae el analisis de una parcela (gasto/hanegada, desglose fumigacion, comparativa)
const getResumenParcela = (parcelaId, anio, tipo) => {
  return axios.get(`/api/analisis/resumen?parcela_id=${parcelaId}&anio=${anio}&tipo=${tipo}`).then(res => res.data);
};

// gasto por hanegada, litros y dosis diferenciados por metodo (tractor/mochila);
// parcelaId es opcional: sin el, agrega todas las parcelas del admin
const getCostesMetodo = (parcelaId, anio) => {
  const params = new URLSearchParams({ anio });
  if (parcelaId) params.set('parcela_id', parcelaId);
  return axios.get(`/api/analisis/costes-metodo?${params.toString()}`).then(res => res.data);
};

// rentabilidad por parcela (ingresos de recoleccion menos costes); sin parcelaId
// devuelve todas las parcelas del admin, pensado para comparar
const getRentabilidad = (anio, parcelaId) => {
  const params = new URLSearchParams({ anio });
  if (parcelaId) params.set('parcela_id', parcelaId);
  return axios.get(`/api/analisis/rentabilidad?${params.toString()}`).then(res => res.data);
};

// rentabilidad total (todas las parcelas) por año, para el histórico
const getRentabilidadHistorico = () => {
  return axios.get('/api/analisis/rentabilidad-historico').then(res => res.data);
};

export default { getResumenParcela, getCostesMetodo, getRentabilidad, getRentabilidadHistorico };
