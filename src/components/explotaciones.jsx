import { useEffect, useState } from 'react';
import InfoPanel from './InfoPanel/InfoPanel.jsx';
import explotacionService from '../services/explotaciones.js';
import parcelasService from '../services/parcelas.js';
import BtnCrear from './buttons/BtnCrear.jsx';
import BtnEliminar from './buttons/btnEliminar.jsx';
import ExplotacionCard from './InfoPanel/ExplotacionCard .jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import Modal from './Modal/Modal.jsx';
import './Style/cards.css';
import './Style/forms.css';
import './Style/search.css';

const Explotaciones = () => {

  // numeros que se muestran en los paneles de arriba
  const [numExplo, setNumExplo] = useState(0);
  const [numParcelas, setNumParcelas] = useState(0);
  const [totalHng, setTotalHng] = useState(0);
  const [parcelaGot, setParGot] = useState(0);
  const [parcelaMan, setParMan] = useState(0);

  // lista principal de explotaciones
  const [resumen, setResumen] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');

  // valores de los filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTamaño, setFiltroTamaño] = useState('todos');
  const [filtroParcelas, setFiltroParcelas] = useState('todos');

  // controla si se ve tabla o tarjetas
  const [mostrarTabla, setMostrarTabla] = useState(false);

  // modal de confirmacion
  const [modalConfirm, setModalConfirm] = useState({ visible: false, id: null });

  const confirmarEliminar = (id) => {
    setModalConfirm({ visible: true, id });
  };

  // pido confirmacion antes de borrar y actualizo la lista sin recargar
  const eliminarExplotacion = () => {
    explotacionService.borrarExplotacion(modalConfirm.id)
      .then(() => {
        setResumen(resumen.filter(exp => exp.id !== modalConfirm.id));
        setModalConfirm({ visible: false, id: null });
      })
      .catch(() => {
        setErrorCarga('Error al eliminar la explotacion');
        setModalConfirm({ visible: false, id: null });
      });
  };

  const cancelarEliminar = () => {
    setModalConfirm({ visible: false, id: null });
  };

  const rol = sessionStorage.getItem('rol');

  // al entrar a la pagina pido los datos al back
  useEffect(() => {
    explotacionService.getCount()
      .then(data => setNumExplo(data.total))
      .catch(() => setErrorCarga('Error al cargar explotaciones'))

    parcelasService.getCount()
      .then(data => {
        setNumParcelas(data.total);
        setTotalHng(data.totalHng);
        setParGot(data.parcelasgoteo);
        setParMan(data.parcelasmanta);
      })
      .catch(() => setErrorCarga('Error al cargar los contadores'))

    explotacionService.getResumen()
      .then(data => setResumen(data))
      .catch(() => setErrorCarga('Error al cargar las explotaciones'))
  }, [])

  // filtro por nombre y ordeno segun lo que haya seleccionado en los selects
  const explotacionesFiltradas = resumen
    .filter(exp => exp.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (filtroTamaño === 'maximo') return b.parcelas_sum_dimension_hanegadas - a.parcelas_sum_dimension_hanegadas;
      if (filtroTamaño === 'minimo') return a.parcelas_sum_dimension_hanegadas - b.parcelas_sum_dimension_hanegadas;
      return 0;
    })
    .sort((a, b) => {
      if (filtroParcelas === 'masParcelas') return b.parcelas_count - a.parcelas_count;
      if (filtroParcelas === 'menosParcelas') return a.parcelas_count - b.parcelas_count;
      return 0;
    });

  return (
    <div>
      {/* modal de confirmacion para eliminar */}
      {modalConfirm.visible && (
        <Modal
          mesajeError="¿Estás seguro de eliminar la explotación?"
          cerrarModal={cancelarEliminar}
          onConfirmar={eliminarExplotacion}
        />
      )}

      <div className="menuExplo">
        <div className="menu-button">
          {rol !== 'trabajador' && (
            <BtnCrear to="/nueva-explotacion" titulo="Crear Explotación" iconIng="./plusNegro.png" />
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

      <div className="primeraSeccion">
        <InfoPanel iconImg="./explotaciones.svg" altText="Explotaciones" texto="Explotaciones" valor={numExplo} />
        <InfoPanel iconImg="./dimension.svg" altText="Hanegadas" texto="Total hanegadas" valor={totalHng} />
        <InfoPanel iconImg="./riego.svg" altText="Riego manta" texto="Riego Manta" valor={parcelaMan} />
        <InfoPanel iconImg="./riegoGoteo.svg" altText="Riego goteo" texto="Riego Goteo" valor={parcelaGot} />
        <InfoPanel iconImg="./parcela.svg" altText="Parcelas" texto="Total parcelas" valor={numParcelas} />
      </div>

      <div className="filtro-explo">
        <div className="barra-search">
          <img src="./search.svg" alt="buscar" />
          <input onChange={(e) => setBusqueda(e.target.value)} placeholder="Busca por nombre explotación" />
        </div>
        <div className="barra-select-lg">
          <select onChange={(e) => setFiltroTamaño(e.target.value)}>
            <option value="todos">Tamano ▾</option>
            <option value="maximo">Mayor tamano</option>
            <option value="minimo">Menor tamano</option>
          </select>
        </div>
        <div className="barra-select-lg">
          <select onChange={(e) => setFiltroParcelas(e.target.value)}>
            <option value="todos">Parcelas ▾</option>
            <option value="masParcelas">Mas parcelas</option>
            <option value="menosParcelas">Menos parcelas</option>
          </select>
        </div>
      </div>

      {mostrarTabla ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ubicacion</th>
              <th>Hanegadas</th>
              <th>Parcelas</th>
              {rol !== 'trabajador' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {explotacionesFiltradas.map(explotacion => (
              <tr key={explotacion.id}>
                <td>{explotacion.nombre}</td>
                <td>{explotacion.ubicacion}</td>
                <td>{explotacion.parcelas_sum_dimension_hanegadas}</td>
                <td>{explotacion.parcelas_count}</td>
                {rol !== 'trabajador' && (
                  <td>
                    <div className="tabla-botones">
                      <BtnSubmit texto="Editar" to={`/explotacion/${explotacion.id}`} />
                      <BtnEliminar texto="Eliminar" onClick={() => confirmarEliminar(explotacion.id)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        explotacionesFiltradas.map((explotacion, index) => (
          <div className="seccion-explo-part" key={index}>
            <ExplotacionCard
              nombre={explotacion.nombre}
              iconImg="./explotaciones.svg"
              altText="Ubicacion"
              ubicacion={explotacion.ubicacion}
              TotalHngExplo={explotacion.parcelas_sum_dimension_hanegadas}
              numParcelas={explotacion.parcelas_count}
            >
              <div className="card-botones">
                {rol !== 'trabajador' && (
                  <BtnSubmit texto="Editar" to={`/explotacion/${explotacion.id}`} />
                )}
                {rol !== 'trabajador' && (
                  <BtnEliminar texto="Eliminar" onClick={() => confirmarEliminar(explotacion.id)} />
                )}
              </div>
            </ExplotacionCard>
          </div>
        ))
      )}
    </div>
  );
};

export default Explotaciones;