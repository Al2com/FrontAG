import { useEffect, useState } from 'react';
import tareasService from '../services/tareas'
import BtnCrear from './buttons/BtnCrear.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx'
import BtnEliminar from './buttons/btnEliminar.jsx'
import Modal from './Modal/Modal.jsx'
import SeccionColapsable from './SeccionColapsable.jsx'
import './Style/cards.css';
import './Style/forms.css'
import './Style/search.css'

// claves de localStorage: estado de las secciones (cerradas la primera vez)
// y preferencia de vista tabla/cards (sin preferencia -> se decide por dispositivo)
const CLAVE_SECCION_OPERACIONES = 'operaciones_seccion_operaciones_abierta'
const CLAVE_SECCION_FUMIGACIONES = 'operaciones_seccion_fumigaciones_abierta'
const CLAVE_VISTA_TABLA = 'operaciones_vista_tabla'

const leerSeccionAbierta = (clave) => localStorage.getItem(clave) === 'true'

// primera visita (nada guardado): tabla en escritorio, cards en móvil.
// Si ya hay preferencia guardada, esa manda siempre, sin importar el dispositivo.
const vistaTablaInicial = () => {
  const guardada = localStorage.getItem(CLAVE_VISTA_TABLA)
  if (guardada !== null) return guardada === 'true'
  return !window.matchMedia('(max-width: 768px)').matches
}

