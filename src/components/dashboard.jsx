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
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [numExplo, setNumExplo] = useState(0);
  const [numParcelas, setNumParcelas] = useState(0);
  const [totalOperaciones, setTotalOperaciones] = useState(0);
  const [totalFumigaciones, setTotalFumigaciones] = useState(0);
  const [actividadReciente, setActividadReciente] = useState({ operaciones: [], fumigaciones: [] });
  const [productosStockBajo, setProductosStockBajo] = useState([]);

  useEffect(() => {
    explotacionService.getCount()
      .then(data => setNumExplo(data.total))
      .catch(err => console.error('Error explotaciones:', err));

    parcelasService.getCount()
      .then(data => setNumParcelas(data.total))
      .catch(err => console.error('Error parcelas:', err));

    operacionesService.getLista()
      .then(data => setTotalOperaciones(data.total))
      .catch(err => console.error('Error operaciones:', err));

    fumigacionesService.getLista()
      .then(data => setTotalFumigaciones(data.totalFumigaciones))
      .catch(err => console.error('Error fumigaciones:', err));

    tareasService.getActividadReciente()
      .then(data => setActividadReciente(data))
      .catch(err => console.error('Error actividad reciente:', err));

    almacenService.getStockBajo()
      .then(datos => setProductosStockBajo(datos))
      .catch(err => console.error('Error stock:', err));
  }, []);

  // pendientes primero
  const ordenarPorEstado = (items) =>
    [...items].sort((a, b) =>
      a.estado === 'pendiente' && b.estado !== 'pendiente' ? -1 : 1
    );

  const paneles = [
    { iconImg: './explotaciones.svg', texto: 'Explotaciones', valor: numExplo,          comentario: 'Total de Fincas'    },
    { iconImg: './parcela.svg',       texto: 'Parcelas',       valor: numParcelas,       comentario: 'Total Parcelas'     },
    { iconImg: './operaciones.svg',   texto: 'Operaciones',    valor: totalOperaciones,  comentario: 'Total Operaciones'  },
    { iconImg: './fumigar1.svg',       texto: 'Fumigaciones',   valor: totalFumigaciones, comentario: 'Total Fumigaciones' },
    { iconImg: './almacen.svg',       texto: 'Productos',      valor: 9,                 comentario: 'En almacén'         },
  ];

  return (
    <div>

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
          {ordenarPorEstado(actividadReciente.operaciones).map((op, i) => (
            <div key={i} className={`actividad-item estado-borde--${op.estado}`}>
              <div className="actividad-item-header">
                <strong>{op.tipo_operacion}</strong>
                <span className={`actividad-estado estado-badge--${op.estado}`}>{op.estado}</span>
              </div>
              <p className="actividad-item-sub">{op.operario}</p>
            </div>
          ))}

          <h3>Fumigaciones</h3>
          {ordenarPorEstado(actividadReciente.fumigaciones).map((fum, i) => (
            <div key={i} className={`actividad-item estado-borde--${fum.estado}`}>
              <div className="actividad-item-header">
                <strong>{fum.metodo_aplicacion}</strong>
                <span className={`actividad-estado estado-badge--${fum.estado}`}>{fum.estado}</span>
              </div>
              <p className="actividad-item-sub">{fum.metodo_aplicacion} — {fum.operario}</p>
            </div>
          ))}
        </InfoPanel2>

      </div>
    </div>
  );
};

export default Dashboard;