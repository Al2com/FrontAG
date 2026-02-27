import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import parcelaService from '../../services/parcelas';
import explotacionesService from "../../services/explotaciones";
import propietariosService from "../../services/propietarios"

const FormParcela = () => {

  const navigate = useNavigate();

  const regexPoligono = /^\d{1,12}$/;
  const regexParcela = /^\d{1,4}$/;
  const regexVariedad = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{1,10}$/;
  const regexDimension = /^\d{1,4}(\.\d{1,2})?$/;
  const regexNumArboles = /^([1-9]\d{0,2}|[12]\d{3}|3000)$/;
  const regexDescripcion = /^(\S+\s*){1,50}$/;

  //datos select
  const [explotaciones,setExplotaciones] = useState([]);
  const [propietarios, setPropietario] = useState([]);

  useEffect(() => {
    explotacionesService.getCount()
      .then(data => {
        console.log(data.nom)
        setExplotaciones(data.nom);
      })
  },[])

  useEffect(() => {
    propietariosService.getPropietarios()
     .then(data => {
      setPropietario(data.propietarios)
})
  }, []);

  

  const [formData,setFormData] = useState ({
    explotacion_id :"",
    propietarios : "",
    rol:"manta",
    poligono:"",
    parcela:"",
    variedad:"",
    dimension_hanegadas:"",
    num_arboles:"",
    fecha_plantacion:"",
    descripcion:""

  })
//maneja los errores cuando no hacen regex ok
  const [errors, setErrors] = useState({
    poligono:"",
    parcela:"",
    variedad:"",
    dimension_hanegadas:"",
    num_arboles:"",
    fecha_plantacion:"",
    descripcion:""


});


  const actualizaEstado = (e) =>{

    const {name, value} = e.target
    setFormData({...formData , [name] : value})
    validarCampos(name, value);

  }




  const enviarFormulario = (e) => {
    e.preventDefault();

     const poligonoOk = validarCampos('poligono', formData.poligono);
     const parcelaOk= validarCampos('parcela', formData.parcela);
     const variedadOk= validarCampos('variedad', formData.variedad);
     const dimensionOk = validarCampos('dimension_hanegadas', formData.dimension_hanegadas);
     const num_arbolesOk = validarCampos('num_arboles', formData.num_arboles);
     const fecha_plantacionOk = validarCampos('fecha_plantacion', formData.fecha_plantacion);
     const descripcionOk =  validarCampos('descripcion', formData.descripcion);

     if(poligonoOk && parcelaOk && variedadOk && dimensionOk && num_arbolesOk && fecha_plantacionOk && descripcionOk &&
        formData.poligono !=="" && formData.parcela !=="" && formData.dimension_hanegadas !== "" &&
        formData.user_id !=="" && formData.propietarios_id !==""){

       parcelaService.postCrear(formData)
        .then((response) => {
          navigate('/parcelas')
        })
        .catch(err => console.error(err))
     }

     }
    
  
   

  const validarCampos = (name, value) => {
      let mensaje = '';
      let comprobar = true;

      if(name === 'poligono' && !regexPoligono.test(value)){
          mensaje = 'Número de 2 cifras';
          comprobar = false;
      }
      if(name === 'parcela' && !regexParcela.test(value)){
          mensaje = 'Número de 2 cifras';
          comprobar = false;
      }
      if(name === 'variedad' && !regexVariedad.test(value)){
          mensaje = 'Palabra de 8 letras máximo';
          comprobar = false;
      }
      if(name === 'dimension_hanegadas' && !regexDimension.test(value)){
          mensaje = 'Número decimal ejemplo 2.34';
          comprobar = false;
      }
      if(name === 'num_arboles' && !regexNumArboles.test(value)){
          mensaje = 'Número entero max 3000';
          comprobar = false;
      }
      if(name === 'descripcion' && !regexDescripcion.test(value)){
          mensaje = 'Mínimo 50 caracteres';
          comprobar = false;
      }

      setErrors({...errors, [name]: mensaje});
      return comprobar;
  }




  return(

     <div className="form-container">
      <h1>Nueva Parcela</h1>
      
      <form  className="form-grid" onSubmit={enviarFormulario}>
        
        {/* Explotación */}
        <div className="form-grupo">
          <label htmlFor="explotacion_id">Explotación *</label>
          <select
            id="explotacion_id"
            name="explotacion_id"
            value={formData.explotacion_id}
            onChange={actualizaEstado}
            
          >
            <option value="">Selecciona una explotación</option>
          {explotaciones.map((explotacion) => (
            <option key={explotacion.id} value={explotacion.id}>
              {explotacion.nombre}
            </option>
          ))}

          </select>
        </div>

        {/* Propietario */}
        <div className="form-grupo">
          <label htmlFor="propietario_id">Propietario *</label>
          <select
         
            name="propietarios_id"
            value={formData.propietarios_id}
            onChange={actualizaEstado}
            
          >
            <option value="">Selecciona un propietario</option>
             {propietarios.map((propietario) => (
              <option key={propietario.id} value={propietario.id}>
                {propietario.nombre}
              </option>
            ))}
            
          </select>
        </div>

        {/* Tipo de Riego */}
        <div className="form-grupo">
          <label htmlFor="riego">Tipo de Riego *</label>
          <select
            id="riego"
            name="riego"
            value={formData.riego}
            onChange={actualizaEstado}
            required
          >
            <option value="manta">Manta</option>
            <option value="goteo">Goteo</option>
          </select>
        </div>
        <div>
                {/* Polígono */}
                <div className="form-grupo">
                  <label htmlFor="pol_parcela">Polígono*</label>
                  <input
                    type="text"
                    id="poligono"
                    name="poligono"
                    value={formData.poligono}
                    onChange={actualizaEstado}
                    placeholder="Ej: 12"
                    required
                  />
                </div>
                  {/*Parcela */}
                <div className="form-grupo">
                  <label htmlFor="parcela">Parcela*</label>
                  <input
                    type="text"
                    id="parcela"
                    name="parcela"
                    value={formData.parcela}
                    onChange={actualizaEstado}
                    placeholder="Ej: 45"
                    required
                  />
                </div>
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
            required
            className={errors.variedad ? 'input-error' : ''}
          />
          {errors.variedad && <span className="mensaje-error">{errors.variedad}</span>}
        </div>

        {/* Dimensión en Hanegadas */}
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
            required
            className={errors.hanegadas ? 'input-error' : ''}
          />
            {errors.hanegadas && <span className="mensaje-error">{errors.hanegadas}</span>}
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
            required
            className={errors.hanegadas ? 'input-error' : ''}
          />
            {errors.num_arboles && <span className="mensaje-error">{errors.num_arboles}</span>}

        </div>

        {/* Fecha de Plantación */}
        <div className="form-grupo">
          <label htmlFor="fecha_plantacion">Fecha de Plantación</label>
          <input
            type="date"
            id="fecha_plantacion"
            name="fecha_plantacion"
            value={formData.fecha_plantacion}
            onChange={actualizaEstado}
            required
          />
            {errors.fecha_plantacion && <span className="mensaje-error">{errors.fecha_plantacion}</span>}
        </div>

        {/* Descripción */}
        <div className="form-grupo full-width">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            rows="4"
            placeholder="Descripción de la Explotación"
            value={formData.descripcion}
            onChange={actualizaEstado}
            className={errors.descripcion ? 'input-error' : ''} 
          />
          {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}
        </div>

        <div className="form-actions full-width">
          <button type="submit">Guardar</button>
        </div>
      </form>
    </div>
  )
}


  export default FormParcela;