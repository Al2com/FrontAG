import Modal from "../Modal/Modal.jsx"
import authService from '../../services/auth'
import '../Style/formStyles.css'
import { useState } from "react"

const FormLogin = ({setUser}) =>{

const [credencials,setCredencials] = useState({
    email:'',
    password:'',
});

//useState para el modal y los errores 

const [errors, setErrors] = useState({ email: '', password: '' })
const [modalError, setModalError] = useState({ visible: false, mensaje: '' })




//regex comprobación correo y password
//uno o mas caracteres que no sean ni espacion ni @ , debe tener la @ del correo , despues el punto
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//cualquier caracter minimo 6 caracteres
const regexPassword = /^.{6,}$/;

//actualiza los imputs
const handleChange=(e)=>{
    const {name,value}=e.target
    setCredencials({...credencials,[name]:value});

}

//validar los campos 
const validarCampos=(name,value) =>{

    let mensaje = '';
    let comprobar=true;

  if(name==='email' && !regexEmail.test(value)){
      mensaje = '*****';
      comprobar=false;
  }

  if(name==='password' && !regexPassword.test(value)){
      mensaje = '*****';
      comprobar=false;
  }



  setErrors({ ...errors, [name]: mensaje });

return comprobar;

}


//conprobar el regex y enviar formaulario al back

const enviarFormulario = (e) => {
  e.preventDefault();

  const emailOk = validarCampos('email', credencials.email);
  const passwordOk = validarCampos('password', credencials.password);

  if(emailOk && passwordOk){
    
    authService.postLogin(credencials)
     .then((response) => {
            // console.log('respuesta login:', response)
            //aqui se trae del back con el response y se guardan usuario token y rol en sesionStorage
            sessionStorage.setItem('token', response.token)
            //aqui lo convierte a string porque es un objeto y sesionstorage no guarda objetos
            sessionStorage.setItem('usuario', JSON.stringify(response.usuario))
            sessionStorage.setItem('rol', response.rol)
            //se actualiza el usuario que se pasa por prop
            setUser(response.usuario)
        
        })
      .catch(err => {
         if (err.response?.status === 401) {
                setModalError({ visible: true, mensaje: 'El email o el password son incorrectos' })
            } else {
                setModalError({ visible: true, mensaje: 'Error del servidor' })
            }
    })

  } else {
    console.log('formulario inválido', {emailOk, passwordOk})
    console.log('password valor:', credencials.password)
console.log('longitud:', credencials.password.length)
 
  }
};

//funcion para cerrar el modal 
const cerrarModal = () => setModalError({ visible: false, mensaje: '' })





    return(

        <div className="login">

              {modalError.visible && <Modal mesajeError={modalError.mensaje} cerrarModal={cerrarModal} />}  
            <form onSubmit={enviarFormulario}>
                <div className="form-login">
                    <div>
                        <label htmlFor="">Correo Electronico</label>
                        <input 
                        name="email"
                        value={credencials.email}
                        onChange={handleChange}/>
                     </div>
                     <div>
                        <label htmlFor="">Contraseña</label>
                        <input 
                        name="password"
                        value={credencials.password}
                        onChange={handleChange}/> 
                        </div>
               

                      <button type="submit">Iniciar Sesión</button>
                 </div>
            </form>

        </div>

    )
}

export default FormLogin