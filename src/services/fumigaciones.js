import axios from './axios.js';

const baseUrl = ('http://localhost/api/fumigaciones/crear');
const baseUrl1 = ('http://localhost/api/fumigaciones');


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
const putActualizarFumigacion = (id,formData) => {
    const request = axios.put(`${baseUrl2}/${id}`, formData)
        return request.then(response => response.data)
}




export default {postCrearFumigacion, getLista, getFumigacion, putActualizarFumigacion}


