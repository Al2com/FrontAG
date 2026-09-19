import { useState } from 'react'
import './Style/consultor.css'
import consultorService from '../services/consultor.js'

const Consultor = () => {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)

  const enviar = async () => {
    if (!input.trim() || cargando) return

    const pregunta = input.trim()
    setInput('')
    setCargando(true)

    const nuevosMensajes = [...mensajes, { role: 'user', content: pregunta }]
    setMensajes(nuevosMensajes)

    try {
    const data = await consultorService.consultar(nuevosMensajes)
    console.log('respuesta Groq:', JSON.stringify(data))
    const textoFinal = data.choices[0].message.content
    setMensajes(prev => [...prev, { role: 'assistant', content: textoFinal }])
} catch (err) {
    console.error('Error completo:', err.response?.data)
} finally {
      setCargando(false)
    }
  }

  return (
    <div className="consultor-container">
      <h2>Consultor IA</h2>
      <p>Pregúntame sobre tus gastos, rentabilidad o datos de la explotación</p>

      <div className="consultor-mensajes">
        {mensajes.length === 0 && (
          <p className="consultor-vacio">¿En qué puedo ayudarte hoy?</p>
        )}
        {mensajes.map((m, i) => (
          <div key={i} className={`consultor-mensaje consultor-${m.role}`}>
            <span className="consultor-rol">{m.role === 'user' ? 'Tú' : '🌿 Consultor'}</span>
            <p>{m.content}</p>
          </div>
        ))}
        {cargando && (
          <div className="consultor-mensaje consultor-assistant">
            <span className="consultor-rol">🌿 Consultor</span>
            <p>Consultando datos...</p>
          </div>
        )}
      </div>

      <div className="consultor-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && enviar()}
          placeholder="¿Cuánto gasté en Avionetes este año?"
          disabled={cargando}
        />
        <button onClick={enviar} disabled={cargando}>
          Enviar
        </button>
      </div>
    </div>
  )
}

export default Consultor