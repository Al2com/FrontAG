import axios from 'axios';

const baseUrl = 'http://localhost/api/operaciones';

const getLista = () => {
    return axios.get(`${baseUrl}`).then(res => res.data);
}

const postCrear = (formData) => {
    return axios.post(`${baseUrl}/crear`, formData).then(res => res.data);
}

export default { getLista, postCrear };