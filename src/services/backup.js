import axios from "./axios.js";

const baseUrl = '/api/backup';

const tieneDatos = () =>
    axios.get(`${baseUrl}/tiene-datos`).then(res => res.data.tiene_datos);

// las descargas piden blob: si se pide json/text axios intenta parsear la
// respuesta y falla con archivos grandes o binarios (el zip)
const descargarCsv = () =>
    axios.get(`${baseUrl}/csv`, { responseType: 'blob' }).then(res => res.data);

const descargarJson = () =>
    axios.get(`${baseUrl}/json`, { responseType: 'blob' }).then(res => res.data);

const importar = (archivo) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return axios.post(`${baseUrl}/importar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
};

// dispara la descarga de un blob con el nombre de archivo que manda el back
// (Content-Disposition), sin necesidad de abrir una pestaña nueva
const descargarBlob = (blob, nombrePorDefecto) => {
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombrePorDefecto;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.URL.revokeObjectURL(url);
};

export default { tieneDatos, descargarCsv, descargarJson, importar, descargarBlob };
