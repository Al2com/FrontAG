import axios from 'axios';

const baseUrl = 'http://localhost/api/explotaciones';
const baseUrl1 = 'http://localhost/api/explotaciones/resumen';
const baseUrl2 = 'http://localhost/api/explotaciones/crear';

//con el get traemos todos los datos del response del controlador de la API
const getCount = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const getResumen = () => {
  const request = axios.get(baseUrl1)
  return request.then(response => response.data)
}

//introducir los datos de crear un explotacion

const postCrear = (formData) => {
  const request = axios.post(baseUrl2,formData);
  return request.then(response=>response.data);

}

//datos select
// const getExplotaciones = () => {
//   const request = axios.post(baseUrl2,formData);
//   return request.then(response=>response.data);

// }


export default { getCount, getResumen, postCrear}


