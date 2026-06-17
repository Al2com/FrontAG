import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import almacenService from '../../services/almacen'
import Modal from '../Modal/Modal.jsx'
import { parseErrores422, MENSAJE_ERROR_SERVIDOR } from '../../services/errores.js'
import '../Style/forms.css'

const FormProducto = () => {

  const navigate = useNavigate()

  // modal de confirmacion para crear y error de servidor
  const [modalConfirm, setModalConfirm] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')

  const [formData, setFormData] = useState({
    nombre: '',
    materia_activa: "",
    ubicacion: '',
    stock_minimo: '',
    precio: '',
  })

  const [errors, setErrors] = useState({
    nombre: '',
    materia_activa: "",
    ubicacion: '',
    stock_minimo: '',
    precio: '',
  });

  // nombre y materia activa: letras, numeros y simbolos habituales (%, paréntesis, +, -, /, ., ,)
  const regexNombre = /^[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ%().,+/\-\s]{2,50}$/
  const regexMateria_activa = /^[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ%().,+/\-\s]{2,50}$/
  const regexUbicacion = /^.{3,}$/
  const regexStock_minimo = /^[0-9]{1,4}$/
  const regexPrecio = /^[0-9]{1,6}(\.[0-9]{1,2})?$/

  const validarCampos = (name, value) => {
    let mensaje = '';
    let comprobar = true;

    if (name === 'nombre' && !regexNombre.test(value)) {
      mensaje = 'Entre 2 y 50 caracteres';
      comprobar = false;
    }

    if (name === 'materia_activa' && !regexMateria_activa.test(value)) {
      mensaje = 'Entre 2 y 50 caracteres';
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

    if (name === 'precio' && !regexPrecio.test(value)) {
      mensaje = 'Precio válido (ej: 12.50)';
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

  // valida y, si todo esta bien, abre el modal de confirmacion
  const enviarFormulario = (e) => {
    e.preventDefault()

    const nombreOk = validarCampos('nombre', formData.nombre)
    const materiaOk = validarCampos('materia_activa', formData.materia_activa)
    const ubicacionOk = validarCampos('ubicacion', formData.ubicacion)
    const stockOk = validarCampos('stock_minimo', formData.stock_minimo)
    const precioOk = validarCampos('precio', formData.precio)

    if (nombreOk && materiaOk && ubicacionOk && stockOk && precioOk) {
      setModalConfirm(true)
    }
  }

  // el usuario confirma en el modal y se crea el producto
  const crearProducto = () => {
    almacenService.createProducto(formData)
      .then(() => navigate('/almacen'))
      .catch(err => {
        setModalConfirm(false)
        const e422 = parseErrores422(err)
        if (e422) {
          setErrors(prev => ({ ...prev, ...e422 }))
        } else {
          setErrorServidor(MENSAJE_ERROR_SERVIDOR)
        }
      })
  }

  return (
    <div className="form-container">

      {/* modal de confirmacion para crear */}
      {modalConfirm && (
        <Modal
          mesajeError="¿Estás seguro de crear este producto?"
          cerrarModal={() => setModalConfirm(false)}
          onConfirmar={crearProducto}
        />
      )}

      <h1>Añadir Producto al Almacén</h1>

      {errorServidor && <span className="mensaje-error">{errorServidor}</span>}

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

        <div className="form-grupo">
          <label>Precio / coste (€)</label>
          <input
            type="number"
            step="0.01"
            name="precio"
            placeholder="Ej: 12.50"
            value={formData.precio}
            onChange={handleChange}
            className={errors.precio ? 'input-error' : ''}
          />
          {errors.precio && <span className="mensaje-error">{errors.precio}</span>}
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