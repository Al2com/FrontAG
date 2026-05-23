import { useEffect, useState } from 'react';
import tareasService from '../services/tareas'
import BtnCrear from './buttons/BtnCrear.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx'
import BtnEliminar from './buttons/btnEliminar.jsx'
import './Style/cards.css';
import './Style/forms.css'
import './Style/search.css'

const Operaciones = () => {

  // listas que vienen del back
  const [listaOperaciones, setListaOperaciones] = useState([])
  const [listaFumigaciones, setListaFumigaciones] = useState([])
  const [errorCarga, setErrorCarga] = useState('')

  // filtros de operaciones
  const [campañaSeleccionada, setCampañaSeleccionada] = useState('todas')
  const [mesSeleccionado, setMesSeleccionado] = useState('todos')
  const [tipoSeleccionado, setTipoSeleccionado] = useState('todos')

  // filtros de fumigaciones por separado
  const [campañaFumigacion, setCampañaFumigacion] = useState('todas')
  const [mesFumigacion, setMesFumigacion] = useState('todos')

  // para cambiar entre tabla y tarjetas
  const [mostrarTabla, setMostrarTabla] = useState(false)

  const rol = sessionStorage.getItem('rol')

  // cargo los datos al entrar a la pagina
  useEffect(() => {
    tareasService.getLista()
      .then(datos => {
        setListaOperaciones(datos.operaciones)
        setListaFumigaciones(datos.fumigaciones)
      })
      .catch(() => setErrorCarga('Error al cargar las operaciones'))
  }, [])

  // saco los años que hay en operaciones y fumigaciones para el select de campaña
  const obtenerAñosDisponibles = () => {
    const años = new Set()
    listaOperaciones.forEach(op => años.add(parseInt(op.hora_inicio.substring(0, 4))))
    listaFumigaciones.forEach(fum => años.add(parseInt(fum.hora_inicio.substring(0, 4))))
    return Array.from(años).sort((a, b) => b - a)
  }

  // filtro operaciones segun campaña, mes y tipo
  const operacionesFiltradas = listaOperaciones.filter(operacion => {
    const año = parseInt(operacion.hora_inicio.substring(0, 4))
    const mes = parseInt(operacion.hora_inicio.substring(5, 7))
    const coincideAño = campañaSeleccionada === 'todas' || año === Number(campañaSeleccionada)
    const coincideMes = mesSeleccionado === 'todos' || mes === Number(mesSeleccionado)
    const coincideTipo = tipoSeleccionado === 'todos' || operacion.tipo_operacion === tipoSeleccionado
    return coincideAño && coincideMes && coincideTipo
  })

  // filtro fumigaciones con sus propios filtros, independiente de operaciones
  const fumigacionesFiltradas = listaFumigaciones.filter(fumigacion => {
    const año = parseInt(fumigacion.hora_inicio.substring(0, 4))
    const mes = parseInt(fumigacion.hora_inicio.substring(5, 7))
    const coincideAño = campañaFumigacion === 'todas' || año === Number(campañaFumigacion)
    const coincideMes = mesFumigacion === 'todos' || mes === Number(mesFumigacion)
    return coincideAño && coincideMes
  })

  // marco la operacion o fumigacion como realizada
  const marcarRealizada = (tipo, id) => {
    tareasService.marcarRealizada(tipo, id)
      .then(() => tareasService.getLista()
        .then(datos => {
          setListaOperaciones(datos.operaciones)
          setListaFumigaciones(datos.fumigaciones)
        }))
      .catch(() => setErrorCarga('Error al marcar como realizada'))
  }

  // marco como revisada, solo el admin lo puede hacer esto
  const marcarRevisada = (tipo, id) => {
    tareasService.marcarRevisada(tipo, id)
      .then(() => tareasService.getLista()
        .then(datos => {
          setListaOperaciones(datos.operaciones)
          setListaFumigaciones(datos.fumigaciones)
        }))
      .catch(() => setErrorCarga('Error al marcar como revisada'))
  }

  //  si confirma el usuario elimino operacion
  const eliminarOperacion = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta operación?')) {
      tareasService.borrarOperacion(id)
        .then(() => setListaOperaciones(listaOperaciones.filter(op => op.id !== id)))
        .catch(() => setErrorCarga('Error al eliminar la operación'))
    }
  }

  //  si confirma el usuario elimino fumigacion
  const eliminarFumigacion = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta fumigación?')) {
      tareasService.borrarFumigacion(id)
        .then(() => setListaFumigaciones(listaFumigaciones.filter(fum => fum.id !== id)))
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
            <BtnCrear to="/nueva-operacion" titulo="Nueva Operación" iconIng="./plusNegro.png" />
          )}
          {rol !== 'trabajador' && (
            <BtnCrear to="/nueva-fumigacion" titulo="Nueva Fumigación" iconIng="./plusNegro.png" />
          )}
          <div className="separador-btn"></div>
          <button
            className={`btn-vista ${mostrarTabla ? 'activo' : ''}`}
            onClick={() => setMostrarTabla(!mostrarTabla)}
          >
            <img src={mostrarTabla ? './iconTable.png' : './cuadrado.png'} alt="vista" />
            {mostrarTabla ? 'Tarjetas' : 'Tabla'}
          </button>
        </div>
      </div>

      {errorCarga && <span className="mensaje-error">{errorCarga}</span>}

      {/* filtros de operaciones */}
      <div className="filtro-explo">
        <div className="barra-select">
          <select value={campañaSeleccionada} onChange={(e) => {
            setCampañaSeleccionada(e.target.value)
            setMesSeleccionado('todos')
          }}>
            <option value="todas">Campaña ▾</option>
            {obtenerAñosDisponibles().map(año => (
              <option key={año} value={año}>{año}</option>
            ))}
          </select>
        </div>

        <div className="barra-select-lg">
          <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)}>
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
          <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
            <option value="todos">Tipo operación ▾</option>
            <option value="poda">Poda</option>
            <option value="riego">Riego</option>
            <option value="abonado">Abonado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="tractor">Tractor</option>
          </select>
        </div>

       
      </div>

      <h2 style={{ padding: '10px' }}>Operaciones</h2>

      {mostrarTabla ? (
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
            {operacionesFiltradas.map(operacion => (
              <tr key={operacion.id}>
                <td>{operacion.tipo_operacion}</td>
                <td>{operacion.parcela?.poligono} - {operacion.parcela?.parcela}</td>
                <td>{operacion.operario}</td>
                <td>{operacion.hora_inicio}</td>
                <td>{operacion.duracion_minutos} min</td>
                <td>{operacion.precio} €</td>
                <td>{operacion.estado}</td>
                {rol !== 'trabajador' && (
                  <td>
                    <div className="tabla-botones">
                      <BtnSubmit texto="Editar" to={`/operacion/${operacion.id}`} />
                      <BtnEliminar texto="Eliminar" onClick={() => eliminarOperacion(operacion.id)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        operacionesFiltradas.map(operacion => (
          <div key={operacion.id} className="explotacionCard">
            <h4><strong>Operación</strong></h4>
            <p><strong>Tipo:</strong> {operacion.tipo_operacion}</p>
            <p><strong>Parcela:</strong> {operacion.parcela?.poligono} - {operacion.parcela?.parcela}</p>
            <p><strong>Operario:</strong> {operacion.operario}</p>
            <p><strong>Inicio:</strong> {operacion.hora_inicio}</p>
            <p><strong>Duración:</strong> {operacion.duracion_minutos} min</p>
            <p><strong>Descripción:</strong> {operacion.descripcion}</p>
            <p><strong>Estado:</strong> {operacion.estado}</p>
            <div className="card-botones">
              {operacion.estado === 'pendiente' && (
                <button onClick={() => marcarRealizada('operacion', operacion.id)}>Realizada</button>
              )}
              {operacion.estado === 'realizada' && rol !== 'trabajador' && (
                <button onClick={() => marcarRevisada('operacion', operacion.id)}>Revisada</button>
              )}
              {rol !== 'trabajador' && (
                <BtnSubmit texto="Editar" to={`/operacion/${operacion.id}`} />
              )}
              {rol !== 'trabajador' && (
                <BtnEliminar texto="Eliminar" onClick={() => eliminarOperacion(operacion.id)} />
              )}
            </div>
          </div>
        ))
      )}

      {/* filtros propios de fumigaciones, no afectan a operaciones */}
      <div className="filtro-explo">
        <div className="barra-select">
          <select value={campañaFumigacion} onChange={(e) => {
            setCampañaFumigacion(e.target.value)
            setMesFumigacion('todos')
          }}>
            <option value="todas">Campaña ▾</option>
            {obtenerAñosDisponibles().map(año => (
              <option key={año} value={año}>{año}</option>
            ))}
          </select>
        </div>

        <div className="barra-select-lg">
          <select value={mesFumigacion} onChange={(e) => setMesFumigacion(e.target.value)}>
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
      </div>

      <h2 style={{ padding: '10px' }}>Fumigaciones</h2>

      {mostrarTabla ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Método</th>
              <th>Parcela</th>
              <th>Operario</th>
              <th>Fecha</th>
              <th>Duración</th>
              <th>Estado</th>
              {rol !== 'trabajador' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {fumigacionesFiltradas.map(fumigacion => (
              <tr key={fumigacion.id}>
                <td>{fumigacion.metodo_aplicacion}</td>
                <td>{fumigacion.parcela?.poligono} - {fumigacion.parcela?.parcela}</td>
                <td>{fumigacion.operario}</td>
                <td>{fumigacion.hora_inicio}</td>
                <td>{fumigacion.duracion_minutos} min</td>
                <td>{fumigacion.estado}</td>
                {rol !== 'trabajador' && (
                  <td>
                    <div className="tabla-botones">
                      <BtnSubmit texto="Editar" to={`/editar-fumigacion/${fumigacion.id}`} />
                      <BtnEliminar texto="Eliminar" onClick={() => eliminarFumigacion(fumigacion.id)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        fumigacionesFiltradas.map(fumigacion => (
          <div key={fumigacion.id} className="explotacionCard">
            <h4><strong>Fumigación</strong></h4>
            <p><strong>Método:</strong> {fumigacion.metodo_aplicacion}</p>
            <p><strong>Parcela:</strong> {fumigacion.parcela?.poligono} - {fumigacion.parcela?.parcela}</p>
            <p><strong>Operario:</strong> {fumigacion.operario}</p>
            <p><strong>Inicio:</strong> {fumigacion.hora_inicio}</p>
            <p><strong>Duración:</strong> {fumigacion.duracion_minutos} min</p>
            <p><strong>Descripción:</strong> {fumigacion.descripcion}</p>
            <p><strong>Estado:</strong> {fumigacion.estado}</p>
            <div className="card-botones">
              {fumigacion.estado === 'pendiente' && (
                <button onClick={() => marcarRealizada('fumigacion', fumigacion.id)}>Realizada</button>
              )}
              {fumigacion.estado === 'realizada' && rol !== 'trabajador' && (
                <button onClick={() => marcarRevisada('fumigacion', fumigacion.id)}>Revisada</button>
              )}
              {rol !== 'trabajador' && (
                <BtnSubmit texto="Editar" to={`/editar-fumigacion/${fumigacion.id}`} />
              )}
              {rol !== 'trabajador' && (
                <BtnEliminar texto="Eliminar" onClick={() => eliminarFumigacion(fumigacion.id)} />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Operaciones