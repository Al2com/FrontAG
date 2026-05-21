import { useEffect, useState } from 'react';
import tareasService from '../services/tareas'
import BtnCrear from './buttons/BtnCrear.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx'
import BtnEliminar from './buttons/btnEliminar.jsx'
import './Style/cards.css';
import './Style/forms.css'
import './Style/search.css'

const Operaciones = () => {

  const [operaciones, setOperaciones] = useState([])
  const [fumigaciones, setFumigaciones] = useState([])
  const [errorCarga, setErrorCarga] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [mesSeleccionado, setMesSeleccionado] = useState('todos')
  const [tipoSeleccionado, setTipoSeleccionado] = useState('todos')
  const [vistaTabla, setVistaTabla] = useState(false)
  const rol = sessionStorage.getItem('rol')

  useEffect(() => {
    tareasService.getLista()
      .then(data => {
        setOperaciones(data.operaciones)
        setFumigaciones(data.fumigaciones)
      })
      .catch(() => setErrorCarga('Error al cargar las operaciones'))
  }, [])

  const añosDisponibles = () => {
    const años = new Set()
    operaciones.forEach(op => años.add(parseInt(op.hora_inicio.substring(0, 4))))
    fumigaciones.forEach(fum => años.add(parseInt(fum.hora_inicio.substring(0, 4))))
    return Array.from(años).sort((a, b) => b - a)
  }

  const operacionesFiltradas = operaciones.filter(op => {
    const año = parseInt(op.hora_inicio.substring(0, 4))
    const mes = parseInt(op.hora_inicio.substring(5, 7))
    const añoOk = filtro === 'todas' || año === Number(filtro)
    const mesOk = mesSeleccionado === 'todos' || mes === Number(mesSeleccionado)
    const tipoOk = tipoSeleccionado === 'todos' || op.tipo_operacion === tipoSeleccionado
    return añoOk && mesOk && tipoOk
  })

  const fumigacionesFiltradas = fumigaciones.filter(fum => {
    const año = parseInt(fum.hora_inicio.substring(0, 4))
    const mes = parseInt(fum.hora_inicio.substring(5, 7))
    const añoOk = filtro === 'todas' || año === Number(filtro)
    const mesOk = mesSeleccionado === 'todos' || mes === Number(mesSeleccionado)
    return añoOk && mesOk
  })

  const marcarRealizada = (tipo, id) => {
    tareasService.marcarRealizada(tipo, id)
      .then(() => tareasService.getLista()
        .then(data => {
          setOperaciones(data.operaciones)
          setFumigaciones(data.fumigaciones)
        }))
      .catch(() => setErrorCarga('Error al marcar como realizada'))
  }

  const marcarRevisada = (tipo, id) => {
    tareasService.marcarRevisada(tipo, id)
      .then(() => tareasService.getLista()
        .then(data => {
          setOperaciones(data.operaciones)
          setFumigaciones(data.fumigaciones)
        }))
      .catch(() => setErrorCarga('Error al marcar como revisada'))
  }

  const eliminarOperacion = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta operación?')) {
      tareasService.borrarOperacion(id)
        .then(() => setOperaciones(operaciones.filter(op => op.id !== id)))
        .catch(() => setErrorCarga('Error al eliminar la operación'))
    }
  }

  const eliminarFumigacion = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta fumigación?')) {
      tareasService.borrarFumigacion(id)
        .then(() => setFumigaciones(fumigaciones.filter(fum => fum.id !== id)))
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

      <div className="filtro-explo">
        <div className="barra-select">
          <select
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value)
              setMesSeleccionado('todos')
            }}
          >
            <option value="todas">Campaña ▾</option>
            {añosDisponibles().map(año => (
              <option key={año} value={año}>{año}</option>
            ))}
          </select>
        </div>

        <div className="barra-select-lg">
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          >
            <option value="todos">Mes ▾</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>

        <div className="barra-select-lg">
          <select
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
          >
            <option value="todos">Tipo operación ▾</option>
            <option value="poda">Poda</option>
            <option value="riego">Riego</option>
            <option value="abonado">Abonado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="tractor">Tractor</option>
          </select>
        </div>

        <div className="barra-select">
          <select
            value={vistaTabla ? 'tabla' : 'tarjeta'}
            onChange={(e) => setVistaTabla(e.target.value === 'tabla')}
          >
            <option value="tarjeta">Tarjetas ▾</option>
            <option value="tabla">Tabla</option>
          </select>
        </div>
      </div>

      {vistaTabla ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Parcela</th>
              <th>Operario</th>
              <th>Fecha</th>
              <th>Duración</th>
              <th>Precio</th>
              <th>Estado</th>
              {rol !== 'trabajador' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {operacionesFiltradas.map(op => (
              <tr key={op.id}>
                <td>{op.tipo_operacion}</td>
                <td>{op.parcela?.poligono} - {op.parcela?.parcela}</td>
                <td>{op.operario}</td>
                <td>{op.hora_inicio}</td>
                <td>{op.duracion_minutos} min</td>
                <td>{op.precio} €</td>
                <td>{op.estado}</td>
                {rol !== 'trabajador' && (
                  <td>
                    <div className="tabla-botones">
                      <BtnSubmit texto="Editar" to={`/operacion/${op.id}`} />
                      <BtnEliminar texto="Eliminar" onClick={() => eliminarOperacion(op.id)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        operacionesFiltradas.map(op => (
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

      <h2 style={{ padding: '10px' }}>Fumigaciones</h2>

      {fumigacionesFiltradas.map(fum => (
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
              <button onClick={() => marcarRealizada('fumigacion', fum.id)}>Realizada</button>
            )}
            {fum.estado === 'realizada' && rol !== 'trabajador' && (
              <button onClick={() => marcarRevisada('fumigacion', fum.id)}>Revisada</button>
            )}
            {rol !== 'trabajador' && (
              <BtnSubmit texto="Editar" to={`/editar-fumigacion/${fum.id}`} />
            )}
            {rol !== 'trabajador' && (
              <BtnEliminar texto="Eliminar" onClick={() => eliminarFumigacion(fum.id)} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Operaciones