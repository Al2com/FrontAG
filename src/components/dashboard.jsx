import './Style/variables.css'
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
import {
  MapPin, Map, ClipboardList, SprayCan, Package, TriangleAlert,
  ArrowRight, Plus,
} from 'lucide-react';

// pendientes primero; entre iguales se respeta el orden que ya trae el back
// (mas recientes primero). El peso numerico mantiene el orden estable.
const ordenarPorEstado = (items) =>
  [...items].sort((a, b) => (a.estado === 'pendiente' ? 0 : 1) - (b.estado === 'pendiente' ? 0 : 1));

// estado -> clase de tag y etiqueta visible
const TAG_ESTADO = {
  pendiente: 't-amb',
  realizada: 't-blue',
  revisada: 't-grn',
};
const EstadoTag = ({ estado }) => (
  <span className={`gc-tag ${TAG_ESTADO[estado] || 't-blue'}`}>{estado}</span>
);

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
  const [filtro, setFiltro] = useState('all'); // all | op | fu

  const rol = sessionStorage.getItem('rol');
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');

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

  const stockBajo = productosStockBajo.length;

  const kpis = [
    { Icono: MapPin, texto: 'Explotaciones', valor: numExplo, nota: 'Total de fincas' },
    { Icono: Map, texto: 'Parcelas', valor: numParcelas, nota: `En ${numExplo} explotaciones` },
    { Icono: ClipboardList, texto: 'Operaciones', valor: totalOperaciones, nota: 'Registradas' },
    { Icono: SprayCan, texto: 'Fumigaciones', valor: totalFumigaciones, nota: 'Registradas' },
    { Icono: Package, texto: 'Productos', valor: totalProductos,
      nota: stockBajo ? `${stockBajo} bajo mínimo` : 'En almacén', aviso: stockBajo > 0 },
  ];

  // actividad combinada para la tarjeta de pendientes
  const actividad = [
    ...actividadReciente.operaciones.map(o => ({ ...o, tipo: 'op', titulo: o.tipo_operacion })),
    ...actividadReciente.fumigaciones.map(f => ({ ...f, tipo: 'fu', titulo: f.metodo_aplicacion })),
  ];
  const actividadFiltrada = ordenarPorEstado(
    actividad.filter(a => filtro === 'all' || a.tipo === filtro)
  );

  return (
    <>
      <header className="gc-head">
        <div>
          <h1>Hola{usuario?.name ? `, ${usuario.name}` : ''}</h1>
          <p>{stockBajo} productos bajo mínimo · {totalProductos} en almacén</p>
        </div>
        {rol !== 'trabajador' && (
          <div className="gc-acts">
            <Link className="gc-btn" to="/nueva-fumigacion"><SprayCan />Registrar fumigación</Link>
            <Link className="gc-btn pri" to="/nueva-operacion"><Plus />Nueva operación</Link>
          </div>
        )}
      </header>

      {appVacia && (
        <div className="gc-aviso">
          <span>No tienes datos guardados. ¿Quieres importar una copia de seguridad?</span>
          <Link to="/configuracion" className="gc-btn">Ir a Configuración</Link>
        </div>
      )}

      {errorCarga && <span className="gc-error">{errorCarga}</span>}

      {/* Franja de KPIs */}
      <section className="gc-kpis">
        {kpis.map((kpi) => {
          const Icono = kpi.Icono
          return (
            <div className="gc-kpi" key={kpi.texto}>
              <span className="l"><Icono />{kpi.texto}</span>
              <span className="v">{kpi.valor}</span>
              <span className={`s ${kpi.aviso ? 'w' : ''}`}>{kpi.nota}</span>
            </div>
          )
        })}
      </section>

      <div className="gc-grid">
        {/* Stock bajo mínimo */}
        <section className="gc-card">
          <div className="gc-ch">
            <h2>
              <TriangleAlert style={{ width: 17, height: 17, color: 'var(--amber)' }} />
              Stock bajo mínimo
              {stockBajo > 0 && <span className="c">{stockBajo}</span>}
            </h2>
            {rol !== 'trabajador' && <Link to="/almacen">Ver almacén<ArrowRight /></Link>}
          </div>

          {stockBajo === 0 ? (
            <div className="gc-empty">Todos los productos tienen stock suficiente</div>
          ) : (
            <table className="gc-table">
              <thead>
                <tr><th>Producto</th><th>Actual</th><th>Mínimo</th><th style={{ width: '22%' }}>Nivel</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {productosStockBajo.map(p => {
                  const agotado = Number(p.stock_actual) === 0;
                  const pct = Math.min(100, Math.max(3, (p.stock_actual / p.stock_minimo) * 100 || 3));
                  return (
                    <tr key={p.id}>
                      <td className="p"><b>{p.nombre}</b></td>
                      <td className="num">{p.stock_actual} {p.unidad}</td>
                      <td className="num">{p.stock_minimo} {p.unidad}</td>
                      <td>
                        <div className="gc-bar">
                          <i style={{ width: `${pct}%`, background: agotado ? 'var(--red)' : 'var(--amber)' }}></i>
                        </div>
                      </td>
                      <td><span className={`gc-tag ${agotado ? 't-red' : 't-amb'}`}>{agotado ? 'Agotado' : 'Bajo'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* Actividad reciente / pendientes */}
        <section className="gc-card">
          <div className="gc-ch">
            <h2>Actividad reciente</h2>
            <div className="gc-tabs">
              <button className={filtro === 'all' ? 'on' : ''} onClick={() => setFiltro('all')}>Todas</button>
              <button className={filtro === 'op' ? 'on' : ''} onClick={() => setFiltro('op')}>Operaciones</button>
              <button className={filtro === 'fu' ? 'on' : ''} onClick={() => setFiltro('fu')}>Fumigaciones</button>
            </div>
          </div>

          <div className="gc-list">
            {actividadFiltrada.length === 0 ? (
              <div className="gc-empty">Sin actividad reciente</div>
            ) : actividadFiltrada.map(item => (
              <div className="gc-it" key={`${item.tipo}-${item.id}`}>
                <div className={`gc-ic ${item.tipo}`}>
                  {item.tipo === 'op' ? <ClipboardList /> : <SprayCan />}
                </div>
                <div>
                  <b>{item.titulo}</b>
                  <small>{item.tipo === 'op' ? 'Operación' : 'Fumigación'}<i>·</i>{item.operario}</small>
                </div>
                <EstadoTag estado={item.estado} />
              </div>
            ))}
          </div>

          {rol !== 'trabajador' && (
            <div className="gc-foot"><Link to="/operaciones">Ver todo el historial</Link></div>
          )}
        </section>
      </div>
    </>
  );
};

export default Dashboard;
