
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

// Si el back responde 401 con una sesion ya iniciada, el token ha caducado:
// limpiamos la sesion y mandamos al login. El propio login se excluye para no
// pisar su mensaje de "email o password incorrectos".
axios.interceptors.response.use(
    respuesta => respuesta,
    error => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        const habiaSesion = !!sessionStorage.getItem('token');

        if (status === 401 && habiaSesion && !url.includes('login')) {
            sessionStorage.clear();
            // recarga completa a la raiz: App vuelve a mostrar el login
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axios;
