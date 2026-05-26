import axios from "./axios.js";


// const baseUrl = 'http://localhost/api/login';// en problema en el despliegue era esta ruta

const baseUrl = '/login';

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