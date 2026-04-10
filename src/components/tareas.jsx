import { useEffect, useState } from "react";
import tareasService from '../services/tareas'
import  '../components/Style/formStyles.css';


const tareas = () => {

    const [operaciones, setOperaciones] = useState([])
    const [fumigaciones, setFumigaciones] = useState([])

    useEffect(() => {
        tareasService.getLista()
            .then(data => {console.log('data:', data)
                            setOperaciones(data.operaciones)
                            setFumigaciones(data.fumigaciones)

            })
    }, [])



    const marcarRealizada = (tipo, id) => {
        tareasService.marcarRealizada(tipo, id)
            .then(() => {
                tareasService.getLista()
                    .then(data => {
                        setOperaciones(data.operaciones)
                        setFumigaciones(data.fumigaciones)
                    })
        
            })
}

    const marcarRevisada = (tipo, id) => {
        tareasService.marcarRevisada(tipo, id)
            .then(() => {
                // recargar la lista
            })
}

const rol = sessionStorage.getItem('rol')
   return(
    <div>
        <h2>Operaciones</h2>
        <div className="seccion-explo">
            {operaciones.length === 0 ? (
                <p>No hay operaciones registradas.</p>
            ) : (
                operaciones.map((op) => (
                    <div key={op.id} className="explotacionCard">
                        <h4><strong>Operación</strong></h4>
                        <p><strong>Tipo:</strong> {op.tipo_operacion}</p>
                        <p><strong>Parcela:</strong> {op.parcela?.poligono} - {op.parcela?.parcela}</p>
                        <p><strong>Operario:</strong> {op.operario}</p>
                        <p><strong>Inicio:</strong> {op.hora_inicio}</p>
                        <p><strong>Duración:</strong> {op.duracion_minutos} min</p>
                        <p><strong>Descripción:</strong> {op.descripcion}</p>
                        <p ><strong>Estado:</strong> {op.estado}</p>

                         {op.estado === 'pendiente' && (
                            <button onClick={() => marcarRealizada('operacion', op.id)}>
                                Marcar como realizada
                            </button>
                        )}

                        {op.estado === 'realizada' && rol !== 'trabajador' && (
                            <button onClick={() => marcarRevisada('operacion', op.id)}>
                                Marcar como revisada
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>

        <h2>Fumigaciones</h2>
        <div className="seccion-explo">
            {fumigaciones.length === 0 ? (
                <p>No hay fumigaciones registradas.</p>
            ) : (
                fumigaciones.map((fum) => (
                    <div key={fum.id} className="explotacionCard">
                        <h4><strong>Fumigación</strong></h4>
                        <p><strong>Método:</strong> {fum.metodo_aplicacion}</p>
                        <p><strong>Parcela:</strong> {fum.parcela?.poligono} - {fum.parcela?.parcela}</p>
                        <p><strong>Operario:</strong> {fum.operario}</p>
                        <p><strong>Inicio:</strong> {fum.hora_inicio}</p>
                        <p><strong>Duración:</strong> {fum.duracion_minutos} min</p>
                        <p><strong>Descripción:</strong> {fum.descripcion}</p>
                        <p><strong>Estado:</strong> {fum.estado}</p>

                        {fum.estado === 'pendiente' && (
                            <button onClick={() => marcarRealizada('fumigacion', fum.id)}>
                                Marcar como realizada
                            </button>
                        )}

                        {fum.estado === 'realizada' && rol !== 'trabajador' && (
                            <button onClick={() => marcarRevisada('fumigacion', fum.id)}>
                                Marcar como revisada
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    </div>
)

}

export default tareas