const Operaciones = () => {

  const [listaOperaciones, setListaOperaciones] = useState([])
  const [listaFumigaciones, setListaFumigaciones] = useState([])
  const [errorCarga, setErrorCarga] = useState('')
  // guardo el id y tipo de lo que se quiere borrar, si es null no sale el modal
  const [confirmar, setConfirmar] = useState(null)

  const [campañaSeleccionada, setCampañaSeleccionada] = useState('todas')
  const [mesSeleccionado, setMesSeleccionado] = useState('todos')
  const [tipoSeleccionado, setTipoSeleccionado] = useState('todos')
  const [campañaFumigacion, setCampañaFumigacion] = useState('todas')
  const [mesFumigacion, setMesFumigacion] = useState('todos')
  const [mostrarTabla, setMostrarTabla] = useState(vistaTablaInicial)

  // acordeón: cerradas por defecto la primera vez, luego recuerdan su estado
  const [seccionOperacionesAbierta, setSeccionOperacionesAbierta] = useState(() => leerSeccionAbierta(CLAVE_SECCION_OPERACIONES))
  const [seccionFumigacionesAbierta, setSeccionFumigacionesAbierta] = useState(() => leerSeccionAbierta(CLAVE_SECCION_FUMIGACIONES))

  // filtros nuevos: parcela en operaciones; variedad y parcela en fumigaciones
  const [parcelaOperacion, setParcelaOperacion] = useState('todas')
  const [variedadFumigacion, setVariedadFumigacion] = useState('todas')
  const [parcelaFumigacion, setParcelaFumigacion] = useState('todas')
  // filtro por método de aplicación: tractor o mochila (campo metodo_aplicacion)
  const [metodoFumigacion, setMetodoFumigacion] = useState('todas')

  const rol = sessionStorage.getItem('rol')

  // cargo los datos cuando se monta el compoenente
  useEffect(() => {
    tareasService.getLista()
      .then(datos => {
        setListaOperaciones(datos.operaciones)
        setListaFumigaciones(datos.fumigaciones)
      })
      .catch(() => setErrorCarga('Error al cargar las operaciones'))
  }, [])

  // saco los años de operaciones y fumigaciones para el select de campaña
  const obtenerAñosDisponibles = () => {
    const años = new Set()
    listaOperaciones.forEach(op => años.add(parseInt(op.hora_inicio.substring(0, 4))))
    listaFumigaciones.forEach(fum => años.add(parseInt(fum.hora_inicio.substring(0, 4))))
    return Array.from(años).sort((a, b) => b - a)
  }

  // formato de parcela tal como ya se muestra en pantalla: "polígono - parcela"
  const formatoParcela = (p) => p ? `${p.poligono} - ${p.parcela}` : ''

  // valores distintos para los nuevos selectores, a partir de los datos ya cargados
  // (mismo patrón que obtenerAñosDisponibles)
  const obtenerParcelas = (lista) =>
    Array.from(new Set(lista.map(item => formatoParcela(item.parcela)).filter(Boolean))).sort()

  const obtenerVariedades = (lista) =>
    Array.from(new Set(lista.map(item => item.parcela?.variedad).filter(Boolean))).sort()

  // filtro las operaciones segun la campaña el mes y el tipo
  const operacionesFiltradas = listaOperaciones.filter(operacion => {
    const año = parseInt(operacion.hora_inicio.substring(0, 4))
    const mes = parseInt(operacion.hora_inicio.substring(5, 7))
    const coincideAño = campañaSeleccionada === 'todas' || año === Number(campañaSeleccionada)
    const coincideMes = mesSeleccionado === 'todos' || mes === Number(mesSeleccionado)
    const coincideTipo = tipoSeleccionado === 'todos' || operacion.tipo_operacion === tipoSeleccionado
    const coincideParcela = parcelaOperacion === 'todas' || formatoParcela(operacion.parcela) === parcelaOperacion
    return coincideAño && coincideMes && coincideTipo && coincideParcela
  })

  // filtro fumigaciones con sus propios filtros, no afectan a las operaciones
  const fumigacionesFiltradas = listaFumigaciones.filter(fumigacion => {
    const año = parseInt(fumigacion.hora_inicio.substring(0, 4))
    const mes = parseInt(fumigacion.hora_inicio.substring(5, 7))
    const coincideAño = campañaFumigacion === 'todas' || año === Number(campañaFumigacion)
    const coincideMes = mesFumigacion === 'todos' || mes === Number(mesFumigacion)
    const coincideVariedad = variedadFumigacion === 'todas' || fumigacion.parcela?.variedad === variedadFumigacion
    const coincideParcela = parcelaFumigacion === 'todas' || formatoParcela(fumigacion.parcela) === parcelaFumigacion
    const coincideMetodo = metodoFumigacion === 'todas' || fumigacion.metodo_aplicacion === metodoFumigacion
    return coincideAño && coincideMes && coincideVariedad && coincideParcela && coincideMetodo
  })

  // marco la operacion o fumigacion como realizada y recargo la lista
  const marcarRealizada = (tipo, id) => {
    tareasService.marcarRealizada(tipo, id)
      .then(() => tareasService.getLista()
        .then(datos => {
          setListaOperaciones(datos.operaciones)
          setListaFumigaciones(datos.fumigaciones)
        }))
      .catch(() => setErrorCarga('Error al marcar como realizada'))
  }

  // marco como revisada, esto solo lo puede acer el admin
  const marcarRevisada = (tipo, id) => {
    tareasService.marcarRevisada(tipo, id)
      .then(() => tareasService.getLista()
        .then(datos => {
          setListaOperaciones(datos.operaciones)
          setListaFumigaciones(datos.fumigaciones)
        }))
      .catch(() => setErrorCarga('Error al marcar como revisada'))
  }

  // guardo en el estado el id y tipo para que salga el modal de confirmacion
  const pedirConfirmacion = (tipo, id) => {
    setConfirmar({ tipo, id })
  }

  // si confirma borro segun el tipo, si cancela cierro el modal sin acer nada
  const confirmarEliminar = () => {
    if (!confirmar) return
    const { tipo, id } = confirmar
    setConfirmar(null)

    if (tipo === 'operacion') {
      tareasService.borrarOperacion(id)
        .then(() => setListaOperaciones(listaOperaciones.filter(op => op.id !== id)))
        .catch(() => setErrorCarga('Error al eliminar la operación'))
    } else {
      // si no es operacion es fumigacion
      tareasService.borrarFumigacion(id)
        .then(() => setListaFumigaciones(listaFumigaciones.filter(fum => fum.id !== id)))
        .catch(() => setErrorCarga('Error al eliminar la fumigación'))
    }
  }

  // el toggle de vista es una elección explícita del usuario: a partir de aquí
  // manda siempre sobre la detección automática por dispositivo
  const alternarVista = () => {
    const nuevoValor = !mostrarTabla
    setMostrarTabla(nuevoValor)
    localStorage.setItem(CLAVE_VISTA_TABLA, String(nuevoValor))
  }

  const alternarSeccionOperaciones = () => {
    const nuevoValor = !seccionOperacionesAbierta
    setSeccionOperacionesAbierta(nuevoValor)
    localStorage.setItem(CLAVE_SECCION_OPERACIONES, String(nuevoValor))
  }

  const alternarSeccionFumigaciones = () => {
    const nuevoValor = !seccionFumigacionesAbierta
    setSeccionFumigacionesAbierta(nuevoValor)
    localStorage.setItem(CLAVE_SECCION_FUMIGACIONES, String(nuevoValor))
  }

  return (
    <div>

      {/* modal de confirmacion, sale cuando confirmar tiene valor */}
      {confirmar && (
        <Modal
          mesajeError={`¿Estas seguro de que quieres eliminar esta ${confirmar.tipo}?`}
          cerrarModal={() => setConfirmar(null)}
          onConfirmar={confirmarEliminar}
        />
      )}

      <div className="menuExplo">
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
            onClick={alternarVista}
          >
            <img src={mostrarTabla ? './iconTable.png' : './cuadrado.png'} alt="vista" />
            {mostrarTabla ? 'Tarjetas' : 'Tabla'}
          </button>
        </div>
      </div>

      {errorCarga && <span className="mensaje-error">{errorCarga}</span>}

      <SeccionColapsable
        titulo="Operaciones"
        cantidad={operacionesFiltradas.length}
        abierta={seccionOperacionesAbierta}
        onToggle={alternarSeccionOperaciones}
      >
      {/* filtros de operaciones */}
      <div className="filtro-explo">
        <div className="barra-select">
          <select value={campañaSeleccionada} onChange={(e) => { setCampañaSeleccionada(e.target.value); setMesSeleccionado('todos') }}>
            <option value="todas">Campaña ▾</option>
            {obtenerAñosDisponibles().map(año => <option key={año} value={año}>{año}</option>)}
          </select>
        </div>
        <div className="barra-select-lg">
          <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)}>
            <option value="todos">Mes ▾</option>
            <option value="1">Enero</option><option value="2">Febrero</option><option value="3">Marzo</option>
            <option value="4">Abril</option><option value="5">Mayo</option><option value="6">Junio</option>
            <option value="7">Julio</option><option value="8">Agosto</option><option value="9">Septiembre</option>
            <option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option>
          </select>
        </div>
        <div className="barra-select-lg">
          <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
            <option value="todos">Tipo operación ▾</option>
            <option value="poda">Poda</option>
            <option value="abonado">Abonado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="tractor">Tractor</option>
          </select>
        </div>
        <div className="barra-select-lg">
          <select value={parcelaOperacion} onChange={(e) => setParcelaOperacion(e.target.value)}>
            <option value="todas">Parcela ▾</option>
            {obtenerParcelas(listaOperaciones).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {mostrarTabla ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Tipo</th><th>Parcela</th><th>Operario</th><th>Fecha</th>
              <th>Duración</th><th>Precio</th><th>Estado</th><th>Acciones</th>
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
                <td>
                  <div className="tabla-botones">
                    {operacion.estado === 'pendiente' && (
                      <button onClick={() => marcarRealizada('operacion', operacion.id)}>Realizada</button>
                    )}
                    {operacion.estado === 'realizada' && rol !== 'trabajador' && (
                      <button onClick={() => marcarRevisada('operacion', operacion.id)}>Revisada</button>
                    )}
                    {rol !== 'trabajador' && <BtnSubmit texto="Editar" to={`/operacion/${operacion.id}`} />}
                    {/* al pulsar eliminar sale el modal para confirmar */}
                    {rol !== 'trabajador' && <BtnEliminar texto="Eliminar" onClick={() => pedirConfirmacion('operacion', operacion.id)} />}
                  </div>
                </td>
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
              {rol !== 'trabajador' && <BtnSubmit texto="Editar" to={`/operacion/${operacion.id}`} />}
              {/* al pulsar eliminar sale el modal para confirmar */}
              {rol !== 'trabajador' && <BtnEliminar texto="Eliminar" onClick={() => pedirConfirmacion('operacion', operacion.id)} />}
            </div>
          </div>
        ))
      )}
      </SeccionColapsable>

      <SeccionColapsable
        titulo="Fumigaciones"
        cantidad={fumigacionesFiltradas.length}
        abierta={seccionFumigacionesAbierta}
        onToggle={alternarSeccionFumigaciones}
      >
      {/* filtros propios de fumigaciones, no afectan a operaciones */}
      <div className="filtro-explo">
        <div className="barra-select">
          <select value={campañaFumigacion} onChange={(e) => { setCampañaFumigacion(e.target.value); setMesFumigacion('todos') }}>
            <option value="todas">Campaña ▾</option>
            {obtenerAñosDisponibles().map(año => <option key={año} value={año}>{año}</option>)}
          </select>
        </div>
        <div className="barra-select-lg">
          <select value={mesFumigacion} onChange={(e) => setMesFumigacion(e.target.value)}>
            <option value="todos">Mes ▾</option>
            <option value="1">Enero</option><option value="2">Febrero</option><option value="3">Marzo</option>
            <option value="4">Abril</option><option value="5">Mayo</option><option value="6">Junio</option>
            <option value="7">Julio</option><option value="8">Agosto</option><option value="9">Septiembre</option>
            <option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option>
          </select>
        </div>
        <div className="barra-select-lg">
          <select value={variedadFumigacion} onChange={(e) => setVariedadFumigacion(e.target.value)}>
            <option value="todas">Variedad ▾</option>
            {obtenerVariedades(listaFumigaciones).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="barra-select-lg">
          <select value={parcelaFumigacion} onChange={(e) => setParcelaFumigacion(e.target.value)}>
            <option value="todas">Parcela ▾</option>
            {obtenerParcelas(listaFumigaciones).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="barra-select-lg">
          <select value={metodoFumigacion} onChange={(e) => setMetodoFumigacion(e.target.value)}>
            <option value="todas">Método ▾</option>
            <option value="tractor">Tractor</option>
            <option value="mochila">Mochila</option>
          </select>
        </div>
      </div>

      {mostrarTabla ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Método</th><th>Parcela</th><th>Descripción</th><th>Fecha</th>
              <th>Hanegadas</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fumigacionesFiltradas.map(fumigacion => (
              <tr key={fumigacion.id}>
                <td>{fumigacion.metodo_aplicacion}</td>
                <td>{fumigacion.parcela?.poligono} - {fumigacion.parcela?.parcela}</td>
                <td>{fumigacion.descripcion}</td>
                <td>{fumigacion.hora_inicio}</td>
                <td>{fumigacion.parcela?.dimension_hanegadas}</td>
                <td>{fumigacion.estado}</td>
                <td>
                  <div className="tabla-botones">
                    {fumigacion.estado === 'pendiente' && (
                      <button onClick={() => marcarRealizada('fumigacion', fumigacion.id)}>Realizada</button>
                    )}
                    {fumigacion.estado === 'realizada' && rol !== 'trabajador' && (
                      <button onClick={() => marcarRevisada('fumigacion', fumigacion.id)}>Revisada</button>
                    )}
                    {rol !== 'trabajador' && <BtnSubmit texto="Editar" to={`/editar-fumigacion/${fumigacion.id}`} />}
                    {/* al pulsar eliminar sale el modal para confirmar */}
                    {rol !== 'trabajador' && <BtnEliminar texto="Eliminar" onClick={() => pedirConfirmacion('fumigacion', fumigacion.id)} />}
                  </div>
                </td>
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
              {rol !== 'trabajador' && <BtnSubmit texto="Editar" to={`/editar-fumigacion/${fumigacion.id}`} />}
              {/* al pulsar eliminar sale el modal para confirmar */}
              {rol !== 'trabajador' && <BtnEliminar texto="Eliminar" onClick={() => pedirConfirmacion('fumigacion', fumigacion.id)} />}
            </div>
          </div>
        ))
      )}
      </SeccionColapsable>
    </div>
  )
}

export default Operaciones