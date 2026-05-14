import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import explotacionService from '../../services/explotaciones.js';

const EditarExplotacion = () => {
  const { id } = useParams(); //te lo da dentro del componente para poder usarlo, cuando llamas a la
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    descripcion: '',
    user_id: '',
    propietario_id: '',
  });

  const [errors, setErrors] = useState({  nombre: '',
    ubicacion: '',
    descripcion: '',
    user_id: '',
    propietario_id: '',
  })

  const [errorCarga, setErrorCarga] = useState('');

  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,50}$/
  const regexUbicacion = /^.{3,}$/
  const regexDescripcion = /^.{10,}$/

  // Al cargar trae los datos de esa explotación
  useEffect(() => {
    explotacionService.getExplo(id)
      .then(data => setFormData(data))
      .catch(() => setErrorCarga('Error al cargar la explotación'))
  }, [id])

  // Actualiza el estado cuando el usuario escribe
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const validarCampos = (name, value) => {
    let mensaje = '';
    let comprobar = true;

    if (name === 'nombre' && !regexNombre.test(value)) {
      mensaje = 'Mínimo 3 letras, máximo 50';
      comprobar = false;
    }

    if (name === 'ubicacion' && !regexUbicacion.test(value)) {
      mensaje = 'Mínimo 3 caracteres';
      comprobar = false;
    }

    if (name === 'descripcion' && !regexDescripcion.test(value)) {
      mensaje = 'Mínimo 10 caracteres';
      comprobar = false;
    }

    setErrors(prevErrors => ({ ...prevErrors, [name]: mensaje }));
    return comprobar;
  }

  // Envía los datos al backend
  const handleSubmit = (e) => {
    e.preventDefault();

    const nombreOk =    ('nombre', formData.nombre);
    const ubicacionOk = validarCampos('ubicacion', formData.ubicacion);
    const descripcionOk = validarCampos('descripcion', formData.descripcion);

    if (nombreOk && ubicacionOk && descripcionOk) {

      explotacionService.putActualizar(id, formData)
        .then(() => {
          navigate('/explotaciones');
        })
        .catch(err => {
          if (err.response?.status === 422) {
            const erroresLaravel = err.response.data.errors;
            const nuevosErrores = {};
            for (const campo in erroresLaravel) {
              nuevosErrores[campo] = erroresLaravel[campo][0];
            }
            setErrors(prev => ({ ...prev, ...nuevosErrores }));
          } else {
            alert('Error del servidor. Inténtalo de nuevo.');
          }
        });
    }
  }
  

  return (
    <div>
      <h1>Editar Explotación</h1>
      <form onSubmit={handleSubmit}>

        <div>
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
        </div>
          {errors.nombre && <span className="mensaje-error">{errors.nombre}</span>}
        <div>
          <label>Ubicación</label>
          <input
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
          />
        </div>
          {errors.ubicacion && <span className="mensaje-error">{errors.ubicacion}</span>}
        <div>
          <label>Descripción</label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
          />
        </div>
         {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}
        <div className='menu-button'>
          <button type="submit">Guardar cambios</button>
          <button type="button" onClick={() => navigate('/explotaciones')}>Atrás</button>
        </div>

      </form>
    </div>
  )
}

export default EditarExplotacion;