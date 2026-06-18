import { useState } from "react"
import { Link } from "react-router-dom"
import Modal from "../Modal/Modal.jsx"
import passwordService from '../../services/password'
import '../Style/forms.css'

// Paso 1 del flujo: el usuario pide el enlace de recuperación con su email.
// El back responde siempre un mensaje genérico (no revela qué correos existen).
const FormForgotPassword = () => {

  const [email, setEmail] = useState('')
  const [errorEmail, setErrorEmail] = useState('')
  const [mensajeOk, setMensajeOk] = useState('')
  const [modalError, setModalError] = useState({ visible: false, mensaje: '' })
  const [cargando, setCargando] = useState(false)

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const enviarFormulario = (e) => {
    e.preventDefault()
    setMensajeOk('')

    if (!regexEmail.test(email)) {
      setErrorEmail('Introduce un correo con formato válido (alvaro@daw.com)')
      return
    }
    setErrorEmail('')
    setCargando(true)

    passwordService.solicitarRecuperacion(email)
      .then(data => setMensajeOk(data.message))
      .catch(err => {
        // 429 (throttle) u otro error: mostramos el mensaje del back si viene
        const msg = err.response?.data?.message || 'No se pudo procesar la solicitud. Inténtalo de nuevo en unos minutos.'
        setModalError({ visible: true, mensaje: msg })
      })
      .finally(() => setCargando(false))
  }

  const cerrarModal = () => setModalError({ visible: false, mensaje: '' })

  return (
    <div className="login">
      {modalError.visible && <Modal mesajeError={modalError.mensaje} cerrarModal={cerrarModal} />}
      <form onSubmit={enviarFormulario}>
        <div className="form-login">
          <div className="header-login">
            <img src="./LAgroGestion.png" alt="Logo AgroGestión" />
          </div>

          <h3>Recuperar contraseña</h3>
          <p>Introduce tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>

          <div>
            <label>Correo Electronico</label>
            <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errorEmail && <p className="error">{errorEmail}</p>}
          </div>

          <button type="submit" disabled={cargando}>
            {cargando ? 'Enviando...' : 'Enviar enlace'}
          </button>

          {mensajeOk && <p style={{ color: 'green', marginTop: '10px' }}>{mensajeOk}</p>}

          <p className="olvidar-contasena">
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default FormForgotPassword
