import axios from "./axios.js";

// Endpoints públicos de recuperación (no llevan token de sesión).
// Se usa la instancia de axios como el resto de servicios: baseURL = VITE_API_URL
// y aquí se prepende /api, igual que en auth.js.

const solicitarRecuperacion = (email) => {
    return axios.post('/api/forgot-password', { email })
        .then(res => res.data);
};

const restablecerPassword = ({ token, email, password, passwordConfirmation }) => {
    return axios.post('/api/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation, // el back espera este nombre (regla 'confirmed')
    }).then(res => res.data);
};

export default { solicitarRecuperacion, restablecerPassword };
