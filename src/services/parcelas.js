import axios from 'axios';
const baseUrl = 'http://localhost/api/parcelas';
const baseUrl1 = 'http://localhost/api/parcelas/resumen';
const baseUrl2 = 'http://localhost/api/parcelas/crear';

const getCount = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const getResumenP = () => {
  const request = axios.get(baseUrl1)
  return request.then(response => response.data)
}

const postCrear = (formData) => {
  const request = axios.post(baseUrl2,formData)
  return request.then(response=>response.data)

}

const getLista = () => {
    return axios.get('http://localhost/api/parcelas/lista').then(res => res.data);
}

export default { getCount, getResumenP, postCrear, getLista }




