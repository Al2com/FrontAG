import { useState, useRef, useEffect } from 'react'
import './Style/consultor.css'
import consultorService from '../services/consultor.js'

const SUGERENCIAS = [
    'Gasto total por parcela en la campaña actual',
    'Stock bajo en el almacén',
    'Producción recolectada por parcela esta campaña',
]

// Los títulos en mayúsculas seguidos de dos puntos se muestran en negrita
// sin depender de ningún símbolo Markdown.
const RespuestaTexto = ({ texto }) => {
    const lineas = texto.split('\n')
    return (
        <div className="consultor-respuesta-texto">
            {lineas.map((linea, i) => {
                const esTitulo = /^[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s]{2,}:/.test(linea.trim())
                return (
                    <p key={i} className={esTitulo ? 'consultor-titulo-seccion' : ''}>
                        {linea || ' '}
                    </p>
                )
            })}
        </div>
    )
}

const Consultor = () => {
    const [mensajes, setMensajes] = useState([])
    const [input, setInput] = useState('')
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null)
    const mensajesRef = useRef(null)

    // Desplaza al último mensaje cada vez que hay uno nuevo
    useEffect(() => {
        if (mensajesRef.current) {
            mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
        }
    }, [mensajes, cargando])

    const enviar = async (textoPregunta) => {
        const pregunta = (textoPregunta || input).trim()
        if (!pregunta || cargando) return

        setInput('')
        setError(null)
        setCargando(true)
        setMensajes(prev => [...prev, { rol: 'usuario', texto: pregunta }])

        try {
            const data = await consultorService.consultar(pregunta)

            if (data?.error) {
                setError(data.message || 'No se ha podido obtener respuesta.')
            } else {
                const respuesta = data?.respuesta
                if (!respuesta) throw new Error('Respuesta sin contenido')
                setMensajes(prev => [...prev, { rol: 'consultor', texto: respuesta }])
            }
        } catch (err) {
            const mensaje = err.response?.data?.message
                || err.response?.data?.errors?.pregunta?.[0]
                || 'No se ha podido obtener respuesta. Inténtalo de nuevo.'
            setError(mensaje)
        } finally {
            setCargando(false)
        }
    }

    const limpiar = () => {
        setMensajes([])
        setError(null)
        setInput('')
    }

    return (
        <div className="consultor-container">
            <div className="consultor-cabecera">
                <div>
                    <h2>Consultor</h2>
                    <p className="consultor-subtitulo">Pregúntame sobre gastos, recolección, stock o cualquier dato de la explotación</p>
                </div>
                {mensajes.length > 0 && (
                    <button className="consultor-btn-limpiar" onClick={limpiar} title="Nueva consulta">
                        <img src="/iconMasFblack.svg" alt="Limpiar" className="consultor-icono-limpiar" />
                        Nueva consulta
                    </button>
                )}
            </div>

            <div className="consultor-mensajes" ref={mensajesRef}>
                {mensajes.length === 0 && !cargando && (
                    <div className="consultor-vacio">
                        <img src="/consultor.svg" alt="" className="consultor-icono-vacio" />
                        <p>¿En qué puedo ayudarte hoy?</p>
                        <div className="consultor-sugerencias">
                            {SUGERENCIAS.map((s, i) => (
                                <button key={i} className="consultor-sugerencia" onClick={() => enviar(s)}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {mensajes.map((m, i) => (
                    <div key={i} className={`consultor-mensaje consultor-${m.rol}`}>
                        <span className="consultor-rol">
                            {m.rol === 'usuario' ? 'Tú' : 'Consultor'}
                        </span>
                        {m.rol === 'consultor'
                            ? <RespuestaTexto texto={m.texto} />
                            : <p>{m.texto}</p>
                        }
                    </div>
                ))}

                {cargando && (
                    <div className="consultor-mensaje consultor-consultor">
                        <span className="consultor-rol">Consultor</span>
                        <div className="consultor-cargando">
                            <span className="consultor-puntos">
                                <span /><span /><span />
                            </span>
                            Consultando datos...
                        </div>
                    </div>
                )}

                {error && (
                    <div className="consultor-error">
                        <img src="/advertencia.png" alt="Error" className="consultor-icono-error" />
                        <span>{error}</span>
                        <button className="consultor-btn-reintentar" onClick={() => enviar(mensajes[mensajes.length - 2]?.texto || '')}>
                            Reintentar
                        </button>
                    </div>
                )}
            </div>

            <div className="consultor-input-area">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
                    placeholder="¿Cuánto gasté en fumigaciones esta campaña?"
                    disabled={cargando}
                    maxLength={500}
                />
                <button
                    className="consultor-btn-enviar"
                    onClick={() => enviar()}
                    disabled={cargando || !input.trim()}
                >
                    Enviar
                </button>
            </div>
        </div>
    )
}

export default Consultor
