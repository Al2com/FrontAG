import axios from "axios";

const baseUrl = ('http://localhost/api/fumigaciones/crear');
const baseUrl1 = ('http://localhost/api/fumigaciones');


const postCrearFumigacion = (formData) =>{
    const request = axios.post(baseUrl,formData)
    return request.then(response => response.data)

}

const getLista = () => {
    return axios.get(baseUrl1).then(res => res.data)
}


export default {postCrearFumigacion, getLista}


