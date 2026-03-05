import axios from 'axios';

const baseUrl = 'http://localhost/api/operaciones';
const baseUrl1 = 'http://localhost/api/fumigaciones';
const baseUrl2 = 'http://localhost/api/operaciones/crear';

const getLista = () => {
    return axios.get(`${baseUrl}`).then(res => res.data);
}

const getLista1 = () => {
    return axios.get(`${baseUrl1}`).then(res => res.data);
}

// const postCrear = (formData) => {
//     return axios.post(`${baseUrl}/crear`, formData).then(res => res.data);
// }

const postCrear = (formData) => {
  const request = axios.post(baseUrl2,formData)
  return request.then(response=>response.data)

}

export default { getLista, getLista1, postCrear };