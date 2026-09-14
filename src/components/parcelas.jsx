import { useEffect, useState } from 'react';
import InfoPanel from './InfoPanel/InfoPanel.jsx';
import BtnCrear from './buttons/BtnCrear.jsx';
import parcelasService from '../services/parcelas.js';
import ParcelaCard from './InfoPanel/ParcelaCard.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import BtnEliminar from './buttons/btnEliminar.jsx';
import Modal from './Modal/Modal.jsx';
import Pill from './Pill.jsx';
import CabeceraOrden from './CabeceraOrden.jsx';
import { useOrdenTabla } from '../hooks/useOrdenTabla.js';
import './Style/cards.css';
import './Style/forms.css';
import './Style/search.css';

const Parcela = () => {

  // numeros de los paneles de arriba
  const [numParcelas, setNumParcelas] = useState(0);
  const [totalHng, setTotalHng] = useState(0);
  const [parcelaGot, setParGot] = useState(0);
  const [parcelaMan, setParMan] = useState(0);

  // lista principal de parcelas
  const [parResumen, setParResumen] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');

  // valores de los filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroRiego, setFiltroRiego] = useState('todos');
  const [filtroDimension, setFiltroDimension] = useState('todos');

  // controla si se ve tabla o bloques
  const [mostrarTabla, setMostrarTabla] = useState(false);

  const ordenParcelas = useOrdenTabla();
  const valorOrdenParcela = (p, clave) => (
    clave === 'explotacion' ? p.explotacion.nombre : p[clave]
  );
  // tono de la pill de riego: solo distingue visualmente goteo/manta, no es un estado
  const tonoRiego = (rol) => (rol === 'goteo' ? 'info' : 'aviso');

  // modal de confirmacion para eliminar
  const [modalConfirm, setModalConfirm] = useState({ visible: false, id: null });

  const rol = sessionStorage.getItem('rol');

  // al entrar pido los datos al back
  useEffect(() => {
    parcelasService.getCount()
      .then(data => {
        setNumParcelas(data.total);
        setTotalHng(data.totalHng);
        setParGot(data.parcelasgoteo);
        setParMan(data.parcelasmanta);
      })
      .catch(() => setErrorCarga('Error al cargar los contadores'))

    parcelasService.getResumenP()
      .then(data => setParResumen(data))
      .catch(() => setErrorCarga('Error al cargar las parcelas'))
  }, [])

  // filtro por variedad y ordeno segun los selects
  const parcelasFiltradas = parResumen
    .filter(p => p.variedad.toLowerCase().includes(busqueda.toLowerCase()))
    .filter(p => filtroRiego === 'todos' || p.rol === filtroRiego)
    .sort((a, b) => {
      if (filtroDimension === 'maximo') return b.dimension_hanegadas - a.dimension_hanegadas;
      if (filtroDimension === 'minimo') return a.dimension_hanegadas - b.dimension_hanegadas;
      return 0;
    });
  const parcelasOrdenadas = ordenParcelas.ordenar(parcelasFiltradas, valorOrdenParcela);

  const confirmarEliminar = (id) => {
    setModalConfirm({ visible: true, id });
  };

  // pido confirmacion antes de borrar y actualizo la lista sin recargar
  const eliminarParcela = () => {
    parcelasService.borrarParcela(modalConfirm.id)
      .then(() => {
        setParResumen(parResumen.filter(p => p.id !== modalConfirm.id));
        setModalConfirm({ visible: false, id: null });
      })
      .catch(() => {
        setErrorCarga('Error al eliminar la parcela');
        setModalConfirm({ visible: false, id: null });
      })
  };

  return (
    <div>
      {/* modal de confirmacion para eliminar */}
      {modalConfirm.visible && (
        <Modal
          mesajeError="¿Estás seguro de eliminar esta parcela?"
          cerrarModal={() => setModalConfirm({ visible: false, id: null })}
          onConfirmar={eliminarParcela}
        />
      )}

      <div className="menuExplo">
        
        <div className="menu-button">
          {rol !== 'trabajador' && (
            <BtnCrear to="/nueva-parcela" titulo="Crear Parcela" iconIng="./plusNegro.png" />
          )}
          <div className="separador-btn"></div>
          <button
            className={`btn-vista ${mostrarTabla ? 'activo' : ''}`}
            onClick={() => setMostrarTabla(!mostrarTabla)}
          >
            <img src={mostrarTabla ? './iconTable.png' : './cuadrado.png'} alt="vista" />
            {mostrarTabla ? 'Bloques' : 'Tabla'}
          </button>
        </div>
      </div>

      {errorCarga && <span className="mensaje-error">{errorCarga}</span>}

      <div className="primeraSeccion">
        <InfoPanel iconImg="./parcela.svg" altText="Parcelas" texto="Total Parcelas" valor={numParcelas} />
        <InfoPanel iconImg="./dimension.svg" altText="Hanegadas" texto="Total hanegadas" valor={totalHng} />
        <InfoPanel iconImg="./riego.svg" altText="Riego manta" texto="Riego Manta" valor={parcelaMan} />
        <InfoPanel iconImg="./riegoGoteo.svg" altText="Riego goteo" texto="Riego Goteo" valor={parcelaGot} />
      </div>

      <div className="filtro-explo">
        <div className="barra-search">
          <img src="./search.svg" alt="buscar" />
          <input onChange={(e) => setBusqueda(e.target.value)} placeholder="Busca por variedad" />
        </div> 

        <div className="barra-select">
          <select onChange={(e) => setFiltroRiego(e.target.value)}>
            <option value="todos">Riego ▾</option>
            <option value="goteo">Goteo</option>
            <option value="manta">Manta</option>
          </select>
        </div>

        <div className="barra-select-lg">
          <select onChange={(e) => setFiltroDimension(e.target.value)}>
            <option value="todos">Dimension ▾</option>
            <option value="maximo">Mayor dimension</option>
            <option value="minimo">Menor dimension</option>
          </select>
        </div>
      </div>

      {mostrarTabla ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <CabeceraOrden orden={ordenParcelas} clave="nombre">Nombre</CabeceraOrden>
              <CabeceraOrden orden={ordenParcelas} clave="poligono">Poligono</CabeceraOrden>
              <CabeceraOrden orden={ordenParcelas} clave="parcela">Parcela</CabeceraOrden>
              <CabeceraOrden orden={ordenParcelas} clave="explotacion">Explotacion</CabeceraOrden>
              <CabeceraOrden orden={ordenParcelas} clave="variedad">Variedad</CabeceraOrden>
              <CabeceraOrden orden={ordenParcelas} clave="dimension_hanegadas">Hanegadas</CabeceraOrden>
              <CabeceraOrden orden={ordenParcelas} clave="rol">Riego</CabeceraOrden>
              <CabeceraOrden orden={ordenParcelas} clave="num_arboles">Arboles</CabeceraOrden>
              {rol !== 'trabajador' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {parcelasOrdenadas.map(parcela => (
              <tr key={parcela.id}>
                <td>{parcela.nombre}</td>
                <td>{parcela.poligono}</td>
                <td>{parcela.parcela}</td>
                <td>{parcela.explotacion.nombre}</td>
                <td>{parcela.variedad}</td>
                <td className="num">{parcela.dimension_hanegadas}</td>
                <td><Pill texto={parcela.rol === 'goteo' ? 'Goteo' : 'Manta'} tono={tonoRiego(parcela.rol)} /></td>
                <td className="num">{parcela.num_arboles}</td>
                {rol !== 'trabajador' && (
                  <td>
                    <div className="tabla-botones">
                      <BtnSubmit texto="Editar" to={`/parcela/${parcela.id}`} />
                      <BtnEliminar texto="Eliminar" onClick={() => confirmarEliminar(parcela.id)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="grid-bloques">
        {parcelasOrdenadas.map(parcela => (
          <ParcelaCard
            key={parcela.id}
            poligono={parcela.poligono}
            parcela={parcela.parcela}
            iconImg="./parcela.svg"
            altText="pick"
            explotacion={parcela.explotacion.nombre}
            dimension_hanegadas={parcela.dimension_hanegadas}
            rol={parcela.rol}
            variedad={parcela.variedad}
            num_arboles={parcela.num_arboles}
            fecha_plantacion={parcela.fecha_plantacion}
            nombre={parcela.nombre}
          >
            <div className="card-botones">
              {rol !== 'trabajador' && (
                <BtnSubmit texto="Editar" to={`/parcela/${parcela.id}`} />
              )}
              {rol !== 'trabajador' && (
                <BtnEliminar texto="Eliminar" onClick={() => confirmarEliminar(parcela.id)} />
              )}
            </div>
          </ParcelaCard>
        ))}
        </div>
      )}
    </div>
  );
};

export default Parcela;