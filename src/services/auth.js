import axios from "./axios.js";



const baseUrl = '/api/login'; // aqui hay que poner api en la ruta sino en local no va 

// //con el get traemos todos los datos del response del controlador de la API
// const getLogin = () => {
//   const request = axios.get(baseUrl)
//   return request.then(response => response.data)
// }

const postLogin = (formData) =>{
    const request = axios.post(baseUrl,formData)
    return request.then(response => response.data)
    

}


export default {postLogin};