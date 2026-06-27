import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import fumigacionesService from '../../services/fumigaciones'
import Modal from '../Modal/Modal.jsx'
import '../Style/forms.css'

const EditarFumigacion = () => {

    const { id } = useParams()
    const navigate = useNavigate()

    // modal de confirmacion para guardar cambios
    const [modalConfirm, setModalConfirm] = useState(false)
    const [errorCarga, setErrorCarga] = useState('')

    // Campos que el usuario ha modificado. Al editar solo validamos estos,
    // así un dato cargado de la BD que no se toca no bloquea el guardado
    // (p.ej. en tractor el precio llega como null y antes rompía la edición).
    const [camposTocados, setCamposTocados] = useState({})

    const [formData, setFormData] = useState({
        parcela_id: "",
        usuario_id: "",
        operario: "",
        metodo_aplicacion: "",
        hora_inicio: "",
        duracion_minutos: "",
        mochilas: "",
        turbos: "",
        litros_agua: "",
        precio: "",        // precio total (solo mochila)
        precio_turbo: "",  // precio por turbo (solo tractor): es el coste real del tractor
        descripcion: "",
        estado: "",
    })

    const [errors, setErrors] = useState({
        operario: "",
        hora_inicio: "",
        duracion_minutos: "",
        mochilas: "",
        turbos: "",
        precio: "",
        descripcion: "",
    })

    const regexEntero = /^[0-9]{1,4}$/
    const regexPrecio = /^\d+(\.\d{1,2})?$/
    const regexDescripcion = /^[\s\S]{10,}$/ // [\s\S] para admitir saltos de línea en la descripción

    // Cargamos los datos de la fumigacion al entrar
    useEffect(() => {
        fumigacionesService.getFumigacion(id)
            .then(data => setFormData(data))
            .catch(() => setErrorCarga('No se pudieron cargar los datos de la fumigación'))
    }, [id])

    const validarCampos = (name, value) => {
        let mensaje = ''
        let comprobar = true

        if (name === 'hora_inicio' && value === '') {
            mensaje = 'La fecha y hora son obligatorias'
            comprobar = false
        }
        // el precio total solo aplica a mochila; en tractor el coste sale de precio_turbo
        if (name === 'precio' && formData.metodo_aplicacion === 'mochila' && !regexPrecio.test(value)) {
            mensaje = 'Introduce un precio válido (ej: 12.50)'
            comprobar = false
        }
        if (name === 'precio_turbo' && formData.metodo_aplicacion === 'tractor' && !regexPrecio.test(value)) {
            mensaje = 'Introduce un precio por turbo válido (ej: 12.50)'
            comprobar = false
        }
        if (name === 'descripcion' && !regexDescripcion.test(value)) {
            mensaje = 'Mínimo 10 caracteres'
            comprobar = false
        }
        if (name === 'operario' && value === '') {
            mensaje = 'El operario es obligatorio'
            comprobar = false
        }
        if (name === 'duracion_minutos' && !regexEntero.test(value)) {
            mensaje = 'Debe ser un número (máx. 4 cifras)'
            comprobar = false
        }
        // mochilas y turbos admiten fracciones (ej: 0.5 media mochila/turbo)
        if ((name === 'mochilas' || name === 'turbos') && !/^\d+(\.\d{1,2})?$/.test(value)) {
            mensaje = 'Debe ser un número (admite decimales, ej: 0.5)'
            comprobar = false
        }

        setErrors(prev => ({ ...prev, [name]: mensaje }))
        return comprobar
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        setCamposTocados(prev => ({ ...prev, [name]: true })) // marcamos el campo como editado
        validarCampos(name, value)
    }

    // valida solo los campos tocados al pulsar guardar
    const handleSubmit = (e) => {
        e.preventDefault()

        // map en vez de every para que se muestren todos los errores a la vez
        const resultados = Object.keys(camposTocados).map(campo => validarCampos(campo, formData[campo]))

        if (resultados.every(Boolean)) {
            setModalConfirm(true)
        }
    }

    // el usuario confirma y se llama al back
    const guardarCambios = () => {
        fumigacionesService.putActualizarFumigacion(id, formData)
            .then(() => navigate('/operaciones'))
            .catch(err => {
                setModalConfirm(false)
                if (err.response?.status === 422) {
                    const erroresLaravel = err.response.data.errors
                    const nuevosErrores = {}
                    for (const campo in erroresLaravel) {
                        nuevosErrores[campo] = erroresLaravel[campo][0]
                    }
                    setErrors(prev => ({ ...prev, ...nuevosErrores }))
                } else {
                    setErrorCarga('Error del servidor al guardar. Inténtalo de nuevo.')
                }
            })
    }

    return (
        <div className="form-container">

            {/* modal de confirmacion para guardar cambios */}
            {modalConfirm && (
                <Modal
                    mesajeError="¿Estás seguro de guardar los cambios?"
                    cerrarModal={() => setModalConfirm(false)}
                    onConfirmar={guardarCambios}
                />
            )}

            <h1>Editar Fumigación</h1>

            {errorCarga && <span className="mensaje-error">{errorCarga}</span>}

            <form onSubmit={handleSubmit} className="form-grid">

                <div className="form-grupo">
                    <label>Parcela ID</label>
                    <input type="text" name="parcela_id" value={formData.parcela_id} onChange={handleChange} />
                </div>

                <div className="form-grupo">
                    <label>Método aplicación</label>
                    <select name="metodo_aplicacion" value={formData.metodo_aplicacion} onChange={handleChange}>
                        <option value="tractor">Tractor</option>
                        <option value="mochila">Mochila</option>
                    </select>
                </div>

                {/* Solo aparece si es mochila */}
                {formData.metodo_aplicacion === 'mochila' && (
                    <div className="form-grupo">
                        <label>Operario</label>
                        <input type="text" name="operario" value={formData.operario} onChange={handleChange} className={errors.operario ? 'input-error' : ''} />
                        {errors.operario && <span className="mensaje-error">{errors.operario}</span>}
                    </div>
                )}

                {formData.metodo_aplicacion === 'mochila' && (
                    <div className="form-grupo">
                        <label>Duración (minutos)</label>
                        <input type="number" name="duracion_minutos" value={formData.duracion_minutos} onChange={handleChange} className={errors.duracion_minutos ? 'input-error' : ''} />
                        {errors.duracion_minutos && <span className="mensaje-error">{errors.duracion_minutos}</span>}
                    </div>
                )}

                {formData.metodo_aplicacion === 'mochila' && (
                    <div className="form-grupo">
                        <label>Mochilas</label>
                        <input type="number" name="mochilas" value={formData.mochilas} onChange={handleChange} step="0.01" min="0.01" className={errors.mochilas ? 'input-error' : ''} />
                        {errors.mochilas && <span className="mensaje-error">{errors.mochilas}</span>}
                    </div>
                )}

                {/* Solo aparece si es tractor */}
                {formData.metodo_aplicacion === 'tractor' && (
                    <div className="form-grupo">
                        <label>Turbos</label>
                        <input type="number" name="turbos" value={formData.turbos} onChange={handleChange} step="0.01" min="0.01" className={errors.turbos ? 'input-error' : ''} />
                        {errors.turbos && <span className="mensaje-error">{errors.turbos}</span>}
                    </div>
                )}

                {formData.metodo_aplicacion === 'mochila' && (
                    <div className="form-grupo">
                        <label>Litros de agua por mochila</label>
                        <input type="number" name="litros_agua" value={formData.litros_agua ?? ''} onChange={handleChange} step="0.1" min="0" />
                    </div>
                )}

                <div className="form-grupo">
                    <label>Hora de inicio</label>
                    <input type="datetime-local" name="hora_inicio" value={formData.hora_inicio?.substring(0, 16)} onChange={handleChange} className={errors.hora_inicio ? 'input-error' : ''} />
                    {errors.hora_inicio && <span className="mensaje-error">{errors.hora_inicio}</span>}
                </div>

                {/* mochila: precio total. tractor: precio por turbo (coste real del tractor) */}
                {formData.metodo_aplicacion === 'mochila' && (
                    <div className="form-grupo">
                        <label>Precio total (€)</label>
                        <input type="number" name="precio" value={formData.precio ?? ''} onChange={handleChange} step="0.01" min="0" className={errors.precio ? 'input-error' : ''} />
                        {errors.precio && <span className="mensaje-error">{errors.precio}</span>}
                    </div>
                )}

                {formData.metodo_aplicacion === 'tractor' && (
                    <div className="form-grupo">
                        <label>Precio por turbo (€)</label>
                        <input type="number" name="precio_turbo" value={formData.precio_turbo ?? ''} onChange={handleChange} step="0.01" min="0" className={errors.precio_turbo ? 'input-error' : ''} />
                        {errors.precio_turbo && <span className="mensaje-error">{errors.precio_turbo}</span>}
                    </div>
                )}

                <div className="form-grupo">
                    <label>Estado</label>
                    <select name="estado" value={formData.estado} onChange={handleChange}>
                        <option value="pendiente">Pendiente</option>
                        <option value="realizada">Realizada</option>
                        <option value="revisada">Revisada</option>
                    </select>
                </div>

                <div className="form-grupo full-width">
                    <label>Descripción</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4" className={errors.descripcion ? 'input-error' : ''} />
                    {errors.descripcion && <span className="mensaje-error">{errors.descripcion}</span>}
                </div>

                <div className="form-actions full-width">
                    <button type="submit">Guardar cambios</button>
                    <button type="button" onClick={() => navigate('/operaciones')}>Atrás</button>
                </div>

            </form>
        </div>
    )
}

export default EditarFumigacion
