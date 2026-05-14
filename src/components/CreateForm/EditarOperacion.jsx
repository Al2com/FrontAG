import { useEffect,useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom"
import operacionesService from '../../services/operaciones'

const EditarOperacion = () => {

    const {id} = useParams();
    const navigate = useNavigate();

    const [FormData ,setFormData ] = useState ({
        id:"",	
        parcela_id:"",	
        usuario_id:"",
        operario :"",
        tipo_operacion:"",
        hora_inicio:"",
        duracion_minutos:"",
        descripcion	:"",
        estado	:"",

    })

   
        	
    useEffect(()=>{
        operacionesService.getOperacion(id)
        .then(data=>setFormData(data))
       
    }, [id])


     const handleChange =(e) =>{

        setFormData({ ...FormData, [e.target.name]: e.target.value });
    }

    const handleSubmit = (e) => {
        
    }

  
    return(
<div>
        <p>Datos de la operacion</p>

        <form onChange={handleSubmit}>
            <div>
                <label>Parcela_id</label>
                <input type="text" name="nombre" value={FormData.parcela_id} onChange={handleChange} />            </div>
            <div />
             <div>
                <label>Usuario_id</label>
                <input type="text" name="usuario" value={FormData.usuario_id} onChange={handleChange} />            </div>
            <div />
            <div>
                <label>Operario</label>
                <input type="text" name="operario" value={FormData.operario} onChange={handleChange} />            </div>
            <div />
            <div>
                <label>Hora de inicio</label>
                <input type="text" name="Hora_inicio" value={FormData.hora_inicio} onChange={handleChange} />            </div>
            <div />
            <div>
                <label>Duración</label>
                <input type="text" name="duracion" value={FormData.duracion_minutos} onChange={handleChange} />            </div>
            <div />
            <div>
                <label>Descripcion</label>
                <input type="text" name="descripcion" value={FormData.descripcion} onChange={handleChange} />            </div>
            <div />
            <div>
                <label>Estado</label>
                <input type="text" name="estado" value={FormData.estado} onChange={handleChange} />            </div>
            <div />
              <div className="menu-button">
                <button type="submit">Guardar Cambios</button>
                <button type="button" onClick = {() => navigate ('/operaciones')}>Atrás</button>
          </div>

        </form>
</div>

    )
}

export default EditarOperacion