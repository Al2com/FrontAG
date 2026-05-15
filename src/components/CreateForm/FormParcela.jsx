import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import parcelaService from '../../services/parcelas';
import explotacionesService from "../../services/explotaciones";
import propietariosService from "../../services/propietarios";
import '../Style/forms.css'


const FormParcela = () => {

  const navigate = useNavigate();

  const [explotaciones, setExplotaciones] = useState([]);
  const [propietarios, setPropietario] = useState([]);

  const regexPoligono = /^\d{1,12}$/;
  const regexParcela = /^\d{1,4}$/;
  const regexVariedad = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{1,10}$/;
  const regexDimension = /^\d{1,4}(\.\d{1,2})?$/;
  const regexNumArboles = /^([1-9]\d{0,2}|[12]\d{3}|3000)$/;
  const regexDescripcion = /^(\S+\s*){1,50}$/;

  useEffect(() => {
    explotacionesService.getCount()
      .then(data => setExplotaciones(data.nom))
      .catch(() => setErrors(prev => ({ ...prev, explotacion_id: 'Error al cargar las explotaciones' })))

    propietariosService.getPropietarios()
      .then(data => setPropietario(data.propietarios))
      .catch(() => setErrors(prev => ({ ...prev, propietarios_id: 'Error al cargar los propietarios' })))
  }, []);

  const [formData, setFormData] = useState({
    explotacion_id: "",
    propietarios_id: "",
    nombre: "",
    rol: "manta",
    poligono: "",
    parcela: "",
    variedad: "",
    dimension_hanegadas: "",
    num_arboles: "",
    fecha_plantacion: "",
    descripcion: ""
  });

  const [errors, setErrors] = useState({
    explotacion_id: "",
    propietarios_id: "",
    poligono: "",
    parcela: "",
    variedad: "",
    dimension_hanegadas: "",
    num_arboles: "",
    fecha_plantacion: "",
    descripcion: ""
  });

  const validarCampos = (name, value) => {
    let mensaje = '';
    let comprobar = true;

    if ((name === 'explotacion_id' || name === 'propietarios_id') && value === "") {
      mensaje = 'Debes seleccionar una opción';
      comprobar = false;
    }

    if (name === 'poligono' && !regexPoligono.test(value)) {
      mensaje = 'Número de 2 cifras';
      comprobar = false;
    }

    if (name === 'parcela' && !regexParcela.test(value)) {
      mensaje = 'Número de 2 cifras';
      comprobar = false;
    }

    if (name === 'variedad' && !regexVariedad.test(value)) {
      mensaje = 'Palabra de 8 letras máximo';
      comprobar = false;
    }

    if (name === 'dimension_hanegadas' && !regexDimension.test(value)) {
      mensaje = 'Número decimal ejemplo 2.34';
      comprobar = false;
    }

    if (name === 'num_arboles' && !regexNumArboles.test(value)) {
      mensaje = 'Número entero max 3000';
      comprobar = false;
    }

    if (name === 'fecha_plantacion' && value === "") {
      mensaje = 'La fecha es obligatoria';
      comprobar = false;
    }

    if (name === 'descripcion' && !regexDescripcion.test(value)) {
      mensaje = 'Mínimo 50 caracteres';
      comprobar = false;
    }

    setErrors(prevErrors => ({ ...prevErrors, [name]: mensaje }));
    return comprobar;
  }

  const actualizaEstado = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validarCampos(name, value);
  }

  const enviarFormulario = (e) => {
    e.preventDefault();

    const explotacionOk = validarCampos('explotacion_id', formData.explotacion_id);
    const propietarioOk = validarCampos('propietarios_id', formData.propietarios_id);
    const poligonoOk = validarCampos('poligono', formData.poligono);
    const parcelaOk = validarCampos('parcela', formData.parcela);
    const variedadOk = validarCampos('variedad', formData.variedad);
    const dimensionOk = validarCampos('dimension_hanegadas', formData.dimension_hanegadas);
    const numArbolesOk = validarCampos('num_arboles', formData.num_arboles);
    const fechaOk = validarCampos('fecha_plantacion', formData.fecha_plantacion);
    const descripcionOk = validarCampos('descripcion', formData.descripcion);

    if (explotacionOk && propietarioOk && poligonoOk && parcelaOk && variedadOk &&
      dimensionOk && numArbolesOk && fechaOk && descripcionOk) {

      parcelaService.postCrear(formData)
        .then(() => {
          navigate('/parcelas');
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
  }

  return (
    <div className="form-container">
      <h1>Nueva Parcela</h1>

      <form className="form-grid" onSubmit={enviarFormulario}>

        {/* Explotación */}
        <div className="form-grupo">
          <label htmlFor="explotacion_id">Explotación *</label>
          <select
            id="explotacion_id"
            name="explotacion_id"
            value={formData.explotacion_id}
            onChange={actualizaEstado}
            className={errors.explotacion_id ? 'input-error' : ''}
          >
            <option value="">Selecciona una explotación</option>
            {explotaciones.map((explotacion) => (
              <option key={explotacion.id} value={explotacion.id}>
                {explotacion.nombre}
              </option>
            ))}
          </select>
          {errors.explotacion_id && <span className="mensaje-error">{errors.explotacion_id}</span>}
        </div>

        {/* Propietario */}
        <div className="form-grupo">
          <label htmlFor="propietarios_id">Propietario *</label>
          <select
            id="propietarios_id"
            name="propietarios_id"
            value={formData.propietarios_id}
            onChange={actualizaEstado}
            className={errors.propietarios_id ? 'input-error' : ''}
          >
            <option value="">Selecciona un propietario</option>
            {propietarios.map((propietario) => (
              <option key={propietario.id} value={propietario.id}>
                {propietario.nombre}
              </option>
            ))}
          </select>
          {errors.propietarios_id && <span className="mensaje-error">{errors.propietarios_id}</span>}
        </div>

        {/* Tipo de Riego */}
        <div className="form-grupo">
          <label htmlFor="riego">Tipo de Riego *</label>
          <select
            id="riego"
            name="riego"
            value={formData.riego}
            onChange={actualizaEstado}
          >
            <option value="manta">Manta</option>
            <option value="goteo">Goteo</option>
          </select>
        </div>

        {/* Polígono */}
        <div className="form-grupo">
          <label htmlFor="poligono">Polígono *</label>
          <input
            type="number"
            id="poligono"
            name="poligono"
            value={formData.poligono}
            onChange={actualizaEstado}
            placeholder="Ej: 12"
            className={errors.poligono ? 'input-error' : ''}
          />
          {errors.poligono && <span className="mensaje-error">{errors.poligono}</span>}
        </div>

        {/* Parcela */}
        <div className="form-grupo">
          <label htmlFor="parcela">Parcela *</label>
          <input
            type="number"
            id="parcela"
            name="parcela"
            value={formData.parcela}
            onChange={actualizaEstado}
            placeholder="Ej: 45"
            className={errors.parcela ? 'input-error' : ''}
          />
          {errors.parcela && <span className="mensaje-error">{errors.parcela}</span>}
        </div>

        {/* Variedad */}
        <div className="form-grupo">
          <label htmlFor="variedad">Variedad *</label>
          <input
            type="text"
            id="variedad"
            name="variedad"
            value={formData.variedad}
            onChange={actualizaEstado}
            placeholder="Ej: Rojo Brillante"
            className={errors.variedad ? 'input-error' : ''}
          />
          {errors.variedad && <span className="mensaje-error">{errors.variedad}</span>}
        </div>

        {/* Hanegadas */}
        <div className="form-grupo">
          <label htmlFor="dimension_hanegadas">Hanegadas *</label>
          <input
            type="number"
            step="0.01"
            id="dimension_hanegadas"
            name="dimension_hanegadas"
            value={formData.dimension_hanegadas}
            onChange={actualizaEstado}
            placeholder="Ej: 2.5"
            className={errors.dimension_hanegadas ? 'input-error' : ''}
          />
          {errors.dimension_hanegadas && <span className="mensaje-error">{errors.dimension_hanegadas}</span>}
        </div>

        {/* Número de Árboles */}
        <div className="form-grupo">
          <label htmlFor="num_arboles">Número de Árboles *</label>
          <input
            type="number"
            id="num_arboles"
            name="num_arboles"
            value={formData.num_arboles}
            onChange={actualizaEstado}
            placeholder="Ej: 250"
            className={errors.num_arboles ? 'input-error' : ''}
          />
          {errors.num_arboles && <span className="mensaje-error">{errors.num_arboles}</span>}
        </div>

        {/* Fecha de Plantación */}
        <div className="form-grupo">
          <label htmlFor="fecha_plantacion">Fecha de Plantación *</label>
          <input
            type="date"
            id="fecha_plantacion"
            name="fecha_plantacion"
            value={formData.fecha_plantacion}
            onChange={actualizaEstado}
            className={errors.fecha_plantacion ? 'input-error' : ''}
          />
          {errors.fecha_plantacion && <span className="mensaje-error">{errors.fecha_plantacion}</span>}
        </div>

        {/* Nombre parcela */}
        <div className="form-grupo">
          <label>Nombre de la parcela</label>
          <input
            type="text"
            name="nombre"
            maxLength={25}
            value={formData.nombre}
            onChange={actualizaEstado}
            placeholder="Nombre de la parcela"
          />
        </div>

        {/* Descripción */}
        <div className="form-grupo full-width">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            rows="4"
            placeholder="Descripción de la parcela"
            value={formData.descripcion}
            onChange={actualizaEstado}
            className={errors.descripcion ? 'input-error' : ''}
          />
          {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}
        </div>

        <div className="form-actions full-width">
          <button type="submit">Guardar</button>
          <button type="button" onClick={() => navigate('/parcelas')} className="btn-cancel">Atrás</button>
         
        </div>

      </form>
    </div>
  )
}

export default FormParcela;