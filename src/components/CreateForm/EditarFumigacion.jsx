import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import fumigacionesService from '../../services/fumigaciones'

const EditarFumigacion = () => {

    const { id } = useParams()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        parcela_id: "",
        usuario_id: "",
        operario: "",
        metodo_aplicacion: "",
        hora_inicio: "",
        duracion_minutos: "",
        mochilas: "",
        turbos: "",
        precio: "",
        descripcion: "",
        estado: "",
    })

    // Cargamos los datos de la fumigacion al entrar
    useEffect(() => {
        fumigacionesService.getFumigacion(id)
            .then(data => setFormData(data))
    }, [id])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        fumigacionesService.putActualizarFumigacion(id, formData)
            .then(() => navigate('/operaciones'))
            .catch(err => console.error('Error al actualizar:', err))
    }

    return (
        <div className="form-container">
            <h1>Editar Fumigación</h1>
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
                        <input type="text" name="operario" value={formData.operario} onChange={handleChange} />
                    </div>
                )}

                {formData.metodo_aplicacion === 'mochila' && (
                    <div className="form-grupo">
                        <label>Duración (minutos)</label>
                        <input type="number" name="duracion_minutos" value={formData.duracion_minutos} onChange={handleChange} />
                    </div>
                )}

                {formData.metodo_aplicacion === 'mochila' && (
                    <div className="form-grupo">
                        <label>Mochilas</label>
                        <input type="number" name="mochilas" value={formData.mochilas} onChange={handleChange} />
                    </div>
                )}

                {/* Solo aparece si es tractor */}
                {formData.metodo_aplicacion === 'tractor' && (
                    <div className="form-grupo">
                        <label>Turbos</label>
                        <input type="number" name="turbos" value={formData.turbos} onChange={handleChange} />
                    </div>
                )}

                <div className="form-grupo">
                    <label>Hora de inicio</label>
                    <input type="datetime-local" name="hora_inicio" value={formData.hora_inicio?.substring(0, 16)} onChange={handleChange} />
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

export default EditarFumigacion