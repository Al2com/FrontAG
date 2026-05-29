import '../Style/forms.css'
import '../Style/modal.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import parcelasService from '../../services/parcelas'
import productoService from '../../services/productos'
import fumigacionService from '../../services/fumigaciones'
import Modal from '../Modal/Modal.jsx'

const FormFumigacion = () => {

  const navigate = useNavigate()

  const [parcelas, setParcelas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosAñadidos, setProductosAñadidos] = useState([])

  // estados para el modal de exito o error
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mensajeModal, setMensajeModal] = useState('')
  const [esExito, setEsExito] = useState(false)

  // estados para el modal de confirmacion al eliminar producto de la lista
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [indiceEliminar, setIndiceEliminar] = useState(null)

  // guardo el precio por hora en un estado aparte para no sobreescribirlo al calcular
  // esto solo se usa en mochila, en tractor el precio es por tanque
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

  // cargo parcelas y productos al montar el componente
  useEffect(() => {
    parcelasService.getLista()
      .then(data => setParcelas(data))
      .catch(err => console.error('Error cargando parcelas:', err))

    productoService.getProductos()
      .then(data => setProductos(data))
      .catch(err => console.error('Error cargando productos:', err))
  }, [])

  // cuando cambia el metodo limpio las parcelas seleccionadas para evitar conflictos
  useEffect(() => {
    setFormData(prev => ({ ...prev, parcela_ids: [] }))
  }, [formData.metodo_aplicacion])

  // si es tractor calculo el precio total multiplicando precio por tanque por los turbos
  useEffect(() => {
    if (formData.metodo_aplicacion !== 'tractor') return
    const precioPorTanque = parseFloat(formData.precio)
    const turbos = parseFloat(formData.turbos)
    if (!isNaN(precioPorTanque) && !isNaN(turbos) && precioPorTanque > 0 && turbos > 0) {
      const total = (precioPorTanque * turbos).toFixed(2)
      setFormData(prev => ({ ...prev, precio: total }))
    }
  }, [formData.turbos])

  // si es mochila calculo el precio total usando precioPorHora que es un estado separado
  // asi evito el bug de que formData.precio se sobreescriba con el total y al recalcular multiplique mal
  // ej: 10€/h * 3h = 30€ correcto, si usara formData.precio cogeria 30 * 3 = 90€ incorrecto
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

  // si la parcela ya esta la quito, sino la añado (solo para tractor)
  const toggleParcela = (id) => {
    const idNum = Number(id)
    const yaEsta = formData.parcela_ids.includes(idNum)
    const nuevas = yaEsta
      ? formData.parcela_ids.filter(p => p !== idNum)
      : [...formData.parcela_ids, idNum]
    setFormData({ ...formData, parcela_ids: nuevas })
    setErrors(prev => ({ ...prev, parcela_ids: nuevas.length === 0 ? 'Selecciona al menos una parcela' : '' }))
  }

  // para mochila solo se puede seleccionar una parcela con un select
  const handleParcelaMochila = (e) => {
    const id = Number(e.target.value)
    setFormData({ ...formData, parcela_ids: id ? [id] : [] })
    setErrors(prev => ({ ...prev, parcela_ids: id ? '' : 'Selecciona una parcela' }))
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
    // mochilas y turbos usan el mismo regex de cantidad
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

  // actualizo el producto concreto de la fila que toco
  const handleChangeProducto = (e, index) => {
    const { name, value } = e.target
    setProductosAñadidos(productosAñadidos.map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    ))
  }

  const añadirFila = () => {
    setProductosAñadidos([...productosAñadidos, { producto_id: '', dosis_introducida: '' }])
  }

  // abro el modal de confirmacion guardando el indice del producto a eliminar
  const pedirConfirmacionEliminar = (index) => {
    setIndiceEliminar(index)
    setMostrarModalEliminar(true)
  }

  // si confirma elimino la fila, si cancela cierro el modal sin hacer nada
  const confirmarEliminarFila = () => {
    setProductosAñadidos(productosAñadidos.filter((_, i) => i !== indiceEliminar))
    setIndiceEliminar(null)
    setMostrarModalEliminar(false)
  }

  const cancelarEliminarFila = () => {
    setIndiceEliminar(null)
    setMostrarModalEliminar(false)
  }

  // si fue exito navego a operaciones, si fue error solo cierro para corregir el formulario
  const cerrarModal = () => {
    setMostrarModal(false)
    if (esExito) {
      navigate('/operaciones')
    }
  }

  const enviarFormulario = (e) => {
    e.preventDefault();

    // compruebo que haya minimo 1 parcela seleccionada
    if (formData.parcela_ids.length === 0) {
      setErrors(prev => ({ ...prev, parcela_ids: 'Selecciona al menos una parcela' }));
      return;
    }

    const metodoOk      = validarCampos('metodo_aplicacion', formData.metodo_aplicacion);
    const fechaOk       = validarCampos('hora_inicio', formData.hora_inicio);
    const descripcionOk = validarCampos('descripcion', formData.descripcion);
    const precioOk      = validarCampos('precio', formData.precio);

    // estos campos solo se validan segun el metodo elegido
    const operarioOk = formData.metodo_aplicacion === 'mochila' ? validarCampos('operario', formData.operario) : true;
    const duracionOk = formData.metodo_aplicacion === 'mochila' ? validarCampos('duracion_minutos', formData.duracion_minutos) : true;
    const mochilasOk = formData.metodo_aplicacion === 'mochila' ? validarCampos('mochilas', formData.mochilas) : true;
    const turbosOk   = formData.metodo_aplicacion === 'tractor'  ? validarCampos('turbos', formData.turbos) : true;

    if (productosAñadidos.length === 0) {
      setErrors(prev => ({ ...prev, productos: 'Debes añadir al menos un producto' }));
      return;
    }

    // compruebo que todos los productos tengan producto y dosis rellenados
    const productosOk = productosAñadidos.every(
      item => item.producto_id !== '' && item.dosis_introducida !== ''
    );

    if (!productosOk) {
      setErrors(prev => ({ ...prev, productos: 'Todos los productos deben tener producto y dosis' }));
      return;
    }

    setErrors(prev => ({ ...prev, productos: '' }));

    if (metodoOk && fechaOk && descripcionOk && operarioOk && duracionOk && mochilasOk && turbosOk && precioOk) {
       console.log('precio que se envia:', formData.precio)  // ← añade esto
  console.log('precioPorHora:', precioPorHora)   
      fumigacionService.postCrearFumigacion({ ...formData, productos: productosAñadidos })
        .then(() => {
          // fumigacion creada correctamente, muestro modal de exito
          setMensajeModal('Fumigación creada correctamente')
          setEsExito(true)
          setMostrarModal(true)
        })
        .catch(err => {
          console.log('Errores Laravel:', err.response?.data);
          if (err.response?.status === 422) {
            // pinto los errores de laravel debajo de cada campo
            const nuevosErrores = {};
            for (const campo in err.response.data.errors) {
              nuevosErrores[campo] = err.response.data.errors[campo][0];
            }
            setErrors(prev => ({ ...prev, ...nuevosErrores }));
          } else {
            // error generico de servidor
            setMensajeModal('Error del servidor. Inténtalo de nuevo.')
            setEsExito(false)
            setMostrarModal(true)
          }
        });
    }
  };

  return (
    <div className="form-container">

      {/* modal de exito o error al enviar el formulario */}
      {mostrarModal && (
        <Modal
          mesajeError={mensajeModal}
          cerrarModal={cerrarModal}
        />
      )}

      {/* modal de confirmacion al eliminar un producto de la lista */}
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

          {/* primero selecciono el metodo porque de el depende el selector de parcelas */}
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

          {/* si es mochila solo dejo seleccionar una parcela con un select */}
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

          {/* si es tractor se pueden seleccionar varias parcelas con checkboxes */}
          {formData.metodo_aplicacion === 'tractor' && (
            <div className="form-grupo">
              <label>Parcelas *</label>
              <div className="parcelas-checkboxes">
                {parcelas.map(parcela => (
                  <label key={parcela.id} className="parcela-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.parcela_ids.includes(parcela.id)}
                      onChange={() => toggleParcela(parcela.id)}
                    />
                    {parcela.poligono} - {parcela.parcela} ({parcela.variedad})
                  </label>
                ))}
              </div>
              {errors.parcela_ids && <span className="mensaje-error">{errors.parcela_ids}</span>}
            </div>
          )}

          {/* en mochila el precio se introduce por hora y se calcula el total automaticamente */}
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

          {/* en tractor el precio es por tanque, el total se calcula con los turbos */}
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

          {/* precio total calculado automaticamente, solo lectura para que no lo toque el usuario */}
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

          {/* duracion solo si es mochila */}
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

          {/* productos que se usan en la fumigacion, se pueden añadir varios */}
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

                  {/* muestro la dosis recomendada para que el usuario sepa cuanto poner */}
                  {prodSeleccionado && (
                    <p>Dosis recomendada: {prodSeleccionado.dosis_recomendada} {prodSeleccionado.unidad}</p>
                  )}

                  <label>Dosis Introducida *</label>
                  <input
                    name="dosis_introducida"
                    value={item.dosis_introducida}
                    onChange={(e) => handleChangeProducto(e, index)}
                  />
                  {/* al pulsar eliminar abro el modal de confirmacion en vez de borrar directo */}
                  <button type="button" onClick={() => pedirConfirmacionEliminar(index)}>Eliminar</button>
                </div>
              )
            })}
            {errors.productos && <span className="mensaje-error">{errors.productos}</span>}
            <button type="button" onClick={añadirFila}>+ Añadir producto</button>
          </div>

          {/* mochilas solo si el metodo es mochila */}
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

          {/* turbos si es tractor, cada turbo son 1500 litros */}
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