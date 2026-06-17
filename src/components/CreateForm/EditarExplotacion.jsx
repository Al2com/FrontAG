import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import explotacionService from '../../services/explotaciones.js';
import Modal from '../Modal/Modal.jsx';
import { parseErrores422, MENSAJE_ERROR_SERVIDOR } from '../../services/errores.js';
import '../Style/forms.css';

const EditarExplotacion = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [modalConfirm, setModalConfirm] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    descripcion: '',
    user_id: '',
    propietario_id: '',
  });

  const [errors, setErrors] = useState({
    nombre: '',
    ubicacion: '',
    descripcion: '',
  });

  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,50}$/
  const regexUbicacion = /^.{3,}$/
  const regexDescripcion = /^.{10,}$/

  useEffect(() => {
    explotacionService.getExplo(id)
      .then(data => setFormData(data))
      .catch(() => setErrorServidor('No se pudieron cargar los datos de la explotación'))
  }, [id])

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validarCampos(name, value);
  }

  // valida y abre el modal de confirmacion
  const handleSubmit = (e) => {
    e.preventDefault();

    const nombreOk = validarCampos('nombre', formData.nombre);
    const ubicacionOk = validarCampos('ubicacion', formData.ubicacion);
    const descripcionOk = validarCampos('descripcion', formData.descripcion);

    if (nombreOk && ubicacionOk && descripcionOk) {
      setModalConfirm(true);
    }
  }

  // el usuario confirma en el modal y se manda al back
  const guardarCambios = () => {
    explotacionService.putActualizar(id, formData)
      .then(() => navigate('/explotaciones'))
      .catch(err => {
        setModalConfirm(false);
        const e422 = parseErrores422(err);
        if (e422) {
          setErrors(prev => ({ ...prev, ...e422 }));
        } else {
          setErrorServidor(MENSAJE_ERROR_SERVIDOR);
        }
      });
  }

  return (
    <div className="form-container">

      {modalConfirm && (
        <Modal
          mesajeError="¿Estás seguro de guardar los cambios?"
          cerrarModal={() => setModalConfirm(false)}
          onConfirmar={guardarCambios}
        />
      )}

      <h1>Editar Explotación</h1>

      {errorServidor && <span className="mensaje-error">{errorServidor}</span>}

      <form onSubmit={handleSubmit} className="form-grid">

        <div className="form-grupo">
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={errors.nombre ? 'input-error' : ''}
          />
          {errors.nombre && <span className="mensaje-error">{errors.nombre}</span>}
        </div>

        <div className="form-grupo">
          <label>Ubicación</label>
          <input
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            className={errors.ubicacion ? 'input-error' : ''}
          />
          {errors.ubicacion && <span className="mensaje-error">{errors.ubicacion}</span>}
        </div>

        <div className="form-grupo">
          <label>Descripción</label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className={errors.descripcion ? 'input-error' : ''}
          />
          {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}
        </div>

        <div className="form-actions full-width">
          <button type="submit">Guardar cambios</button>
          <button type="button" onClick={() => navigate('/explotaciones')}>Atrás</button>
        </div>

      </form>
    </div>
  )
}

export default EditarExplotacion;
