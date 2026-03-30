import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Modal from "../Modal/Modal.jsx"
import authService from '../../services/auth'
import '../Style/formStyles.css'

const FormLogin = () =>{

const [credencials,setCredencials] = useState({
    email:'',
    password:'',
});

//useState para el modal y los errores 

const [errors, setErrors] = useState({ email: '', password: '' })
const [modalError, setModalError] = useState({ visible: false, mensaje: '' })

const navigate = useNavigate()


//regex comprobación correo y password

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
            sessionStorage.setItem('token', response.token)
            sessionStorage.setItem('usuario', JSON.stringify(response.usuario))
            navigate('/dashboard')
        })
      .catch(err => {
         if (err.response?.status === 401) {
                setModalError({ visible: true, mensaje: 'Credenciales incorrectas' })
            } else {
                setModalError({ visible: true, mensaje: 'Error del servidor' })
            }
    })

  } else {
    console.log('formulario inválido', {emailOk, passwordOk})
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