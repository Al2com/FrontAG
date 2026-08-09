import axios from "./axios.js";

const baseUrl = '/api/settings';

const actualizarTema = (tema) =>
    axios.put(`${baseUrl}/tema`, { tema }).then(res => res.data);

const subirFotoPerfil = (foto, miniatura) => {
    const formData = new FormData();
    formData.append('foto', foto);
    formData.append('miniatura', miniatura);
    return axios.post(`${baseUrl}/foto-perfil`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
};

const borrarFotoPerfil = () =>
    axios.delete(`${baseUrl}/foto-perfil`).then(res => res.data);

export default { actualizarTema, subirFotoPerfil, borrarFotoPerfil };
