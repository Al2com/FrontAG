import { useEffect, useState } from 'react';
import InfoPanel from './InfoPanel/InfoPanel.jsx';
import BtnCrear from './buttons/BtnCrear.jsx';
import parcelasService from '../services/parcelas.js';
import ParcelaCard from './InfoPanel/ParcelaCard.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import BtnEliminar from './buttons/btnEliminar.jsx';
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

  // controla si se ve tabla o tarjetas
  const [mostrarTabla, setMostrarTabla] = useState(false);

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
      .catch(err => console.error('Error al obtener resumen:', err))
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

  // pido confirmacion antes de borrar y actualizo la lista sin recargar
  const eliminarParcela = (id) => {
    if (window.confirm('Estas seguro de eliminar esta parcela?')) {
      parcelasService.borrarParcela(id)
        .then(() => setParResumen(parResumen.filter(p => p.id !== id)))
        .catch(() => setErrorCarga('Error al eliminar la parcela'))
    }
  };

  return (
    <div>
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
            {mostrarTabla ? 'Tarjetas' : 'Tabla'}
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
          <input onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar" />
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
              <th>Nombre</th>
              <th>Poligono</th>
              <th>Parcela</th>
              <th>Explotacion</th>
              <th>Variedad</th>
              <th>Hanegadas</th>
              <th>Riego</th>
              <th>Arboles</th>
              {rol !== 'trabajador' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {parcelasFiltradas.map(parcela => (
              <tr key={parcela.id}>
                <td>{parcela.nombre}</td>
                <td>{parcela.poligono}</td>
                <td>{parcela.parcela}</td>
                <td>{parcela.explotacion.nombre}</td>
                <td>{parcela.variedad}</td>
                <td>{parcela.dimension_hanegadas}</td>
                <td>{parcela.rol}</td>
                <td>{parcela.num_arboles}</td>
                {rol !== 'trabajador' && (
                  <td>
                    <div className="tabla-botones">
                      <BtnSubmit texto="Editar" to={`/parcela/${parcela.id}`} />
                      <BtnEliminar texto="Eliminar" onClick={() => eliminarParcela(parcela.id)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        parcelasFiltradas.map((parcela, index) => (
          <div className="seccion-explo-part" key={index}>
            <ParcelaCard
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
                  <BtnEliminar texto="Eliminar" onClick={() => eliminarParcela(parcela.id)} />
                )}
              </div>
            </ParcelaCard>
          </div>
        ))
      )}
    </div>
  );
};

export default Parcela;