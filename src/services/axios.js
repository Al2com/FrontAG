
import axios from 'axios';

//PARA EL DESPLIEGUE 
//Le dice a Axios que todas las peticiones al backend usen la URL de Railway como base.
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

axios.interceptors.request.use(config => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axios;
