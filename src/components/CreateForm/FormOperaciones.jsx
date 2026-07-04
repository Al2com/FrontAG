import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import parcelasService from '../../services/parcelas'
import operacionesService from '../../services/operaciones'
import productosService from '../../services/productos'
import CampoOperario from './CampoOperario'
import Modal from '../Modal/Modal'
import '../Style/forms.css'

const FormOperacion = () => {

  const navigate = useNavigate()

  const [parcelas, setParcelas] = useState([])
  const [productos, setProductos] = useState([])
  const [precioPorHora, setPrecioPorHora] = useState('')

  const [mostrarModal, setMostrarModal] = useState(false)
  const [mensajeModal, setMensajeModal] = useState('')
  const [esExito, setEsExito] = useState(false)
  // modal de confirmacion para crear
  const [modalConfirm, setModalConfirm] = useState(false)

  const [formData, setFormData] = useState({
    parcela_id: '',
    usuario: '',
    operario: '',
    tipo_operacion: 'poda',
    hora_inicio: '',
    duracion_minutos: '',
    precio: '',
    precio_material: '',
    descripcion: '',
    producto_id: '',
    dosis: ''
  })

  const [errors, setErrors] = useState({
    parcela_id: '',
    usuario: '',
    operario: '',
    tipo_operacion: '',
    hora_inicio: '',
    duracion_minutos: '',
    precio: '',
    descripcion: '',
    producto_id: '',
    dosis: ''
  })

  const esAbonado = formData.tipo_operacion === 'abonado'
  const esMantenimiento = formData.tipo_operacion === 'mantenimiento'

  // cargamos las parcelas al montar el componente
  useEffect(() => {
    parcelasService.getLista()
      .then(data => setParcelas(data))
      .catch(() => {
        setMensajeModal('Error al cargar las parcelas. Inténtalo de nuevo.')
        setEsExito(false)
        setMostrarModal(true)
      })
  }, [])

  // cargamos los productos al montar el componente
  useEffect(() => {
    productosService.getProductos()
      .then(data => setProductos(data))
      .catch(() => {
        setMensajeModal('Error al cargar los productos. Inténtalo de nuevo.')
        setEsExito(false)
        setMostrarModal(true)
      })
  }, [])

  useEffect(() => {
    if (!esAbonado) return
    const producto = productos.find(p => p.id === parseInt(formData.producto_id))
    const dosis = parseFloat(formData.dosis)
    if (producto && !isNaN(dosis) && dosis > 0) {
      const precioCalculado = (producto.precio * dosis).toFixed(2)
      setFormData(prev => ({ ...prev, precio: precioCalculado }))
    } else {
      setFormData(prev => ({ ...prev, precio: '' }))
    }
  }, [formData.producto_id, formData.dosis, esAbonado])

  useEffect(() => {
    const hora = parseFloat(precioPorHora)
    const duracion = parseFloat(formData.duracion_minutos)
    const material = parseFloat(formData.precio_material) || 0
    if (!isNaN(hora) && !isNaN(duracion) && hora > 0 && duracion > 0) {
      const horas = duracion / 60
      const total = (hora * horas + material).toFixed(2)
      setFormData(prev => ({ ...prev, precio: total }))
    } else if (material > 0) {
      // mantenimiento sin mano de obra: el gasto es solo el material
      setFormData(prev => ({ ...prev, precio: material.toFixed(2) }))
    } else {
      setFormData(prev => ({ ...prev, precio: '' }))
    }
  }, [formData.duracion_minutos, precioPorHora, formData.precio_material])

  const regexDuracion = /^[0-9]{1,4}$/
  const regexDescripcion = /^.{10,}$/
  const regexPrecio = /^\d+(\.\d{1,2})?$/

  const validarCampos = (name, value) => {
    let mensaje = ''
    let comprobar = true

    if (name === 'duracion_minutos' && !regexDuracion.test(value)) {
      mensaje = 'Debe ser un número (máx. 4 cifras)'
      comprobar = false
    }
    if (name === 'descripcion' && !regexDescripcion.test(value)) {
      mensaje = 'Mínimo 10 caracteres'
      comprobar = false
    }
    if ((name === 'parcela_id' || name === 'tipo_operacion' || name === 'operario') && value === '') {
      mensaje = 'Debes seleccionar una opción'
      comprobar = false
    }
    if (name === 'hora_inicio' && value === '') {
      mensaje = 'La fecha y hora son obligatorias'
      comprobar = false
    }
    if (name === 'precio' && !regexPrecio.test(value)) {
      mensaje = 'Introduce un precio válido (ej: 12.50)'
      comprobar = false
    }

    setErrors(prevErrors => ({ ...prevErrors, [name]: mensaje }))
    return comprobar
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validarCampos(name, value)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    if (esExito) navigate('/operaciones')
  }

  const enviarFormulario = (e) => {
    e.preventDefault()
    const parcelaOk     = validarCampos('parcela_id', formData.parcela_id)
    const operarioOk    = validarCampos('operario', formData.operario)
    const tipoOk        = validarCampos('tipo_operacion', formData.tipo_operacion)
    const fechaOk       = validarCampos('hora_inicio', formData.hora_inicio)
    const duracionOk    = validarCampos('duracion_minutos', formData.duracion_minutos)
    const precioOk      = validarCampos('precio', formData.precio)
    const descripcionOk = validarCampos('descripcion', formData.descripcion)

    if (parcelaOk && operarioOk && tipoOk && fechaOk && duracionOk && descripcionOk && precioOk) {
      setModalConfirm(true)
    }
  }

  // el usuario confirma en el modal y se crea la operacion
  const crearOperacion = () => {
    setModalConfirm(false)
    operacionesService.postCrear(formData)
      .then(() => {
        setMensajeModal('Operación creada correctamente')
        setEsExito(true)
        setMostrarModal(true)
      })
      .catch(err => {
        if (err.response?.status === 422) {
          const erroresLaravel = err.response.data.errors
          const nuevosErrores = {}
          for (const campo in erroresLaravel) {
            nuevosErrores[campo] = erroresLaravel[campo][0]
          }
          setErrors(prev => ({ ...prev, ...nuevosErrores }))
        } else {
          setMensajeModal('Error del servidor. Inténtalo de nuevo.')
          setEsExito(false)
          setMostrarModal(true)
        }
      })
  }

  return (
    <div className="form-container">
      <h1>Nueva Operación</h1>

      {mostrarModal && (
        <Modal mesajeError={mensajeModal} cerrarModal={cerrarModal} />
      )}

      {/* modal de confirmacion para crear */}
      {modalConfirm && (
        <Modal
          mesajeError="¿Estás seguro de crear esta operación?"
          cerrarModal={() => setModalConfirm(false)}
          onConfirmar={crearOperacion}
        />
      )}

      <form onSubmit={enviarFormulario} className="form-grid">

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
            {parcelas.map(parcela => (
              <option key={parcela.id} value={parcela.id}>
                {parcela.poligono} - {parcela.parcela} ({parcela.variedad} - {parcela.nombre})
              </option>
            ))}
          </select>
          {errors.parcela_id && <span className="mensaje-error">{errors.parcela_id}</span>}
        </div>

        <CampoOperario value={formData.operario} onChange={handleChange} error={errors.operario} />

        <div className="form-grupo">
          <label htmlFor="tipo_operacion">Tipo de Operación *</label>
          <select
            id="tipo_operacion"
            name="tipo_operacion"
            value={formData.tipo_operacion}
            onChange={handleChange}
            className={errors.tipo_operacion ? 'input-error' : ''}
          >
            <option value="poda">Poda</option>
            <option value="abonado">Abonado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="tractor">Tractor</option>
          </select>
          {errors.tipo_operacion && <span className="mensaje-error">{errors.tipo_operacion}</span>}
        </div>

        {esMantenimiento && (
          <div className="form-grupo">
            <label htmlFor="precio_material">Precio del material reparado (€)</label>
            <input
              type="number"
              id="precio_material"
              name="precio_material"
              value={formData.precio_material}
              onChange={handleChange}
              placeholder="Ej: 35.00"
              min="0"
              step="0.01"
            />
          </div>
        )}

        {esAbonado && (
          <>
            <div className="form-grupo">
              <label htmlFor="producto_id">Producto *</label>
              <select
                id="producto_id"
                name="producto_id"
                value={formData.producto_id}
                onChange={handleChange}
                className={errors.producto_id ? 'input-error' : ''}
              >
                <option value="">Selecciona un producto</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.precio} €/{p.unidad}
                  </option>
                ))}
              </select>
              {errors.producto_id && <span className="mensaje-error">{errors.producto_id}</span>}
            </div>

            <div className="form-grupo">
              <label htmlFor="dosis">Dosis (kg/L) *</label>
              <input
                type="number"
                id="dosis"
                name="dosis"
                value={formData.dosis}
                onChange={handleChange}
                placeholder="Ej: 2.5"
                min="0"
                step="0.001"
                className={errors.dosis ? 'input-error' : ''}
              />
              {errors.dosis && <span className="mensaje-error">{errors.dosis}</span>}
            </div>
          </>
        )}

        <div className="form-grupo">
          <label htmlFor="hora_inicio">Fecha y Hora de Inicio *</label>
          <input
            type="datetime-local"
            id="hora_inicio"
            name="hora_inicio"
            value={formData.hora_inicio}
            onChange={handleChange}
            className={errors.hora_inicio ? 'input-error' : ''}
          />
          {errors.hora_inicio && <span className="mensaje-error">{errors.hora_inicio}</span>}
        </div>

        <div className="form-grupo">
          <label htmlFor="duracion_minutos">Duración (minutos) *</label>
          <input
            type="number"
            id="duracion_minutos"
            name="duracion_minutos"
            value={formData.duracion_minutos}
            onChange={handleChange}
            placeholder="Ejemplo 120"
            min="1"
            className={errors.duracion_minutos ? 'input-error' : ''}
          />
          {errors.duracion_minutos && <span className="mensaje-error">{errors.duracion_minutos}</span>}
        </div>

        <div className="form-grupo">
          <label htmlFor="precioPorHora">Precio por hora (€/h) *</label>
          <input
            type="number"
            id="precioPorHora"
            value={precioPorHora}
            onChange={(e) => setPrecioPorHora(e.target.value)}
            placeholder="Ejemplo 45"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-grupo full-width">
          <label htmlFor="descripcion">Descripción *</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            placeholder="Detalles de la operación..."
            className={errors.descripcion ? 'input-error' : ''}
          />
          {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}
        </div>

        <div className="form-actions full-width">
          <button type="submit">Guardar</button>
          <button type="button" onClick={() => navigate('/operaciones')} className="btn-cancel">Atrás</button>
        </div>

      </form>
    </div>
  )
}

export default FormOperacion