import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import almacenService from '../../services/almacen'
import '../Style/forms.css'

const FormProducto = () => {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombre: '',
    materia_activa: "",
    ubicacion: '',
    stock_minimo: '',
  })

  const [errors, setErrors] = useState({
    nombre: '',
    materia_activa: "",
    ubicacion: '',
    stock_minimo: '',
  });

  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,50}$/
  const regexMateria_activa = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,50}$/
  const regexUbicacion = /^.{3,}$/
  const regexStock_minimo = /^[0-9]{1,4}$/

  const validarCampos = (name, value) => {
    let mensaje = '';
    let comprobar = true;

    if (name === 'nombre' && !regexNombre.test(value)) {
      mensaje = 'Mínimo 3 letras, máximo 50';
      comprobar = false;
    }

    if (name === 'materia_activa' && !regexMateria_activa.test(value)) {
      mensaje = 'Mínimo 3 letras, máximo 50';
      comprobar = false;
    }

    if (name === 'ubicacion' && !regexUbicacion.test(value)) {
      mensaje = 'Mínimo 3 caracteres';
      comprobar = false;
    }

    if (name === 'stock_minimo' && !regexStock_minimo.test(value)) {
      mensaje = 'Debe ser un número entero';
      comprobar = false;
    }

    // prevErrors garantiza que cogemos el estado más reciente antes de actualizarlo
    setErrors(prevErrors => ({ ...prevErrors, [name]: mensaje }));
    return comprobar;
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validarCampos(name, value);
  }

  const enviarFormulario = (e) => {
    e.preventDefault()

    const nombreOk = validarCampos('nombre', formData.nombre)
    const materiaOk = validarCampos('materia_activa', formData.materia_activa)
    const ubicacionOk = validarCampos('ubicacion', formData.ubicacion)
    const stockOk = validarCampos('stock_minimo', formData.stock_minimo)

    if (nombreOk && materiaOk && ubicacionOk && stockOk) {

      almacenService.createProducto(formData)
        .then(() => {
          navigate('/almacen')
        })
        .catch(err => {
          if (err.response?.status === 422) {
            // Laravel manda los errores así: { errors: { nombre: ["mensaje"] } }
            const erroresLaravel = err.response.data.errors;
            const nuevosErrores = {};
            // recorremos cada campo que ha fallado en Laravel
            for (const campo in erroresLaravel) {
              // cogemos solo el primer mensaje de cada campo (Laravel manda un array)
              nuevosErrores[campo] = erroresLaravel[campo][0];
            }
            // los metemos en el estado errors para que aparezcan en rojo debajo de cada input
            setErrors(prev => ({ ...prev, ...nuevosErrores }));
          } else {
            // cualquier otro error (500, caída del servidor...)
            alert('Error del servidor. Inténtalo de nuevo.');
          }
        });
    }
  }

  return (
    <div className="form-container">
      <h1>Añadir Producto al Almacén</h1>

      <form className="form-grid" onSubmit={enviarFormulario}>

        <div className="form-grupo">
          <label>Nombre del Producto</label>
          <input
            name="nombre"
            placeholder="Ej: Sulfato de cobre"
            value={formData.nombre}
            onChange={handleChange}
            // si hay error en este campo pone borde rojo
            className={errors.nombre ? 'input-error' : ''}
          />
          {/* si hay mensaje de error lo muestra en rojo debajo */}
          {errors.nombre && <span className="mensaje-error">{errors.nombre}</span>}
        </div>

        <div className="form-grupo">
          <label>Materia Activa</label>
          <input
            name="materia_activa"
            placeholder="Ej: Cobre"
            value={formData.materia_activa}
            onChange={handleChange}
            className={errors.materia_activa ? 'input-error' : ''}
          />
          {errors.materia_activa && <span className="mensaje-error">{errors.materia_activa}</span>}
        </div>

        <div className="form-grupo">
          <label>Ubicación en Almacén</label>
          <input
            name="ubicacion"
            placeholder="Ej: Estantería A"
            value={formData.ubicacion}
            onChange={handleChange}
            className={errors.ubicacion ? 'input-error' : ''}
          />
          {errors.ubicacion && <span className="mensaje-error">{errors.ubicacion}</span>}
        </div>

        <div className="form-grupo">
          <label>Stock Mínimo</label>
          <input
            type="number"
            name="stock_minimo"
            placeholder="Ej: 10"
            value={formData.stock_minimo}
            onChange={handleChange}
            className={errors.stock_minimo ? 'input-error' : ''}
          />
          {errors.stock_minimo && <span className="mensaje-error">{errors.stock_minimo}</span>}
        </div>

        <div className="form-actions full-width">
          <button type="submit">Guardar Producto</button>
          <button type="button" onClick={() => navigate('/almacen')}>Atrás</button>
        </div>

      </form>
    </div>
  )
}

export default FormProducto