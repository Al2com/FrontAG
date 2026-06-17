import { useEffect, useState } from 'react';
import recoleccionService from '../services/recoleccion.js';
import BtnCrear from './buttons/BtnCrear.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import BtnEliminar from './buttons/btnEliminar.jsx';
import InfoPanel from './InfoPanel/InfoPanel.jsx';
import Modal from './Modal/Modal.jsx';
import './Style/cards.css';
import './Style/forms.css';
import './Style/search.css';

const Recoleccion = () => {
  const [recolecciones, setRecolecciones] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [campaña, setCampaña] = useState('todas');
  // modal de confirmacion para eliminar
  const [modalConfirm, setModalConfirm] = useState({ visible: false, id: null });

  const rol = sessionStorage.getItem('rol');

  useEffect(() => {
    recoleccionService.getRecolecciones()
      .then(data => setRecolecciones(data))
      .catch(() => setErrorCarga('Error al cargar las recolecciones'));
  }, []);

  // nombre legible de la parcela
  const nombreParcela = (r) =>
    r.parcela?.nombre || `Pol. ${r.parcela?.poligono} - Par. ${r.parcela?.parcela}`;

  // años (campañas) disponibles, sacados de la fecha
  const añosDisponibles = [...new Set(
    recolecciones.map(r => r.fecha?.substring(0, 4)).filter(Boolean)
  )].sort((a, b) => b - a);

  const recoleccionesFiltradas = recolecciones.filter(r =>
    campaña === 'todas' || r.fecha?.substring(0, 4) === String(campaña)
  );

  // totales de lo filtrado
  const totalKilos = recoleccionesFiltradas.reduce((a, r) => a + Number(r.kilos || 0), 0);
  const totalIngreso = recoleccionesFiltradas.reduce(
    (a, r) => a + Number(r.kilos || 0) * Number(r.precio_medio_kg || 0), 0
  );

  const confirmarEliminar = (id) => setModalConfirm({ visible: true, id });

  const eliminarRecoleccion = () => {
    recoleccionService.borrar(modalConfirm.id)
      .then(() => {
        setRecolecciones(recolecciones.filter(r => r.id !== modalConfirm.id));
        setModalConfirm({ visible: false, id: null });
      })
      .catch(() => {
        setErrorCarga('Error al eliminar la recolección');
        setModalConfirm({ visible: false, id: null });
      });
  };

  return (
    <div>
      {/* modal de confirmacion para eliminar */}
      {modalConfirm.visible && (
        <Modal
          mesajeError="¿Estás seguro de eliminar esta recolección?"
          cerrarModal={() => setModalConfirm({ visible: false, id: null })}
          onConfirmar={eliminarRecoleccion}
        />
      )}

      <div className="menuExplo">
        <div className="menu-button">
          {rol !== 'trabajador' && (
            <BtnCrear to="/nueva-recoleccion" titulo="Registrar Recolección" iconIng="./plusNegro.png" />
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
        <InfoPanel iconImg="./parcela.svg" altText="Kilos" texto="Kilos totales" valor={totalKilos.toFixed(2)} />
        <InfoPanel iconImg="./expenses.svg" altText="Ingreso" texto="Ingreso estimado (€)" valor={totalIngreso.toFixed(2)} />
      </div>

      <div className="filtro-explo">
        <div className="barra-select">
          <select value={campaña} onChange={(e) => setCampaña(e.target.value)}>
            <option value="todas">Campaña ▾</option>
            {añosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {recoleccionesFiltradas.length === 0 && !errorCarga && (
        <p style={{ color: 'var(--c-texto-apagado)' }}>Todavía no hay recolecciones registradas.</p>
      )}

      {mostrarTabla ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Parcela</th>
              <th>Fruta</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Kilos</th>
              <th>Precio medio</th>
              <th>Ingreso</th>
              {rol !== 'trabajador' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {recoleccionesFiltradas.map(r => (
              <tr key={r.id}>
                <td>{nombreParcela(r)}</td>
                <td>{r.variedad}</td>
                <td>{r.fecha}</td>
                <td style={{ textTransform: 'capitalize' }}>{r.tipo}</td>
                <td>{Number(r.kilos).toFixed(2)} kg</td>
                <td>{Number(r.precio_medio_kg).toFixed(2)} €/kg</td>
                <td>{(Number(r.kilos) * Number(r.precio_medio_kg)).toFixed(2)} €</td>
                {rol !== 'trabajador' && (
                  <td>
                    <div className="tabla-botones">
                      <BtnSubmit texto="Editar" to={`/recoleccion/${r.id}`} />
                      <BtnEliminar texto="Eliminar" onClick={() => confirmarEliminar(r.id)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        recoleccionesFiltradas.map(r => (
          <div key={r.id} className="explotacionCard">
            <h4><strong>Recolección</strong></h4>
            <p><strong>Parcela:</strong> {nombreParcela(r)}</p>
            <p><strong>Fruta:</strong> {r.variedad}</p>
            <p><strong>Fecha:</strong> {r.fecha}</p>
            <p><strong>Tipo:</strong> <span style={{ textTransform: 'capitalize' }}>{r.tipo}</span></p>
            <p><strong>Kilos:</strong> {Number(r.kilos).toFixed(2)} kg</p>
            <p><strong>Precio medio:</strong> {Number(r.precio_medio_kg).toFixed(2)} €/kg</p>
            <p><strong>Ingreso estimado:</strong> {(Number(r.kilos) * Number(r.precio_medio_kg)).toFixed(2)} €</p>
            <div className="card-botones">
              {rol !== 'trabajador' && (
                <BtnSubmit texto="Editar" to={`/recoleccion/${r.id}`} />
              )}
              {rol !== 'trabajador' && (
                <BtnEliminar texto="Eliminar" onClick={() => confirmarEliminar(r.id)} />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Recoleccion;
