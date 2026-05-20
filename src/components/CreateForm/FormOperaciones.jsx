import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import parcelasService from '../../services/parcelas'
import operacionesService from '../../services/operaciones'
import '../Style/forms.css'

const FormOperacion = () => {

  const [parcelas, setParcelas] = useState([])

  const [formData, setFormData] = useState({
    parcela_id: '',
    usuario: "",
    operario: '',
    tipo_operacion: 'riego',
    hora_inicio: '',
    duracion_minutos: '',
    precio: '', 
    descripcion: ''
  })

  const [errors, setErrors] = useState({
    parcela_id: '',
    usuario: "",
    operario: '',
    tipo_operacion: '',
    hora_inicio: '',
    duracion_minutos: '',
    precio: '', 
    descripcion: ''
  });

  useEffect(() => {
    parcelasService.getLista()
      .then(data => setParcelas(data))
      .catch(err => console.error('Error cargando parcelas:', err))
  }, [])

  const navigate = useNavigate()

  const regexDuracion = /^[0-9]{1,4}$/;
  const regexDescripcion = /^.{10,}$/;
  const regexPrecio = /^\d+(\.\d{1,2})?$/;

  const validarCampos = (name, value) => {
    let mensaje = '';
    let comprobar = true;

    if (name === 'duracion_minutos' && !regexDuracion.test(value)) {
      mensaje = 'Debe ser un número (máx. 4 cifras)';
      comprobar = false;
    }

    if (name === 'descripcion' && !regexDescripcion.test(value)) {
      mensaje = 'Mínimo 10 caracteres';
      comprobar = false;
    }

    if ((name === 'parcela_id' || name === 'tipo_operacion' || name === 'operario') && value === "") {
      mensaje = 'Debes seleccionar una opción';
      comprobar = false;
    }

    if (name === 'hora_inicio' && value === "") {
      mensaje = 'La fecha y hora son obligatorias';
      comprobar = false;
    }

    if (name === 'precio' && !regexPrecio.test(value)) {
      mensaje = 'Introduce un precio válido (ej: 12.50)';
      comprobar = false;
}

    setErrors(prevErrors => ({ ...prevErrors, [name]: mensaje }));
    return comprobar;
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validarCampos(name, value);
  }

  const enviarFormulario = (e) => {
    e.preventDefault();

    const parcelaOk = validarCampos('parcela_id', formData.parcela_id);
    const operarioOk = validarCampos('operario', formData.operario);
    const tipoOk = validarCampos('tipo_operacion', formData.tipo_operacion);
    const fechaOk = validarCampos('hora_inicio', formData.hora_inicio);
    const duracionOk = validarCampos('duracion_minutos', formData.duracion_minutos);
    const precioOk = validarCampos('precio', formData.precio);
    const descripcionOk = validarCampos('descripcion', formData.descripcion);

    if (parcelaOk && operarioOk && tipoOk && fechaOk && duracionOk && descripcionOk && precioOk) {

      operacionesService.postCrear(formData)
        .then(() => {
          navigate('/operaciones');
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
      <h1>Nueva Operación</h1>

      <form onSubmit={enviarFormulario} className="form-grid">

        {/* Parcela */}
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
                {parcela.poligono} - {parcela.parcela} ({parcela.variedad})
              </option>
            ))}
          </select>
          {errors.parcela_id && <span className="mensaje-error">{errors.parcela_id}</span>}
        </div>

        {/* Operario */}
        <div className="form-grupo">
          <label htmlFor="operario">Operario *</label>
          <select
            id="operario"
            name="operario"
            value={formData.operario}
            onChange={handleChange}
            className={errors.operario ? 'input-error' : ''}
          >
            <option value="">Selecciona un usuario</option>
            <option value="Luis Pérez">Luis Perez</option>
            <option value="Pepe Martinez">Pepe Martinez</option>
          </select>
          {errors.operario && <span className="mensaje-error">{errors.operario}</span>}
        </div>

        {/* Tipo de Operación */}
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
            <option value="riego">Riego</option>
            <option value="abonado">Abonado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="tractor">Tractor</option>
          </select>
          {errors.tipo_operacion && <span className="mensaje-error">{errors.tipo_operacion}</span>}
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
            className={errors.hora_inicio ? 'input-error' : ''}
          />
          {errors.hora_inicio && <span className="mensaje-error">{errors.hora_inicio}</span>}
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
            className={errors.duracion_minutos ? 'input-error' : ''}
          />
          {errors.duracion_minutos && <span className="mensaje-error">{errors.duracion_minutos}</span>}
        </div>
        
        {/* Precio */}
        <div className="form-grupo">
          <label htmlFor="precio">Precio (€) *</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            placeholder="Ej: 45.00"
            min="0"
            step="0.01"
            className={errors.precio ? 'input-error' : ''}
          />
          {errors.precio && <span className="mensaje-error">{errors.precio}</span>}
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
            className={errors.descripcion ? 'input-error' : ''}
          />
          {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}
        </div>

        {/* Botones */}
        <div className="form-actions full-width">
          <button type="submit">Guardar</button>
          <button type="button" onClick={() => navigate('/operaciones')} className="btn-cancel">Atrás</button>
          
        </div>

      </form>
    </div>
  )
}

export default FormOperacion