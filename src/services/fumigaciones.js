import axios from "axios";

const baseUrl = ('http://localhost/api/fumigaciones/crear');

const postCrearFumigacion = (formData) =>{
    const request = axios.post(baseUrl,formData)
    return request.then(response => response.data)

}


export default {postCrearFumigacion}


