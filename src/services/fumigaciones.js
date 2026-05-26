import axios from './axios.js';

const baseUrl = ('/api/fumigaciones/crear');
const baseUrl1 = ('/api/fumigaciones');


const postCrearFumigacion = (formData) =>{
    const request = axios.post(baseUrl,formData)
    return request.then(response => response.data)

}

const getLista = () => {
    return axios.get(baseUrl1).then(res => res.data)
}
//saca la fumigacion 
const getFumigacion = (id) => {
    return axios.get(`${baseUrl1}/${id}`).then(res => res.data)
}

//modifica la fumigacion
const putActualizarFumigacion = (id, formData) => {
    return axios.put(`${baseUrl1}/${id}`, formData).then(res => res.data)
}




export default {postCrearFumigacion, getLista, getFumigacion, putActualizarFumigacion}


