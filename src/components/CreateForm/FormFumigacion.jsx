import '../Style/forms.css'
import '../Style/modal.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import parcelasService from '../../services/parcelas'
import productoService from '../../services/productos'
import fumigacionService from '../../services/fumigaciones'

const FormFumigacion = () => {

  const [parcelas, setParcelas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    parcela_id: "",
    operario: "",
    metodo_aplicacion: "",
    hora_inicio: "",
    duracion_minutos: "",
    mochilas: "",
    turbos: "",
    descripcion: ""
  });

  const [productosAñadidos, setProductosAñadidos] = useState([])

  const [errors, setErrors] = useState({
    parcela_id: "",
    operario: "",
    metodo_aplicacion: "",
    hora_inicio: "",
    duracion_minutos: "",
    mochilas: "",
    turbos: "",
    descripcion: "",
    productos: ""
  });

  useEffect(() => {
    parcelasService.getLista()
      .then(data => setParcelas(data))
      .catch(err => console.error('Error cargando parcelas:', err))

    productoService.getProductos()
      .then(data => setProductos(data))
      .catch(err => console.error('Error cargando productos:', err))
  }, [])

  const navigate = useNavigate()

  const regexDuracion = /^[0-9]{1,4}$/;
  const regexDescripcion = /^.{10,}$/;
  const regexCantidad = /^[0-9]{1,3}$/;

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

    if ((name === 'parcela_id' || name === 'metodo_aplicacion' || name === 'operario') && value === "") {
      mensaje = 'Debes seleccionar una opción';
      comprobar = false;
    }

    if (name === 'hora_inicio' && value === "") {
      mensaje = 'La fecha y hora son obligatorias';
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

  const handleChangeProducto = (e, index) => {
    const { name, value } = e.target
    const mezclaSelecionada = productosAñadidos.map((item, i) =>
      i === index ? { ...item, [name]: value } : item)
    setProductosAñadidos(mezclaSelecionada);
  }

  const añadirFila = () => {
    setProductosAñadidos([...productosAñadidos, { producto_id: '', dosis_introducida: '' }])
  }

  const eliminarFila = (index) => {
    setProductosAñadidos(productosAñadidos.filter((_, i) => i !== index));
  }

  const enviarFormulario = (e) => {
    e.preventDefault();

    const parcelaOk = validarCampos('parcela_id', formData.parcela_id);
    const metodoOk = validarCampos('metodo_aplicacion', formData.metodo_aplicacion);
    const fechaOk = validarCampos('hora_inicio', formData.hora_inicio);
    const descripcionOk = validarCampos('descripcion', formData.descripcion);

    const operarioOk = formData.metodo_aplicacion === 'mochila'
      ? validarCampos('operario', formData.operario)
      : true;
    const duracionOk = formData.metodo_aplicacion === 'mochila'
      ? validarCampos('duracion_minutos', formData.duracion_minutos)
      : true;
    const mochilasOk = formData.metodo_aplicacion === 'mochila'
      ? validarCampos('mochilas', formData.mochilas)
      : true;
    const turbosOk = formData.metodo_aplicacion === 'tractor'
      ? validarCampos('turbos', formData.turbos)
      : true;

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

    if (parcelaOk && metodoOk && fechaOk && descripcionOk &&
      operarioOk && duracionOk && mochilasOk && turbosOk) {

      const datos = {
        ...formData,
        productos: productosAñadidos
      };

      fumigacionService.postCrearFumigacion(datos)
        .then(() => {
          navigate('/operaciones');
        })
        .catch(err => {
          if (err.response?.status === 422) {
            const erroresLaravel = err.response.data.errors;
            // Recorremos cada error que manda Laravel y lo metemos en el estado errors
            // para que aparezca en rojo debajo del input correspondiente
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
      <h1>Nueva Fumigación</h1>

      <form onSubmit={enviarFormulario} className="form-grid">

        <div className="form-grupo">

          {/* Parcela */}
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

          {/* Método */}
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

          {/* Operario */}
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

          {/* Productos */}
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

                  <button type="button" onClick={() => eliminarFila(index)}>
                    Eliminar
                  </button>
                </div>
              )
            })}

            {errors.productos && <span className="mensaje-error">{errors.productos}</span>}
            <button type="button" onClick={añadirFila}>+ Añadir producto</button>
          </div>

          {/* Mochilas */}
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

          {/* Turbos */}
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

        </div>

        {/* Botones */}
        <div className="form-actions full-width">
          <button type="button" onClick={() => navigate('/operaciones')} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit">Guardar Operación</button>
        </div>

      </form>
    </div>
  )
}

export default FormFumigacion