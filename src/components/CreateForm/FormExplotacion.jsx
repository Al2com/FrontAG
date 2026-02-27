import '../Style/formStyles.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import explotacionService from '../../services/explotaciones';
import usuariosService from '../../services/usuarios';
import propietariosService from '../../services/propietarios';

const FormExplotacion = () => {


  const [usuarios, setUsers] = useState([]);
  const [propietarios, setPropietario] = useState([]);


useEffect(() => {
      usuariosService.getUsuarios()
        .then(data => {
          setUsers(data.usuarios)
         
        })


      propietariosService.getPropietarios()
        .then(data => {
          setPropietario(data.propietarios)

        })

     }, []);
 

  //ORIGINARIO 
  //  const [nombre, setNombre] = useState('');
  // const [usuario, setUsuario] = useState('');
  // const [ubicacion, setUbicacion] = useState('');
  // const [descripcion, setDescripcion] = useState('');
  // const [propietario, setPropietario] = useState('');
  // const [dni, setDni] = useState('');


  // con un solo use useState
const [formData, setFormData] = useState({
  nombre: '',
  user_id: '',
  ubicacion: '',
  descripcion: '',
  propietario_id: '',


});

 //con un solo UseState

const [errors, setErrors] = useState({
  nombre: '',
  user_id: '',
  ubicacion: '',
  descripcion: '',
  propietario_id: '',


});


 
const navigate = useNavigate();

//validar con regex, usuario y propietario vienen con el select

  const regexNombre= /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,25}$/;
  const regexUbicacion = /^.{3,}$/;
  const regexDescripcion = /^.{10,}$/; 

   
 

   const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({...formData,[name]: value});
    validarCampos(name, value);
  }


const validarCampos=(name,value) =>{

    let mensaje = '';
    let comprobar=true;

  if(name==='nombre' && !regexNombre.test(value)){
      mensaje = 'Más de 3 letras , o menos de 25';
      comprobar=false;
  }

  if(name==='ubicacion' && !regexUbicacion.test(value)){
      mensaje = 'Solo letras, mínimo 3 caracteres';
      comprobar=false;
  }

 if(name==='descripcion' && !regexDescripcion.test(value)){
  mensaje = 'Mínimo 10 caracteres'; 
  comprobar=false;
}


  setErrors({ ...errors, [name]: mensaje });

return comprobar;

}



const enviarFormulario = (e) => {
  e.preventDefault();

  const nombreOk = validarCampos('nombre', formData.nombre);
  const ubicacionOk = validarCampos('ubicacion', formData.ubicacion);
  const descripcionOk = validarCampos('descripcion', formData.descripcion);

  if(nombreOk && ubicacionOk && descripcionOk &&
     formData.nombre !=="" && formData.ubicacion !=="" && 
     formData.user_id !=="" && formData.propietario_id !==""){
    
    explotacionService.postCrear(formData)
      .then((response) => {  
        console.log('respuesta:', response)
        navigate('/explotaciones')
      })
      .catch(err => console.error(err))

  } else {
    console.log('formulario inválido', {nombreOk, ubicacionOk, descripcionOk, formData})
  }
};

  return (
    <div className="form-container">
      <h1>Nueva Explotación</h1>

      <form className="form-grid" onSubmit={enviarFormulario}>

        <div className="form-grupo">
          <label>Nombre Explotación</label>
          <input
            name="nombre"
            placeholder="Ej: Finca Casa del Pi"
            value={formData.nombre}
            onChange={handleChange}
            className={errors.nombre ? 'input-error' : ''} // si no cumple regex pone la clase y sale el mensaje de bajo
          />
          {errors.nombre && <span className="mensaje-error">{errors.nombre}</span>}
        </div>

        <div className="form-grupo">
          <label>Ubicación</label>
          <input
            name="ubicacion"
            placeholder="Termino municipal"
            value={formData.ubicacion}
            onChange={handleChange}
            className={errors.ubicacion ? 'input-error' : ''} 
          />
          {errors.ubicacion && <span className="mensaje-error">{errors.ubicacion}</span>}
        </div>


      {/* Usuario hace otra peticion a la Api para traer los usuarios al igual que lo propietario */}
        <div className="form-grupo">
          <label>Usuario</label>
          <select
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}>

            <option value="">Selecciona un usuario</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.name}
              </option>
            ))}
          </select>
        </div>


        <div className="form-grupo">
          <label>Propietario</label>
          <select
            name="propietario_id"
            value={formData.propietario_id}
            onChange={handleChange}>

            <option value="">Selecciona un propietario</option>
                {propietarios.map(propietario => (
                  <option key={propietario.id} value={propietario.id}>
                    {propietario.nombre}
              </option>
            ))}
          </select>
        </div>

      

        <div className="form-grupo full-width">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            rows="4"
            placeholder="Descripción de la Explotación"
            value={formData.descripcion}
            onChange={handleChange}
            className={errors.descripcion ? 'input-error' : ''} 
          />
          {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}
        </div>

        <div className="form-actions full-width">
          <button type="submit">Guardar</button>
        </div>

      </form>
    </div>
  );
}

export default FormExplotacion;