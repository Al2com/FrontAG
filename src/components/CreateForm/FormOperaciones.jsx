import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import usuariosService from '../../services/usuarios'
import usuariosService from '../../services/parcela'
import axios from 'axios'

import '../Style/formStyles.css'



const FormOperacion = () => {
  const navigate = useNavigate()

  const [parcelas, setParcelas] = useState([])
  const [usuarios, setUsuarios] = useState([])

  const [formData, setFormData] = useState({
    parcela_id: '',
    usuario_id: '',
    tipo_operacion: 'riego',
    hora_inicio: '',
    duracion_minutos: '',
    descripcion: ''
  })

  const [errors, setErrors] = useState({
    duracion_minutos: '',
    descripcion: ''
  })

  useEffect(() => {
    parcelasService.getLista()
      .then(data => setParcelas(data))
      .catch(err => console.error('Error cargando parcelas:', err))

    usuariosService.getUsuarios()
      .then(data => setUsuarios(data.usuarios))
      .catch(err => console.error('Error cargando usuarios:', err))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.parcela_id || !formData.usuario_id || !formData.hora_inicio ||
        !formData.duracion_minutos || !formData.descripcion) {
      console.log('Faltan campos obligatorios')
      return
    }

    axios.post(`${baseUrl}/operaciones/crear`, formData)
      .then(() => navigate('/operaciones'))
      .catch(err => console.error('Error al crear operación:', err))
  }

  return (
    <div className="form-container">
      <h1>Nueva Operación</h1>

      <form onSubmit={handleSubmit} className="form-grid">

        {/* Parcela */}
        <div className="form-grupo">
          <label htmlFor="parcela_id">Parcela *</label>
          <select
            id="parcela_id"
            name="parcela_id"
            value={formData.parcela_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una parcela</option>
            {parcelas.map(parcela => (
              <option key={parcela.id} value={parcela.id}>
                {parcela.poligono} - {parcela.parcela} ({parcela.variedad})
              </option>
            ))}
          </select>
        </div>

        {/* Usuario */}
        <div className="form-grupo">
          <label htmlFor="usuario_id">Usuario *</label>
          <select
            id="usuario_id"
            name="usuario_id"
            value={formData.usuario_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un usuario</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Operación */}
        <div className="form-grupo">
          <label htmlFor="tipo_operacion">Tipo de Operación *</label>
          <select
            id="tipo_operacion"
            name="tipo_operacion"
            value={formData.tipo_operacion}
            onChange={handleChange}
            required
          >
            <option value="riego">Riego</option>
            <option value="poda">Poda</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="pulverizar">Pulverizar</option>
          </select>
        </div>

        {/* Hora de Inicio */}
        <div className="form-grupo">
          <label htmlFor="hora_inicio">Fecha y Hora de Inicio *</label>
          <input
            type="datetime-local"
            id="hora_inicio"
            name="hora_inicio"
            value={formData.hora_inicio}
            onChange={handleChange}
            required
          />
        </div>

        {/* Duración */}
        <div className="form-grupo">
          <label htmlFor="duracion_minutos">Duración (minutos) *</label>
          <input
            type="number"
            id="duracion_minutos"
            name="duracion_minutos"
            value={formData.duracion_minutos}
            onChange={handleChange}
            placeholder="Ej: 120"
            min="1"
            required
          />
          {errors.duracion_minutos && <span className="mensaje-error">{errors.duracion_minutos}</span>}
        </div>

        {/* Descripción */}
        <div className="form-grupo full-width">
          <label htmlFor="descripcion">Descripción *</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            placeholder="Detalles de la operación..."
            required
          />
          {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}
        </div>

        {/* Botones */}
        <div className="form-actions full-width">
          <button
            type="button"
            onClick={() => navigate('/operaciones')}
            className="btn-cancel"
          >
            Cancelar
          </button>
          <button type="submit">Guardar Operación</button>
        </div>

      </form>
    </div>
  )
}

export default FormOperacion