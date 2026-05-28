import '../Style/forms.css'
import '../Style/modal.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import parcelasService from '../../services/parcelas'
import productoService from '../../services/productos'
import fumigacionService from '../../services/fumigaciones'

const FormFumigacion = () => {

  const navigate = useNavigate()

  const [parcelas, setParcelas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosAñadidos, setProductosAñadidos] = useState([])

  // parcela_ids es un array para tractor, para mochila solo puede haber una
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

  // si es mochila calculo el precio total multiplicando precio por hora por las horas trabajadas
  useEffect(() => {
    if (formData.metodo_aplicacion !== 'mochila') return

    const precioPorHora = parseFloat(formData.precio)
    const duracion = parseFloat(formData.duracion_minutos)

    if (!isNaN(precioPorHora) && !isNaN(duracion) && precioPorHora > 0 && duracion > 0) {
      const horas = duracion / 60
      const total = (precioPorHora * horas).toFixed(2)
      setFormData(prev => ({ ...prev, precio: total }))
    }
  }, [formData.duracion_minutos])

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

  const eliminarFila = (index) => {
    setProductosAñadidos(productosAñadidos.filter((_, i) => i !== index));
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
      console.log('Datos enviados:', { ...formData, productos: productosAñadidos });

      fumigacionService.postCrearFumigacion({ ...formData, productos: productosAñadidos })
        .then(() => {
          alert('Fumigación creada correctamente');
          navigate('/operaciones');
        })
        .catch(err => {
          console.log('Errores Laravel:', err.response.data);
          if (err.response?.status === 422) {
            // pinto los errores de laravel debajo de cada campo
            const nuevosErrores = {};
            for (const campo in err.response.data.errors) {
              nuevosErrores[campo] = err.response.data.errors[campo][0];
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

          {/* la etiqueta cambia segun el metodo elegido */}
          <div className="form-grupo">
            <label htmlFor="precio">
              {formData.metodo_aplicacion === 'tractor' ? 'Precio por tanque (€)' : 'Precio por hora (€/h)'} *
            </label>
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

                  <button type="button" onClick={() => eliminarFila(index)}>Eliminar</button>
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