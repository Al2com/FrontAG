import axios from "axios";


const baseUrl = 'http://localhost/api/almacen/crear';
const baseUrl1 = 'http://localhost/api/almacen';



const createProducto = (formData) =>{
    const request = axios.post(baseUrl,formData)
    return request.then(response => response.data)

}
const getStockBajo = () => {
    const request = axios.get(`${baseUrl1}/stock-bajo`)
    return request.then(response => response.data)
}

export default { createProducto, getStockBajo };


