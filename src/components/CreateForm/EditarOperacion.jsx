import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import operacionesService from '../../services/operaciones'
import Modal from '../Modal/Modal.jsx'
import '../Style/forms.css'

const EditarOperacion = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    // modal de confirmacion para guardar cambios
    const [modalConfirm, setModalConfirm] = useState(false)

    const [formData, setFormData] = useState({
        parcela_id: "",
        operario: "",
        tipo_operacion: "",
        hora_inicio: "",
        duracion_minutos: "",
        precio: "",
        descripcion: "",
        estado: "",
    })

    // Carga los datos de la operacion al entrar
    useEffect(() => {
        operacionesService.getOperacion(id)
            .then(data => setFormData(data))
    }, [id])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // abre el modal al pulsar guardar
    const handleSubmit = (e) => {
        e.preventDefault()
        setModalConfirm(true)
    }

    // el usuario confirma y se llama al back
    const guardarCambios = () => {
        operacionesService.putActualizarOperacion(id, formData)
            .then(() => navigate('/operaciones'))
            .catch(err => {
                setModalConfirm(false)
                console.error('Error al actualizar:', err)
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

            <h1>Editar Operación</h1>
            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-grupo">
                    <label>Operario</label>
                    <input type="text" name="operario" value={formData.operario} onChange={handleChange} />
                </div>
                <div className="form-grupo">
                    <label>Tipo operación</label>
                    <select name="tipo_operacion" value={formData.tipo_operacion} onChange={handleChange}>
                        <option value="poda">Poda</option>
                        <option value="riego">Riego</option>
                        <option value="abonado">Abonado</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="tractor">Tractor</option>
                    </select>
                </div>
                <div className="form-grupo">
                    <label>Hora de inicio</label>
                    <input type="datetime-local" name="hora_inicio" value={formData.hora_inicio?.substring(0, 16)} onChange={handleChange} />
                </div>
                <div className="form-grupo">
                    <label>Duración (minutos)</label>
                    <input type="number" name="duracion_minutos" value={formData.duracion_minutos} onChange={handleChange} />
                </div>
                <div className="form-grupo">
                    <label>Precio (€)</label>
                    <input type="number" name="precio" value={formData.precio} onChange={handleChange} step="0.01" min="0" />
                </div>
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
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4" />
                </div>
                <div className="form-actions full-width">
                    <button type="submit">Guardar cambios</button>
                    <button type="button" onClick={() => navigate('/operaciones')}>Atrás</button>
                </div>
            </form>
        </div>
    )
}

export default EditarOperacion