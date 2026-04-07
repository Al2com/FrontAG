import { useEffect, useState } from 'react';
import operacionService from '../services/operaciones';
import fumigacionService from '../services/fumigaciones.js'
import BtnCrear from './buttons/BtnCrear.jsx';
import  '../components/Style/formStyles.css';

const Operaciones = () => {
  const [operaciones, setOperaciones] = useState([])
  const [fumigaciones, setFumigaciones] = useState([])
  

  useEffect(() => {
    operacionService.getLista()
      .then(data => setOperaciones(data.operaciones))
      .catch(err => console.error('Error cargando operaciones:', err))

    fumigacionService.getLista()
      .then(data => { setFumigaciones(data.fumigaciones)})
      .catch(err => console.error('Error cargando fumigaciones:', err))
      }, [])

  return (
    <div>
      <div className="menuExplo">
        <div>
          <h2>Operaciones</h2>
          <p>Registra y gestiona las operaciones de campo</p>
        </div>
        <div className="menu-buttons" >
          <BtnCrear
            to="/nueva-operacion"
            titulo="Nueva Operación"
            iconIng="./plusNegro.png"
            className="btn-nueva-explotacion"
          />
          <BtnCrear
            to="/nueva-fumigacion"
            titulo="Nueva Fumigación"
            iconIng="./plusNegro.png"
            className="btn-nueva-explotacion"
          />

          <BtnCrear
            to="/tareas"
            titulo="Tareas"
            iconIng="./operaciones.svg"
            className="btn-nueva-explotacion"
          />


        </div>
      </div>

      <div className="seccion-explo">
        {operaciones.length === 0 ? (
          <p>No hay operaciones registradas.</p>
        ) : (
          operaciones.map((op) => (
            <div key={op.id} className="explotacionCard">
              <h4><strong>Operación</strong></h4>
              <p><strong>Tipo:</strong> {op.tipo_operacion}</p>
              <p><strong>Parcela:</strong> {op.parcela_id}</p>
              <p><strong>Operario:</strong> {op.operario}</p>
              <p><strong>Inicio:</strong> {op.hora_inicio} min</p>
              <p><strong>Duración:</strong> {op.duracion_minutos} </p>
              <p><strong>Descripción:</strong> {op.descripcion}</p>
            </div>
          ))
        )}
      </div>

   

        <div className="seccion-explo">
        {fumigaciones.length === 0 ? (
          <p>No hay operaciones registradas.</p>
        ) : (

          fumigaciones.map((fum) => (
            <div key={fum.id} className="explotacionCard">
              <h4><strong>Fumigacion</strong></h4>
              <p><strong>Operacion:</strong> {fum.metodo_aplicacion}</p>
              <p><strong>Parcela:</strong> {fum.parcela_id}</p>
              <p><strong>Operario:</strong> {fum.operario}</p>
              <p><strong>Inicio:</strong> {fum.hora_inicio}</p>
              <p><strong>Duración:</strong> {fum.duracion_minutos} min</p>
              <p><strong>Descripción:</strong> {fum.descripcion}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Operaciones