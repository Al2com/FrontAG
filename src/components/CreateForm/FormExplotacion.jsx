import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import explotacionService from '../../services/explotaciones';
import usuariosService from '../../services/usuarios';
import propietariosService from '../../services/propietarios';
import '../Style/forms.css'

const FormExplotacion = () => {

  const [usuarios, setUsers] = useState([]);
  const [propietarios, setPropietario] = useState([]);

  useEffect(() => {
    usuariosService.getUsuarios()
      .then(data => setUsers(data.usuarios))
      .catch(() => setErrorUsuarios('Error al cargar los usuarios'))

    propietariosService.getPropietarios()
      .then(data => setPropietario(data.propietarios))
      .catch(() => setErrorPropietarios('Error al cargar los propietarios'))
  }, []);

  const [formData, setFormData] = useState({
    nombre: '',
    user_id: '',
    ubicacion: '',
    descripcion: '',
    propietario_id: '',
  });

  const [errors, setErrors] = useState({
    nombre: '',
    user_id: '',
    ubicacion: '',
    descripcion: '',
    propietario_id: '',
  });

  const navigate = useNavigate();

  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,25}$/;
  const regexUbicacion = /^.{3,}$/;
  const regexDescripcion = /^.{10,}$/;

  const validarCampos = (name, value) => {
    let mensaje = '';
    let comprobar = true;

    if (name === 'nombre' && !regexNombre.test(value)) {
      mensaje = 'Más de 3 letras, o menos de 25';
      comprobar = false;
    }

    if (name === 'ubicacion' && !regexUbicacion.test(value)) {
      mensaje = 'Solo letras, mínimo 3 caracteres';
      comprobar = false;
    }

    if (name === 'descripcion' && !regexDescripcion.test(value)) {
      mensaje = 'Mínimo 10 caracteres';
      comprobar = false;
    }

    if ((name === 'user_id' || name === 'propietario_id') && value === "") {
      mensaje = 'Debes seleccionar una opción';
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

  const enviarFormulario = (e) => {
    e.preventDefault();

    const nombreOk = validarCampos('nombre', formData.nombre);
    const ubicacionOk = validarCampos('ubicacion', formData.ubicacion);
    const descripcionOk = validarCampos('descripcion', formData.descripcion);
    const usuarioOk = validarCampos('user_id', formData.user_id);
    const propietarioOk = validarCampos('propietario_id', formData.propietario_id);

    if (nombreOk && ubicacionOk && descripcionOk && usuarioOk && propietarioOk) {

      explotacionService.postCrear(formData)
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
  };

  return (
    <div className="form-container">
      <h1>Nueva Explotación</h1>

      <form className="form-grid" onSubmit={enviarFormulario}>

        <div className="form-grupo">
          <label>Nombre Explotación</label>
          <input
            name="nombre"
            placeholder="Ej: Finca Casa del Pi"
            value={formData.nombre}
            onChange={handleChange}
            className={errors.nombre ? 'input-error' : ''}
          />
          {errors.nombre && <span className="mensaje-error">{errors.nombre}</span>}
        </div>

        <div className="form-grupo">
          <label>Ubicación</label>
          <input
            name="ubicacion"
            placeholder="Termino municipal"
            value={formData.ubicacion}
            onChange={handleChange}
            className={errors.ubicacion ? 'input-error' : ''}
          />
          {errors.ubicacion && <span className="mensaje-error">{errors.ubicacion}</span>}
        </div>

        <div className="form-grupo">
          <label>Usuario</label>
          <select
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            className={errors.user_id ? 'input-error' : ''}
          >
            <option value="">Selecciona un usuario</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.name}
              </option>
            ))}
          </select>
          {errors.user_id && <span className="mensaje-error">{errors.user_id}</span>}
        </div>

        <div className="form-grupo">
          <label>Propietario</label>
          <select
            name="propietario_id"
            value={formData.propietario_id}
            onChange={handleChange}
            className={errors.propietario_id ? 'input-error' : ''}
          >
            <option value="">Selecciona un propietario</option>
            {propietarios.map(propietario => (
              <option key={propietario.id} value={propietario.id}>
                {propietario.nombre}
              </option>
            ))}
          </select>
          {errors.propietario_id && <span className="mensaje-error">{errors.propietario_id}</span>}
        </div>

        <div className="form-grupo full-width">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            rows="4"
            placeholder="Descripción de la Explotación"
            value={formData.descripcion}
            onChange={handleChange}
            className={errors.descripcion ? 'input-error' : ''}
          />
          {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}
        </div>

        <div className="form-actions full-width">
          <button type="submit">Guardar</button>
          <button type="submit" onClick={()=>{navigate('/explotaciones')}} className="btn-cancel">Atrás</button>

        </div>

      </form>
    </div>
  );
}

export default FormExplotacion;