import axios from "axios";


const baseUrl = 'http://localhost/api/almacen/crear';



const createProducto = (formData) =>{
    const request = axios.post(baseUrl,formData)
    return request.then(response => response.data)

}


export default {createProducto};