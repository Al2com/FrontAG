import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tareasService from '../services/tareas'
import BtnCrear from './buttons/BtnCrear.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx'
import BtnEliminar from './buttons/btnEliminar.jsx'
import './Style/cards.css';
import './Style/forms.css'

const Operaciones = () => {

  const [operaciones, setOperaciones] = useState([])
  const [fumigaciones, setFumigaciones] = useState([])
  const [errorCarga, setErrorCarga] = useState('')
  const navigate = useNavigate()
  const rol = sessionStorage.getItem('rol')

  useEffect(() => {
    tareasService.getLista()
      .then(data => {
        setOperaciones(data.operaciones)
        setFumigaciones(data.fumigaciones)
      })
      .catch(() => setErrorCarga('Error al cargar las operaciones'))
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
      .catch(() => setErrorCarga('Error al marcar como realizada'))
  }

  const marcarRevisada = (tipo, id) => {
    tareasService.marcarRevisada(tipo, id)
      .then(() => {
        tareasService.getLista()
          .then(data => {
            setOperaciones(data.operaciones)
            setFumigaciones(data.fumigaciones)
          })
      })
      .catch(() => setErrorCarga('Error al marcar como revisada'))
  }

  const eliminarOperacion = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta operación?')) {
      tareasService.borrarOperacion(id)
        .then(() => {
          setOperaciones(operaciones.filter(op => op.id !== id))
        })
        .catch(() => setErrorCarga('Error al eliminar la operación'))
    }
  }

  const eliminarFumigacion = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta fumigación?')) {
      tareasService.borrarFumigacion(id)
        .then(() => {
          setFumigaciones(fumigaciones.filter(fum => fum.id !== id))
        })
        .catch(() => setErrorCarga('Error al eliminar la fumigación'))
    }
  }

  return (
    <div>
      <div className="menuExplo">
        <div>
          <h2>Operaciones</h2>
          <p>Registra y gestiona las operaciones de campo</p>
        </div>
        <div className="menu-button">
          {rol !== 'trabajador' && (
            <BtnCrear
              to="/nueva-operacion"
              titulo="Nueva Operación"
              iconIng="./plusNegro.png"
              className="btn-nueva-explotacion"
            />
          )}
          {rol !== 'trabajador' && (
            <BtnCrear
              to="/nueva-fumigacion"
              titulo="Nueva Fumigación"
              iconIng="./plusNegro.png"
              className="btn-nueva-explotacion"
            />
          )}
        </div>
      </div>

      {errorCarga && <span className="mensaje-error">{errorCarga}</span>}

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
            <p><strong>Estado:</strong> {op.estado}</p>

            <div className="card-botones">
              {op.estado === 'pendiente' && (
                <button onClick={() => marcarRealizada('operacion', op.id)}>Realizada</button>
              )}
              {op.estado === 'realizada' && rol !== 'trabajador' && (
                <button onClick={() => marcarRevisada('operacion', op.id)}>Revisada</button>
              )}
              {rol !== 'trabajador' && (
                <BtnSubmit texto="Editar" to={`/operacion/${op.id}`} />
              )}
              {rol !== 'trabajador' && (
                <BtnEliminar texto="Eliminar" onClick={() => eliminarOperacion(op.id)} />
              )}
            </div>
          </div>
        ))
      )}

      <h2>Fumigaciones</h2>

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

            <div className="card-botones">
              {fum.estado === 'pendiente' && (
                <button onClick={() => marcarRealizada('fumigacion', fum.id)}>
                  Realizada
                </button>
              )}
              {fum.estado === 'realizada' && rol !== 'trabajador' && (
                <button onClick={() => marcarRevisada('fumigacion', fum.id)}>
                  Revisada
                </button>
              )}
              {rol !== 'trabajador' && (
                <BtnSubmit texto="Editar" to={`/editar-fumigacion/${fum.id}`} />
              )}
              {rol !== 'trabajador' && (
                <BtnEliminar texto="Eliminar" onClick={() => eliminarFumigacion(fum.id)} />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Operaciones