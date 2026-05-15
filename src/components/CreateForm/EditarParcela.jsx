import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import parcelasService from '../../services/parcelas.js';
import '../Style/forms.css'

const EditarParcela = () => {
  const { id } = useParams();       
  const navigate = useNavigate();   

  const [formData, setFormData] = useState({
    explotacion_id: '',
    propietarios_id: '',
    nombre: '',
    poligono: '',
    parcela: '',
    rol: '',
    variedad: '',
    dimension_hanegadas: '',
    num_arboles: '',
    fecha_plantacion: '',
    descripcion: '',
  })

  const [errors,setErrors] = useState({
    nombre:'',
    poligono:'',
    parcela:'',
    variedad:'',
    dimension_hanegadas:'',
    num_arboles:'',
    fecha_plantacion: '',
    descripcion: '',

  })

//validacion con regex

const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,50}$/        
const regexPoligono = /^[0-9]{1,4}$/                          
const regexParcela = /^[0-9]{1,4}$/                        
const regexVariedad = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,50}$/       
const regexDimension = /^[0-9]+([.,][0-9]{1,2})?$/            
const regexNumArboles = /^[0-9]{1,5}$/                       
const regexFecha = /^\d{4}-\d{2}-\d{2}$/                   
const regexDescripcion = /^.{10,}$/ 


 // actualiza el estado cuando el usuario escribe
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  //Valida los campos con regex

  const validarCampos = (name, value) => {
  let mensaje = '';
  let comprobar = true;

  if (name === 'nombre' && !regexNombre.test(value)) {
    mensaje = 'Mínimo 3 letras, máximo 50';
    comprobar = false;
  }

  if (name === 'poligono' && !regexPoligono.test(value)) {
    mensaje = 'Debe ser un número (máx. 4 cifras)';
    comprobar = false;
  }

  if (name === 'parcela' && !regexParcela.test(value)) {
    mensaje = 'Debe ser un número (máx. 4 cifras)';
    comprobar = false;
  }

  if (name === 'variedad' && !regexVariedad.test(value)) {
    mensaje = 'Mínimo 3 letras, máximo 50';
    comprobar = false;
  }

  if (name === 'dimension_hanegadas' && !regexDimension.test(value)) {
    mensaje = 'Debe ser un número, puede tener decimales (ej: 12.5)';
    comprobar = false;
  }

  if (name === 'num_arboles' && !regexNumArboles.test(value)) {
    mensaje = 'Debe ser un número (máx. 5 cifras)';
    comprobar = false;
  }

  if (name === 'fecha_plantacion' && !regexFecha.test(value)) {
    mensaje = 'Fecha obligatoria';
    comprobar = false;
  }

  if (name === 'descripcion' && !regexDescripcion.test(value)) {
    mensaje = 'Mínimo 10 caracteres';
    comprobar = false;
  }

  setErrors(prevErrors => ({ ...prevErrors, [name]: mensaje }));
  return comprobar;
}




  // al cargar trae los datos de esa parcela
  useEffect(() => {
    parcelasService.getParcela(id)
      .then(data => setFormData(data))
      .catch(err => console.error('Error al cargar parcela:', err))
  }, [id])
//IMPORTANTE
// Sin array = se ejecuta en cada render → bucle infinito
// useEffect(() => { ... })

// Array vacío [] = se ejecuta solo una vez al montar el componente
// useEffect(() => { ... }, [])

// Array con variable = se ejecuta cuando esa variable cambia
// useEffect(() => { ... }, [id])

 

  // manda los datos al back
  const enviarFormulario = (e) => {
    e.preventDefault();
    parcelasService.putActualizar(id, formData)
      .then(() => {
        alert('Parcela actualizada correctamente');
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

  return (
     <div className="form-container">
      <h1>Editar Parcela</h1>
      <form className="form-grid" onSubmit={enviarFormulario}>

        <div className="form-grupo">
          <label>Nombre</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
        </div>
         {errors.nombre && <span className="mensaje-error">{errors.nombre}</span>}


        <div className="form-grupo">
          <label>Poligono</label>
          <input type="number" name="poligono" value={formData.poligono} onChange={handleChange} />
        </div>
          {errors.poligono && <span className="mensaje-error">{errors.poligono}</span>}


        <div className="form-grupo">
          <label>Parcela</label>
          <input type="number" name="parcela" value={formData.parcela} onChange={handleChange} />
        </div>
          {errors.parcela && <span className="mensaje-error">{errors.parcela}</span>}
   

        <div className="form-grupo">
          <label>Rol</label>
          <select name="rol" value={formData.rol} onChange={handleChange}>
            <option value="goteo">Goteo</option>
            <option value="manta">Manta</option>
          </select>
        </div>
          {errors.rol && <span className="mensaje-error">{errors.rol}</span>}


        <div className="form-grupo">
          <label>Variedad</label>
          <input type="text" name="variedad" value={formData.variedad} onChange={handleChange} />
        </div>
          {errors.variedad && <span className="mensaje-error">{errors.variedad}</span>}


        <div className="form-grupo">
          <label>Dimension hanegadas</label>
          <input type="number" name="dimension_hanegadas" value={formData.dimension_hanegadas} onChange={handleChange} />
        </div>
          {errors.dimension_hanegadas && <span className="mensaje-error">{errors.dimension_hanegadas}</span>}


        <div className="form-grupo">
          <label>Num arboles</label>
          <input type="number" name="num_arboles" value={formData.num_arboles} onChange={handleChange} />
        </div>
          {errors.num_arboles && <span className="mensaje-error">{errors.num_arboles}</span>}


        <div className="form-grupo">
          <label>Fecha plantacion</label>
          <input type="date" name="fecha_plantacion" value={formData.fecha_plantacion} onChange={handleChange} />
        </div>
          {errors.fecha_plantacion && <span className="mensaje-error">{errors.fecha_plantacion}</span>}


        <div className="form-grupo">
          <label>Descripcion</label>
          <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} />
        </div>
          {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}

         <div  className='menu-button'>
          <button type="submit">Guardar cambios</button>
          <button type="button" onClick={() => navigate('/parcelas')}>Atrás</button>
        </div>

      </form>
    </div>
  )
}

export default EditarParcela;