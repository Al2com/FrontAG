import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import Modal from "../Modal/Modal.jsx"
import passwordService from '../../services/password'
import '../Style/forms.css'

// Paso 2 del flujo: el usuario llega desde el enlace del correo, que trae
// token y email en la query (?token=...&email=...). Escribe la nueva
// contraseña dos veces y se envía al back junto con el token.
const FormResetPassword = () => {

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errors, setErrors] = useState({ password: '', confirm: '' })
  const [mensajeOk, setMensajeOk] = useState('')
  const [modalError, setModalError] = useState({ visible: false, mensaje: '' })
  const [cargando, setCargando] = useState(false)
  const [enlaceValido, setEnlaceValido] = useState(true)

  // el back exige minimo 8 caracteres y confirmacion
  const regexPassword = /^.{8,}$/

  // si falta el token o el email, el enlace está roto: no mostramos el formulario
  useEffect(() => {
    if (!token || !email) setEnlaceValido(false)
  }, [token, email])

  const enviarFormulario = (e) => {
    e.preventDefault()
    setMensajeOk('')

    const nuevosErrores = { password: '', confirm: '' }
    if (!regexPassword.test(password)) nuevosErrores.password = 'La contraseña debe tener mínimo 8 caracteres'
    if (password !== passwordConfirm) nuevosErrores.confirm = 'Las contraseñas no coinciden'
    setErrors(nuevosErrores)
    if (nuevosErrores.password || nuevosErrores.confirm) return

    setCargando(true)
    passwordService.restablecerPassword({ token, email, password, passwordConfirmation: passwordConfirm })
      .then(data => setMensajeOk(data.message || 'Contraseña actualizada correctamente.'))
      .catch(err => {
        // 422: token caducado/inválido o validación; mostramos el mensaje del back
        const msg = err.response?.data?.message || 'El enlace no es válido o ha caducado.'
        setModalError({ visible: true, mensaje: msg })
      })
      .finally(() => setCargando(false))
  }

  const cerrarModal = () => setModalError({ visible: false, mensaje: '' })

  if (!enlaceValido) {
    return (
      <div className="login">
        <div className="form-login">
          <div className="header-login">
            <img src="./LAgroGestion.png" alt="Logo AgroGestión" />
          </div>
          <h3>Enlace no válido</h3>
          <p>El enlace de recuperación está incompleto o ha caducado.</p>
          <p className="olvidar-contasena">
            <Link to="/forgot-password">Solicitar uno nuevo</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="login">
      {modalError.visible && <Modal mesajeError={modalError.mensaje} cerrarModal={cerrarModal} />}
      <form onSubmit={enviarFormulario}>
        <div className="form-login">
          <div className="header-login">
            <img src="./LAgroGestion.png" alt="Logo AgroGestión" />
          </div>

          <h3>Nueva contraseña</h3>
          <p>Crea una nueva contraseña para <strong>{email}</strong>.</p>

          {mensajeOk ? (
            // tras el éxito ocultamos el formulario y ofrecemos ir al login
            <>
              <p style={{ color: 'green', marginTop: '10px' }}>{mensajeOk}</p>
              <p className="olvidar-contasena">
                <Link to="/login">Ir a iniciar sesión</Link>
              </p>
            </>
          ) : (
            <>
              <div>
                <label>Nueva contraseña</label>
                <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                {errors.password && <p className="error">{errors.password}</p>}
              </div>
              <div>
                <label>Repite la contraseña</label>
                <input name="passwordConfirm" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
                {errors.confirm && <p className="error">{errors.confirm}</p>}
              </div>
              <button type="submit" disabled={cargando}>
                {cargando ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}

export default FormResetPassword
