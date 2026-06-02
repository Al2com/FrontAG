import axios from "./axios.js";



const baseUrl = '/api/login'; // aqui hay que poner api en la ruta sino en local no va 



const postLogin = (formData) =>{
    const request = axios.post(baseUrl,formData)
    return request.then(response => response.data)
    

}


export default {postLogin};