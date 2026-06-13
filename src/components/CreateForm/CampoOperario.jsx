import { useState, useEffect } from 'react'
import trabajadoresService from '../../services/trabajadores'

const CampoOperario = ({ value, onChange, error }) => {
  const [trabajadores, setTrabajadores] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nuevo, setNuevo] = useState({ name: '', email: '', password: '' })
  const [errorForm, setErrorForm] = useState('')

  const rol = sessionStorage.getItem('rol')

  const cargar = () => {
    trabajadoresService.getTrabajadores()
      .then(data => setTrabajadores(data.usuarios))
      .catch(() => setTrabajadores([]))
  }

  useEffect(() => { cargar() }, [])

  const crear = () => {
    setErrorForm('')
    if (!nuevo.name || !nuevo.email || !nuevo.password) {
      setErrorForm('Rellena nombre, email y contraseña')
      return
    }
    trabajadoresService.crearTrabajador(nuevo)
      .then(res => {
        cargar()
        // selecciona automáticamente el operario recién creado
        onChange({ target: { name: 'operario', value: res.usuario.name } })
        setNuevo({ name: '', email: '', password: '' })
        setMostrarForm(false)
      })
      .catch(err => {
        const msg = err.response?.data?.errors
          ? Object.values(err.response.data.errors)[0][0]
          : (err.response?.data?.mensaje || 'No se pudo crear el operario')
        setErrorForm(msg)
      })
  }

  return (
    <div className="form-grupo">
      <label htmlFor="operario">Operario *</label>

      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          id="operario"
          name="operario"
          value={value}
          onChange={onChange}
          className={error ? 'input-error' : ''}
          style={{ flex: 1 }}
        >
          <option value="">Selecciona un operario</option>
          {trabajadores.map(t => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>

        {rol !== 'trabajador' && (
          <button
            type="button"
            onClick={() => setMostrarForm(!mostrarForm)}
            title="Crear operario"
          >
            +
          </button>
        )}
      </div>

      {error && <span className="mensaje-error">{error}</span>}

      {mostrarForm && (
        <div className="nuevo-operario" style={{ marginTop: '8px', display: 'grid', gap: '6px' }}>
          <input
            type="text"
            placeholder="Nombre del operario"
            value={nuevo.name}
            onChange={e => setNuevo({ ...nuevo, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={nuevo.email}
            onChange={e => setNuevo({ ...nuevo, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={nuevo.password}
            onChange={e => setNuevo({ ...nuevo, password: e.target.value })}
          />
          <button type="button" onClick={crear}>Crear operario</button>
          {errorForm && <span className="mensaje-error">{errorForm}</span>}
        </div>
      )}
    </div>
  )
}

export default CampoOperario
