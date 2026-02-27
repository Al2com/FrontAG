import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import operacionService from '../services/operaciones';
import BtnCrear from './buttons/BtnCrear.jsx';

const Operaciones = () => {
  const navigate = useNavigate()
  const [operaciones, setOperaciones] = useState([])

  useEffect(() => {
    operacionService.getLista()
      .then(data => setOperaciones(data))
      .catch(err => console.error('Error cargando operaciones:', err))
  }, [])

  return (
    <div>
      <div className="menuExplo">
        <div>
          <h2>Operaciones</h2>
          <p>Registra y gestiona las operaciones de campo</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
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
        </div>
      </div>

      <div className="seccion-explo">
        {operaciones.length === 0 ? (
          <p>No hay operaciones registradas.</p>
        ) : (
          operaciones.map((op) => (
            <div key={op.id} className="explotacionCard">
              <p><strong>Tipo:</strong> {op.tipo_operacion}</p>
              <p><strong>Parcela:</strong> {op.parcela_id}</p>
              <p><strong>Inicio:</strong> {op.hora_inicio}</p>
              <p><strong>Duración:</strong> {op.duracion_minutos} min</p>
              <p><strong>Descripción:</strong> {op.descripcion}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Operaciones