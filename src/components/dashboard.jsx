import './Style/cards.css';
import './Style/variables.css'
import InfoPanel from './InfoPanel/InfoPanel.jsx';
import InfoPanel2 from './InfoPanel/InfoPanel2.jsx';
import explotacionService from '../services/explotaciones.js';
import parcelasService from '../services/parcelas.js';
import operacionesService from '../services/operaciones.js';
import fumigacionesService from '../services/fumigaciones.js';
import tareasService from '../services/tareas.js';
import almacenService from '../services/almacen.js';
import productosService from '../services/productos.js';
import backupService from '../services/backup.js';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

// pendientes primero; entre iguales se respeta el orden que ya trae el back
// (mas recientes primero). El peso numerico mantiene el orden estable: el
// comparador anterior devolvia 1 tambien para elementos iguales
const ordenarPorEstado = (items) =>
  [...items].sort((a, b) => (a.estado === 'pendiente' ? 0 : 1) - (b.estado === 'pendiente' ? 0 : 1));

// operaciones y fumigaciones se pintan igual: solo cambia el campo que titula
// la ficha (el tipo de operacion o el metodo de aplicacion)
const ListaActividad = ({ items, campoTitulo }) =>
  ordenarPorEstado(items).map((item) => (
    <div key={item.id} className={`actividad-item estado-borde--${item.estado}`}>
      <div className="actividad-item-header">
        <strong>{item[campoTitulo]}</strong>
        <span className={`actividad-estado estado-badge--${item.estado}`}>{item.estado}</span>
      </div>
      <p className="actividad-item-sub">{item.operario}</p>
    </div>
  ));

const Dashboard = () => {
  const [numExplo, setNumExplo] = useState(0);
  const [numParcelas, setNumParcelas] = useState(0);
  const [totalOperaciones, setTotalOperaciones] = useState(0);
  const [totalFumigaciones, setTotalFumigaciones] = useState(0);
  const [totalProductos, setTotalProductos] = useState(0);
  const [actividadReciente, setActividadReciente] = useState({ operaciones: [], fumigaciones: [] });
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [appVacia, setAppVacia] = useState(false);

  useEffect(() => {
    // el aviso de "importar copia de seguridad" solo aplica a quien puede
    // restaurarla (admin); un trabajador nunca ve datos vacíos como "suyos"
    if (sessionStorage.getItem('rol') === 'admin') {
      backupService.tieneDatos()
        .then(tieneDatos => setAppVacia(!tieneDatos))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const avisarError = () => setErrorCarga('No se pudieron cargar todos los datos del panel');

    explotacionService.getCount()
      .then(data => setNumExplo(data.total))
      .catch(avisarError);

    parcelasService.getCount()
      .then(data => setNumParcelas(data.total))
      .catch(avisarError);

    operacionesService.getTotal()
      .then(total => setTotalOperaciones(total))
      .catch(avisarError);

    fumigacionesService.getTotal()
      .then(total => setTotalFumigaciones(total))
      .catch(avisarError);

    productosService.getProductos()
      .then(data => setTotalProductos(data.length))
      .catch(avisarError);

    tareasService.getActividadReciente()
      .then(data => setActividadReciente(data))
      .catch(avisarError);

    almacenService.getStockBajo()
      .then(datos => setProductosStockBajo(datos))
      .catch(avisarError);
  }, []);

  const paneles = [
    { iconImg: './explotaciones.svg', texto: 'Explotaciones', valor: numExplo,          comentario: 'Total de Fincas'    },
    { iconImg: './parcela.svg',       texto: 'Parcelas',       valor: numParcelas,       comentario: 'Total Parcelas'     },
    { iconImg: './operaciones.svg',   texto: 'Operaciones',    valor: totalOperaciones,  comentario: 'Total Operaciones'  },
    { iconImg: './fumigar1.svg',       texto: 'Fumigaciones',   valor: totalFumigaciones, comentario: 'Total Fumigaciones' },
    { iconImg: './almacen.svg',       texto: 'Productos',      valor: totalProductos,                 comentario: 'En almacén'         },
  ];

  return (
    <div>

      {appVacia && (
        <div className="aviso-app-vacia">
          <span>No tienes datos guardados. ¿Quieres importar una copia de seguridad?</span>
          <Link to="/configuracion" className="btn-vista">Ir a Configuración</Link>
        </div>
      )}

      {errorCarga && <span className="mensaje-error">{errorCarga}</span>}

      {/* tarjetas resumen */}
      <div className="primeraSeccion">
        {paneles.map((panel) => (
          <InfoPanel key={panel.texto} {...panel} />
        ))}
      </div>

      <div className="segundaSeccion">

        {/* alertas de stock bajo */}
        <InfoPanel2 iconImg="./advertencia1.png" titulo="Alertas" texto="Requieren atención">
          {productosStockBajo.length === 0
            ? (
                <div className="stock-ok">
                  <img src="./check.svg" alt="" width="16" />
                  Todos los productos tienen stock suficiente
                </div>
              )
            : productosStockBajo.map(producto => (
                <div key={producto.id} className="actividad-item actividad-item--alerta">
                  <div className="actividad-item-header">
                    <strong>{producto.nombre}</strong>
                    <span className="actividad-estado estado-badge--pendiente">Stock bajo</span>
                  </div>
                  <p className="actividad-item-sub">
                    Actual: {producto.stock_actual} {producto.unidad} — Mínimo: {producto.stock_minimo} {producto.unidad}
                  </p>
                </div>
              ))
          }
        </InfoPanel2>

        {/* últimas operaciones y fumigaciones, pendientes primero */}
        <InfoPanel2 iconImg="./operaciones.svg" titulo="Actividad Reciente">
          <h3>Operaciones</h3>
          <ListaActividad items={actividadReciente.operaciones} campoTitulo="tipo_operacion" />

          <h3>Fumigaciones</h3>
          <ListaActividad items={actividadReciente.fumigaciones} campoTitulo="metodo_aplicacion" />
        </InfoPanel2>

      </div>
    </div>
  );
};

export default Dashboard;