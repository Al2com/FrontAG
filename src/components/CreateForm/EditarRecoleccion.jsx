import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import recoleccionService from '../../services/recoleccion'
import Modal from '../Modal/Modal.jsx'
import { parseErrores422, MENSAJE_ERROR_SERVIDOR } from '../../services/errores.js'
import '../Style/forms.css'

const EditarRecoleccion = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [modalConfirm, setModalConfirm] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')

  const [formData, setFormData] = useState({
    parcela_id: '',
    fecha: '',
    tipo: 'normal',
    kilos: '',
    precio_medio_kg: '',
    variedad: '',
  })

  const [errors, setErrors] = useState({
    fecha: '',
    kilos: '',
    precio_medio_kg: '',
  })

  const regexDecimal = /^[0-9]{1,7}(\.[0-9]{1,2})?$/

  useEffect(() => {
    recoleccionService.getRecoleccion(id)
      .then(data => setFormData(data))
      .catch(() => setErrorServidor('No se pudieron cargar los datos de la recolección'))
  }, [id])

  const validarCampos = (name, value) => {
    let mensaje = ''
    let comprobar = true

    if (name === 'fecha' && value === '') {
      mensaje = 'La fecha es obligatoria'
      comprobar = false
    }
    if (name === 'kilos' && !regexDecimal.test(value)) {
      mensaje = 'Kilos válidos (ej: 10000 o 1250.50)'
      comprobar = false
    }
    if (name === 'precio_medio_kg' && !regexDecimal.test(value)) {
      mensaje = 'Precio válido (ej: 0.85)'
      comprobar = false
    }

    setErrors(prev => ({ ...prev, [name]: mensaje }))
    return comprobar
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validarCampos(name, value)
  }

  const enviarFormulario = (e) => {
    e.preventDefault()

    const fechaOk = validarCampos('fecha', formData.fecha)
    const kilosOk = validarCampos('kilos', formData.kilos)
    const precioOk = validarCampos('precio_medio_kg', formData.precio_medio_kg)

    if (fechaOk && kilosOk && precioOk) {
      setModalConfirm(true)
    }
  }

  const guardarCambios = () => {
    recoleccionService.putActualizar(id, formData)
      .then(() => navigate('/recoleccion'))
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

  const ingreso = (Number(formData.kilos) || 0) * (Number(formData.precio_medio_kg) || 0)

  return (
    <div className="form-container">

      {modalConfirm && (
        <Modal
          mesajeError="¿Estás seguro de guardar los cambios?"
          cerrarModal={() => setModalConfirm(false)}
          onConfirmar={guardarCambios}
        />
      )}

      <h1>Editar Recolección</h1>

      {errorServidor && <span className="mensaje-error">{errorServidor}</span>}

      <form className="form-grid" onSubmit={enviarFormulario}>

        <div className="form-grupo">
          <label>Fruta</label>
          <input type="text" value={formData.variedad ?? ''} readOnly className="input-readonly" />
        </div>

        <div className="form-grupo">
          <label htmlFor="fecha">Día de cogida</label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            value={formData.fecha?.substring(0, 10) ?? ''}
            onChange={handleChange}
            className={errors.fecha ? 'input-error' : ''}
          />
          {errors.fecha && <span className="mensaje-error">{errors.fecha}</span>}
        </div>

        <div className="form-grupo">
          <label htmlFor="tipo">Tipo de cogida</label>
          <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}>
            <option value="adelanto">Adelanto</option>
            <option value="normal">Normal</option>
            <option value="atraso">Atraso</option>
          </select>
        </div>

        <div className="form-grupo">
          <label htmlFor="kilos">Kilos</label>
          <input
            type="number"
            step="0.01"
            id="kilos"
            name="kilos"
            value={formData.kilos}
            onChange={handleChange}
            className={errors.kilos ? 'input-error' : ''}
          />
          {errors.kilos && <span className="mensaje-error">{errors.kilos}</span>}
        </div>

        <div className="form-grupo">
          <label htmlFor="precio_medio_kg">Precio medio por kilo (€)</label>
          <input
            type="number"
            step="0.01"
            id="precio_medio_kg"
            name="precio_medio_kg"
            value={formData.precio_medio_kg}
            onChange={handleChange}
            className={errors.precio_medio_kg ? 'input-error' : ''}
          />
          {errors.precio_medio_kg && <span className="mensaje-error">{errors.precio_medio_kg}</span>}
        </div>

        <div className="form-grupo">
          <label>Ingreso estimado (€)</label>
          <input type="number" value={ingreso.toFixed(2)} readOnly className="input-readonly" />
        </div>

        <div className="form-actions full-width">
          <button type="submit">Guardar cambios</button>
          <button type="button" onClick={() => navigate('/recoleccion')} className="btn-cancel">Atrás</button>
        </div>

      </form>
    </div>
  )
}

export default EditarRecoleccion
