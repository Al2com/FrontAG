import axios from 'axios';

const baseUrl = 'http://localhost/api/operaciones';
const baseUrl1 = 'http://localhost/api/operaciones/crear';

const getLista = () => {
    return axios.get(`${baseUrl}`).then(res => res.data);
}

// const postCrear = (formData) => {
//     return axios.post(`${baseUrl}/crear`, formData).then(res => res.data);
// }

const postCrear = (formData) => {
  const request = axios.post(baseUrl1,formData)
  return request.then(response=>response.data)

}

export default { getLista, postCrear };