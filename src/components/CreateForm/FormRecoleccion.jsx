import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import parcelasService from '../../services/parcelas'
import recoleccionService from '../../services/recoleccion'
import Modal from '../Modal/Modal.jsx'
import { parseErrores422, MENSAJE_ERROR_SERVIDOR } from '../../services/errores.js'
import '../Style/forms.css'

const FormRecoleccion = () => {
  const navigate = useNavigate()

  const [parcelas, setParcelas] = useState([])
  const [modalConfirm, setModalConfirm] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')

  const [formData, setFormData] = useState({
    parcela_id: '',
    fecha: '',
    tipo: 'normal',
    kilos: '',
    precio_medio_kg: '',
  })

  const [errors, setErrors] = useState({
    parcela_id: '',
    fecha: '',
    kilos: '',
    precio_medio_kg: '',
  })

  // cargamos las parcelas para el desplegable
  useEffect(() => {
    parcelasService.getLista()
      .then(data => setParcelas(data))
      .catch(() => setErrorServidor('No se pudieron cargar las parcelas'))
  }, [])

  const regexDecimal = /^[0-9]{1,7}(\.[0-9]{1,2})?$/

  // parcela elegida, para mostrar su fruta
  const parcelaSel = parcelas.find(p => p.id === Number(formData.parcela_id))

  const validarCampos = (name, value) => {
    let mensaje = ''
    let comprobar = true

    if (name === 'parcela_id' && value === '') {
      mensaje = 'Debes seleccionar una parcela'
      comprobar = false
    }
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

  // valida y, si todo esta bien, abre el modal de confirmacion
  const enviarFormulario = (e) => {
    e.preventDefault()

    const parcelaOk = validarCampos('parcela_id', formData.parcela_id)
    const fechaOk = validarCampos('fecha', formData.fecha)
    const kilosOk = validarCampos('kilos', formData.kilos)
    const precioOk = validarCampos('precio_medio_kg', formData.precio_medio_kg)

    if (parcelaOk && fechaOk && kilosOk && precioOk) {
      setModalConfirm(true)
    }
  }

  // el usuario confirma en el modal y se crea la recoleccion
  const crearRecoleccion = () => {
    recoleccionService.postCrear(formData)
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

  // ingreso estimado en vivo
  const ingreso = (Number(formData.kilos) || 0) * (Number(formData.precio_medio_kg) || 0)

  return (
    <div className="form-container">

      {/* modal de confirmacion para crear */}
      {modalConfirm && (
        <Modal
          mesajeError="¿Estás seguro de registrar esta recolección?"
          cerrarModal={() => setModalConfirm(false)}
          onConfirmar={crearRecoleccion}
        />
      )}

      <h1>Registrar Recolección</h1>

      {errorServidor && <span className="mensaje-error">{errorServidor}</span>}

      <form className="form-grid" onSubmit={enviarFormulario}>

        <div className="form-grupo">
          <label htmlFor="parcela_id">Parcela *</label>
          <select
            id="parcela_id"
            name="parcela_id"
            value={formData.parcela_id}
            onChange={handleChange}
            className={errors.parcela_id ? 'input-error' : ''}
          >
            <option value="">Selecciona una parcela</option>
            {parcelas.map(p => (
              <option key={p.id} value={p.id}>
                {p.poligono} - {p.parcela} ({p.variedad})
              </option>
            ))}
          </select>
          {errors.parcela_id && <span className="mensaje-error">{errors.parcela_id}</span>}
        </div>

        {parcelaSel && (
          <div className="form-grupo">
            <label>Fruta</label>
            <input type="text" value={parcelaSel.variedad} readOnly className="input-readonly" />
          </div>
        )}

        <div className="form-grupo">
          <label htmlFor="fecha">Día de cogida *</label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className={errors.fecha ? 'input-error' : ''}
          />
          {errors.fecha && <span className="mensaje-error">{errors.fecha}</span>}
        </div>

        <div className="form-grupo">
          <label htmlFor="tipo">Tipo de cogida *</label>
          <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}>
            <option value="adelanto">Adelanto</option>
            <option value="normal">Normal</option>
            <option value="atraso">Atraso</option>
          </select>
        </div>

        <div className="form-grupo">
          <label htmlFor="kilos">Kilos *</label>
          <input
            type="number"
            step="0.01"
            id="kilos"
            name="kilos"
            value={formData.kilos}
            onChange={handleChange}
            placeholder="Ej: 10000"
            className={errors.kilos ? 'input-error' : ''}
          />
          {errors.kilos && <span className="mensaje-error">{errors.kilos}</span>}
        </div>

        <div className="form-grupo">
          <label htmlFor="precio_medio_kg">Precio medio por kilo (€) *</label>
          <input
            type="number"
            step="0.01"
            id="precio_medio_kg"
            name="precio_medio_kg"
            value={formData.precio_medio_kg}
            onChange={handleChange}
            placeholder="Ej: 0.85"
            className={errors.precio_medio_kg ? 'input-error' : ''}
          />
          {errors.precio_medio_kg && <span className="mensaje-error">{errors.precio_medio_kg}</span>}
        </div>

        <div className="form-grupo">
          <label>Ingreso estimado (€)</label>
          <input type="number" value={ingreso.toFixed(2)} readOnly className="input-readonly" />
        </div>

        <div className="form-actions full-width">
          <button type="submit">Guardar</button>
          <button type="button" onClick={() => navigate('/recoleccion')} className="btn-cancel">Atrás</button>
        </div>

      </form>
    </div>
  )
}

export default FormRecoleccion
