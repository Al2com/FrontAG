import '../Style/forms.css'
import '../Style/modal.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import parcelasService from '../../services/parcelas'
import productoService from '../../services/productos'
import fumigacionService from '../../services/fumigaciones'
import Modal from '../Modal/Modal.jsx'
import CampoOperario from './CampoOperario'

const FormFumigacion = () => {

  const navigate = useNavigate()

  const [parcelas, setParcelas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosAñadidos, setProductosAñadidos] = useState([])

  const [mostrarModal, setMostrarModal] = useState(false)
  const [mensajeModal, setMensajeModal] = useState('')
  const [esExito, setEsExito] = useState(false)

  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [indiceEliminar, setIndiceEliminar] = useState(null)

  const [precioPorHora, setPrecioPorHora] = useState('')

  const [formData, setFormData] = useState({
    parcela_ids: [],
    operario: "",
    metodo_aplicacion: "",
    precio: "",
    hora_inicio: "",
    duracion_minutos: "",
    mochilas: "",
    turbos: "",
    descripcion: ""
  });

  const [errors, setErrors] = useState({
    parcela_ids: "",
    operario: "",
    metodo_aplicacion: "",
    precio: "",
    hora_inicio: "",
    duracion_minutos: "",
    mochilas: "",
    turbos: "",
    descripcion: "",
    productos: ""
  });

  useEffect(() => {
    parcelasService.getResumenP()
      .then(data => setParcelas(data))
      .catch(err => console.error('Error cargando parcelas:', err))

    productoService.getProductos()
      .then(data => setProductos(data))
      .catch(err => console.error('Error cargando productos:', err))
  }, [])

  useEffect(() => {
    setFormData(prev => ({ ...prev, parcela_ids: [] }))
  }, [formData.metodo_aplicacion])

  useEffect(() => {
    if (formData.metodo_aplicacion !== 'tractor') return
    const precioPorTanque = parseFloat(formData.precio)
    const turbos = parseFloat(formData.turbos)
    if (!isNaN(precioPorTanque) && !isNaN(turbos) && precioPorTanque > 0 && turbos > 0) {
      const total = (precioPorTanque * turbos).toFixed(2)
      setFormData(prev => ({ ...prev, precio: total }))
    }
  }, [formData.turbos])

  useEffect(() => {
    if (formData.metodo_aplicacion !== 'mochila') return
    const hora = parseFloat(precioPorHora)
    const duracion = parseFloat(formData.duracion_minutos)
    if (!isNaN(hora) && !isNaN(duracion) && hora > 0 && duracion > 0) {
      const horas = duracion / 60
      const total = (hora * horas).toFixed(2)
      setFormData(prev => ({ ...prev, precio: total }))
    } else {
      setFormData(prev => ({ ...prev, precio: '' }))
    }
  }, [formData.duracion_minutos, precioPorHora])

  const regexDuracion = /^[0-9]{1,4}$/;
  const regexDescripcion = /^.{10,}$/;
  const regexCantidad = /^[0-9]{1,3}$/;
  const regexPrecio = /^\d+(\.\d{1,2})?$/;

  const toggleParcela = (id) => {
    const idNum = Number(id)
    const yaEsta = formData.parcela_ids.includes(idNum)
    const nuevas = yaEsta
      ? formData.parcela_ids.filter(p => p !== idNum)
      : [...formData.parcela_ids, idNum]
    setFormData({ ...formData, parcela_ids: nuevas })
    setErrors(prev => ({ ...prev, parcela_ids: nuevas.length === 0 ? 'Selecciona al menos una parcela' : '' }))
  }

  const handleParcelaMochila = (e) => {
    const id = Number(e.target.value)
    setFormData({ ...formData, parcela_ids: id ? [id] : [] })
    setErrors(prev => ({ ...prev, parcela_ids: id ? '' : 'Selecciona una parcela' }))
  }

  // atajos de seleccion para tractor: todas / ninguna / por explotacion / por variedad
  const marcarTodasParcelas = (marcar) => {
    const ids = marcar ? parcelas.map(p => p.id) : []
    setFormData({ ...formData, parcela_ids: ids })
    setErrors(prev => ({ ...prev, parcela_ids: ids.length ? '' : 'Selecciona al menos una parcela' }))
  }

  const marcarGrupoParcelas = (tipo, valor) => {
    if (!valor) return
    const ids = parcelas
      .filter(p => tipo === 'explo' ? (p.explotacion?.nombre === valor) : (p.variedad === valor))
      .map(p => p.id)
    setFormData({ ...formData, parcela_ids: ids })
    setErrors(prev => ({ ...prev, parcela_ids: ids.length ? '' : 'Selecciona al menos una parcela' }))
  }

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
    if ((name === 'mochilas' || name === 'turbos') && !regexCantidad.test(value)) {
      mensaje = 'Debe ser un número (máx. 3 cifras)';
      comprobar = false;
    }
    if ((name === 'metodo_aplicacion' || name === 'operario') && value === "") {
      mensaje = 'Debes seleccionar una opción';
      comprobar = false;
    }
    if (name === 'hora_inicio' && value === "") {
      mensaje = 'La fecha y hora son obligatorias';
      comprobar = false;
    }
    if (name === 'precio' && !regexPrecio.test(value)) {
      mensaje = 'Introduce un precio valido (ej: 12.50)';
      comprobar = false;
    }

    setErrors(prev => ({ ...prev, [name]: mensaje }));
    return comprobar;
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validarCampos(name, value);
  }

  const handleChangeProducto = (e, index) => {
    const { name, value } = e.target
    setProductosAñadidos(productosAñadidos.map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    ))
  }

  const añadirFila = () => {
    setProductosAñadidos([...productosAñadidos, { producto_id: '', dosis_introducida: '' }])
  }

  const pedirConfirmacionEliminar = (index) => {
    setIndiceEliminar(index)
    setMostrarModalEliminar(true)
  }

  const confirmarEliminarFila = () => {
    setProductosAñadidos(productosAñadidos.filter((_, i) => i !== indiceEliminar))
    setIndiceEliminar(null)
    setMostrarModalEliminar(false)
  }

  const cancelarEliminarFila = () => {
    setIndiceEliminar(null)
    setMostrarModalEliminar(false)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    if (esExito) navigate('/operaciones')
  }

  const enviarFormulario = (e) => {
    e.preventDefault();

    if (formData.parcela_ids.length === 0) {
      setErrors(prev => ({ ...prev, parcela_ids: 'Selecciona al menos una parcela' }));
      return;
    }

    const metodoOk      = validarCampos('metodo_aplicacion', formData.metodo_aplicacion);
    const fechaOk       = validarCampos('hora_inicio', formData.hora_inicio);
    const descripcionOk = validarCampos('descripcion', formData.descripcion);
    const precioOk      = validarCampos('precio', formData.precio);

    const operarioOk = formData.metodo_aplicacion === 'mochila' ? validarCampos('operario', formData.operario) : true;
    const duracionOk = formData.metodo_aplicacion === 'mochila' ? validarCampos('duracion_minutos', formData.duracion_minutos) : true;
    const mochilasOk = formData.metodo_aplicacion === 'mochila' ? validarCampos('mochilas', formData.mochilas) : true;
    const turbosOk   = formData.metodo_aplicacion === 'tractor'  ? validarCampos('turbos', formData.turbos) : true;

    if (productosAñadidos.length === 0) {
      setErrors(prev => ({ ...prev, productos: 'Debes añadir al menos un producto' }));
      return;
    }

    const productosOk = productosAñadidos.every(
      item => item.producto_id !== '' && item.dosis_introducida !== ''
    );

    if (!productosOk) {
      setErrors(prev => ({ ...prev, productos: 'Todos los productos deben tener producto y dosis' }));
      return;
    }

    setErrors(prev => ({ ...prev, productos: '' }));

    if (metodoOk && fechaOk && descripcionOk && operarioOk && duracionOk && mochilasOk && turbosOk && precioOk) {
      fumigacionService.postCrearFumigacion({ ...formData, productos: productosAñadidos })
        .then(() => {
          setMensajeModal('Fumigación creada correctamente')
          setEsExito(true)
          setMostrarModal(true)
        })
        .catch(err => {
          if (err.response?.status === 422) {
            const nuevosErrores = {};
            for (const campo in err.response.data.errors) {
              nuevosErrores[campo] = err.response.data.errors[campo][0];
            }
            setErrors(prev => ({ ...prev, ...nuevosErrores }));
          } else {
            setMensajeModal('Error del servidor. Inténtalo de nuevo.')
            setEsExito(false)
            setMostrarModal(true)
          }
        });
    }
  };

  // datos derivados para el selector de parcelas (tractor)
  const explotacionesUnicas = [...new Set(parcelas.map(p => p.explotacion?.nombre).filter(Boolean))]
  const variedadesUnicas = [...new Set(parcelas.map(p => p.variedad).filter(Boolean))]
  const parcelasSeleccionadas = parcelas.filter(p => formData.parcela_ids.includes(p.id))
  const totalHanegadasSel = parcelasSeleccionadas.reduce((a, p) => a + Number(p.dimension_hanegadas || 0), 0)

  return (
    <div className="form-container">

      {mostrarModal && (
        <Modal mesajeError={mensajeModal} cerrarModal={cerrarModal} />
      )}

      {mostrarModalEliminar && (
        <Modal
          mesajeError="¿Estas seguro de que quieres eliminar este producto?"
          cerrarModal={cancelarEliminarFila}
          onConfirmar={confirmarEliminarFila}
        />
      )}

      <h1>Nueva Fumigación</h1>

      <form onSubmit={enviarFormulario} className="form-grid">
        <div className="form-grupo">

          <div className="form-grupo">
            <label htmlFor="metodo_aplicacion">Método aplicación *</label>
            <select
              id="metodo_aplicacion"
              name="metodo_aplicacion"
              value={formData.metodo_aplicacion}
              onChange={handleChange}
              className={errors.metodo_aplicacion ? 'input-error' : ''}
            >
              <option value="">Selecciona método aplicación</option>
              <option value="mochila">Mochila</option>
              <option value="tractor">Tractor</option>
            </select>
            {errors.metodo_aplicacion && <span className="mensaje-error">{errors.metodo_aplicacion}</span>}
          </div>

          {formData.metodo_aplicacion === 'mochila' && (
            <div className="form-grupo">
              <label htmlFor="parcela_mochila">Parcela *</label>
              <select
                id="parcela_mochila"
                value={formData.parcela_ids[0] || ''}
                onChange={handleParcelaMochila}
                className={errors.parcela_ids ? 'input-error' : ''}
              >
                <option value="">Selecciona una parcela</option>
                {parcelas.map(parcela => (
                  <option key={parcela.id} value={parcela.id}>
                    {parcela.poligono} - {parcela.parcela} ({parcela.variedad})
                  </option>
                ))}
              </select>
              {errors.parcela_ids && <span className="mensaje-error">{errors.parcela_ids}</span>}
            </div>
          )}

          {formData.metodo_aplicacion === 'tractor' && (
            <div className="form-grupo">
              <label>Parcelas *</label>

              {/* atajos de seleccion rapida */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <button type="button" onClick={() => marcarTodasParcelas(true)}>Todas</button>
                <button type="button" onClick={() => marcarTodasParcelas(false)}>Ninguna</button>
                <select value="" onChange={(e) => marcarGrupoParcelas('explo', e.target.value)} style={{ flex: 1, minWidth: '130px' }}>
                  <option value="">Por explotación…</option>
                  {explotacionesUnicas.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
                <select value="" onChange={(e) => marcarGrupoParcelas('variedad', e.target.value)} style={{ flex: 1, minWidth: '130px' }}>
                  <option value="">Por variedad…</option>
                  {variedadesUnicas.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* contador en vivo */}
              <div style={{ background: 'var(--c-fondo-verde)', color: 'var(--c-primario-medio)', borderRadius: 'var(--rad-md)', padding: '8px 12px', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                {parcelasSeleccionadas.length} parcelas · {totalHanegadasSel.toFixed(2)} ha
              </div>

              <div className="parcelas-checkboxes">
                {parcelas.map(parcela => (
                  <label key={parcela.id} className="parcela-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.parcela_ids.includes(parcela.id)}
                      onChange={() => toggleParcela(parcela.id)}
                    />
                    {parcela.poligono} - {parcela.parcela} · {parcela.variedad}
                    {parcela.explotacion?.nombre ? ` (${parcela.explotacion.nombre})` : ''} — {Number(parcela.dimension_hanegadas).toFixed(2)} ha
                  </label>
                ))}
              </div>
              {errors.parcela_ids && <span className="mensaje-error">{errors.parcela_ids}</span>}
            </div>
          )}

          {formData.metodo_aplicacion === 'mochila' && (
            <div className="form-grupo">
              <label htmlFor="precioPorHora">Precio por hora (€/h) *</label>
              <input
                type="number"
                id="precioPorHora"
                value={precioPorHora}
                onChange={(e) => setPrecioPorHora(e.target.value)}
                placeholder="Ej: 10.00"
                min="0"
                step="0.01"
              />
            </div>
          )}

          {formData.metodo_aplicacion === 'tractor' && (
            <div className="form-grupo">
              <label htmlFor="precio">Precio por tanque (€) *</label>
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
          )}

          {formData.metodo_aplicacion && (
            <div className="form-grupo">
              <label>Precio total (€)</label>
              <input
                type="number"
                value={formData.precio}
                readOnly
                className="input-readonly"
              />
            </div>
          )}

          {/* operario solo sale si es mochila */}
          {formData.metodo_aplicacion === 'mochila' && (
            <CampoOperario value={formData.operario} onChange={handleChange} error={errors.operario} />
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

          {formData.metodo_aplicacion === 'mochila' && (
            <div className="form-grupo">
              <label htmlFor="duracion_minutos">Duración en minutos *</label>
              <input
                type="number"
                id="duracion_minutos"
                name="duracion_minutos"
                value={formData.duracion_minutos}
                onChange={handleChange}
                className={errors.duracion_minutos ? 'input-error' : ''}
              />
              {errors.duracion_minutos && <span className="mensaje-error">{errors.duracion_minutos}</span>}
            </div>
          )}

          <div className="form-dosisProduct">
            {productosAñadidos.map((item, index) => {
              const prodSeleccionado = productos.find(p => p.id === Number(item.producto_id))
              return (
                <div key={index} className="form-grupo">
                  <select
                    name="producto_id"
                    value={item.producto_id}
                    onChange={(e) => handleChangeProducto(e, index)}
                  >
                    <option value="">Selecciona un producto</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - {producto.unidad}
                      </option>
                    ))}
                  </select>
                  {prodSeleccionado && (
                    <p>Dosis recomendada: {prodSeleccionado.dosis_recomendada} {prodSeleccionado.unidad}</p>
                  )}
                  <label>Dosis Introducida *</label>
                  <input
                    name="dosis_introducida"
                    value={item.dosis_introducida}
                    onChange={(e) => handleChangeProducto(e, index)}
                  />
                  <button type="button" className="btn-eliminar-producto" onClick={() => pedirConfirmacionEliminar(index)}>Eliminar</button>
                </div>
              )
            })}
            {errors.productos && <span className="mensaje-error">{errors.productos}</span>}
            <button type="button" className="btn-add-producto" onClick={añadirFila}>+ Añadir producto</button>
          </div>

          {formData.metodo_aplicacion === 'mochila' && (
            <div className="form-grupo">
              <label htmlFor="mochilas">Cantidad de mochilas *</label>
              <input
                type="number"
                id="mochilas"
                name="mochilas"
                value={formData.mochilas}
                onChange={handleChange}
                placeholder="Ej: 2"
                min="1"
                className={errors.mochilas ? 'input-error' : ''}
              />
              {errors.mochilas && <span className="mensaje-error">{errors.mochilas}</span>}
            </div>
          )}

          {formData.metodo_aplicacion === 'tractor' && (
            <div className="form-grupo">
              <label htmlFor="turbos">Cantidad de Turbos (tanques tractor) *</label>
              <input
                type="number"
                id="turbos"
                name="turbos"
                value={formData.turbos}
                onChange={handleChange}
                placeholder="Ej: 2"
                min="1"
                className={errors.turbos ? 'input-error' : ''}
              />
              {errors.turbos && <span className="mensaje-error">{errors.turbos}</span>}
            </div>
          )}

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

        </div>

        <div className="form-actions full-width">
          <button type="submit">Guardar</button>
          <button type="button" onClick={() => navigate('/operaciones')} className="btn-cancel">Atrás</button>
        </div>

      </form>
    </div>
  )
}

export default FormFumigacion