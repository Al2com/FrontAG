import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import productosService from '../services/productos.js';
import comprasService from '../services/compras.js';
import almacenService from '../services/almacen.js';
import BtnCrear from './buttons/BtnCrear.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import BtnEliminar from './buttons/btnEliminar.jsx';
import Modal from './Modal/Modal.jsx';
import './Style/cards.css';
import './Style/forms.css';
import './Style/search.css';
import './Style/detalleProducto.css';

const euro = (valor) => `${(Number(valor) || 0).toFixed(2)} €`;

const Almacen = () => {
  const [productos, setProductos] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [mostrarTabla, setMostrarTabla] = useState(false);
  // modal de confirmacion para eliminar
  const [modalConfirm, setModalConfirm] = useState({ visible: false, id: null });

  // vista de detalle: 'productos' (por defecto), 'compras' o 'resumen'
  const [vista, setVista] = useState('productos');
  const [compras, setCompras] = useState([]);
  const [errorCompras, setErrorCompras] = useState('');
  const [resumenGeneral, setResumenGeneral] = useState(null);
  const [errorResumen, setErrorResumen] = useState('');

  const rol = sessionStorage.getItem('rol');

  useEffect(() => {
    productosService.getProductos()
      .then(data => setProductos(data))
      .catch(() => setErrorCarga('Error al cargar los productos'));
  }, []);

  // la ruta /compras es solo de administrador, así que solo pedimos el detalle
  // cuando el usuario lo abre (y solo si no es trabajador)
  const abrirDetalleCompras = () => {
    if (vista === 'compras') {
      setVista('productos');
      return;
    }
    setErrorCompras('');
    comprasService.getCompras()
      .then(data => {
        setCompras(data);
        setVista('compras');
      })
      .catch(() => setErrorCompras('Error al cargar el detalle de compras'));
  };

  const abrirResumenGeneral = () => {
    if (vista === 'resumen') {
      setVista('productos');
      return;
    }
    setErrorResumen('');
    almacenService.getResumenGeneral()
      .then(data => {
        setResumenGeneral(data);
        setVista('resumen');
      })
      .catch(() => setErrorResumen('Error al cargar el resumen de gastos'));
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return isNaN(d) ? fecha : d.toLocaleDateString('es-ES');
  };

  const confirmarEliminar = (id) => {
    setModalConfirm({ visible: true, id });
  };

  const eliminarProducto = () => {
    productosService.borrarProducto(modalConfirm.id)
      .then(() => {
        setProductos(productos.filter(p => p.id !== modalConfirm.id));
        setModalConfirm({ visible: false, id: null });
      })
      .catch((err) => {
        // mostramos el mensaje real del back (p.ej. producto con historial) si viene
        setErrorCarga(err.response?.data?.mensaje || 'Error al eliminar el producto');
        setModalConfirm({ visible: false, id: null });
      });
  };

  return (
    <div>
      {/* modal de confirmacion para eliminar */}
      {modalConfirm.visible && (
        <Modal
          mesajeError="¿Estás seguro de eliminar este producto?"
          cerrarModal={() => setModalConfirm({ visible: false, id: null })}
          onConfirmar={eliminarProducto}
        />
      )}
      <div className="menuExplo">
      
        <div className="menu-button">
          {rol !== 'trabajador' && (
            <BtnCrear to="/nuevo-producto" titulo="Añadir Producto" iconIng="./plusNegro.png" />
          )}
          {rol !== 'trabajador' && (
            <BtnCrear to="/comprar-producto" titulo="Comprar Producto" iconIng="./plusNegro.png" />
          )}
          <div className="separador-btn"></div>
          {vista === 'productos' && (
            <button
              className={`btn-vista ${mostrarTabla ? 'activo' : ''}`}
              onClick={() => setMostrarTabla(!mostrarTabla)}
            >
              <img src={mostrarTabla ? './iconTable.png' : './cuadrado.png'} alt="vista" />
              {mostrarTabla ? 'Tarjetas' : 'Tabla'}
            </button>
          )}
          {rol !== 'trabajador' && (
            <button
              className={`btn-vista ${vista === 'compras' ? 'activo' : ''}`}
              onClick={abrirDetalleCompras}
            >
              {vista === 'compras' ? 'Volver al almacén' : 'Detalle'}
            </button>
          )}
          {rol !== 'trabajador' && (
            <button
              className={`btn-vista ${vista === 'resumen' ? 'activo' : ''}`}
              onClick={abrirResumenGeneral}
            >
              {vista === 'resumen' ? 'Volver al almacén' : 'Resumen de gastos'}
            </button>
          )}
        </div>
      </div>

      {errorCarga && <span className="mensaje-error">{errorCarga}</span>}
      {errorCompras && <span className="mensaje-error">{errorCompras}</span>}
      {errorResumen && <span className="mensaje-error">{errorResumen}</span>}

      {vista === 'resumen' && resumenGeneral ? (
        <div className="detalle-producto-graficos">
          <div className="rentabilidad-card detalle-producto-grafico">
            <h4>Gasto en compras por año</h4>
            {resumenGeneral.gasto_por_anio.length === 0 ? (
              <p className="texto-ayuda">Todavía no hay compras registradas.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={resumenGeneral.gasto_por_anio} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" vertical={false} />
                  <XAxis dataKey="anio" stroke="var(--c-texto-apagado)" fontSize={12} />
                  <YAxis stroke="var(--c-texto-apagado)" fontSize={12} tickFormatter={(v) => `${v} €`} width={55} />
                  <Tooltip formatter={(v) => euro(v)} />
                  <Bar dataKey="gasto" name="Gasto" fill="var(--c-primario-claro)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rentabilidad-card detalle-producto-grafico">
            <h4>Productos con más gasto</h4>
            {resumenGeneral.top_productos.length === 0 ? (
              <p className="texto-ayuda">Todavía no hay compras registradas.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={resumenGeneral.top_productos} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" horizontal={false} />
                  <XAxis type="number" stroke="var(--c-texto-apagado)" fontSize={12} tickFormatter={(v) => `${v} €`} />
                  <YAxis type="category" dataKey="nombre" stroke="var(--c-texto-apagado)" fontSize={12} width={140} />
                  <Tooltip formatter={(v) => euro(v)} />
                  <Bar dataKey="gasto" name="Gasto" fill="var(--c-primario)" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      ) : vista === 'compras' ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Material</th>
              <th>Precio</th>
              <th>Día</th>
              <th>Cantidad</th>
              <th>Proveedor</th>
            </tr>
          </thead>
          <tbody>
            {compras.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ fontStyle: 'italic', color: 'var(--c-texto-apagado)' }}>
                  Todavía no hay compras registradas
                </td>
              </tr>
            ) : (
              compras.map(compra => (
                <tr key={compra.id}>
                  <td>{compra.producto?.nombre ?? '—'}</td>
                  <td>{Number(compra.precio).toFixed(2)} €</td>
                  <td>{formatearFecha(compra.fecha_compra)}</td>
                  <td>{compra.cantidad_compra} {compra.producto?.unidad ?? ''}</td>
                  <td>{compra.proveedor?.nombre_comercial || compra.proveedor?.nombre_empresa || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : mostrarTabla ? (
        <table className="tabla-operaciones">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Materia activa</th>
              <th>Ubicación</th>
              <th>Stock</th>
              <th>Unidad</th>
              <th>Precio</th>
              {rol !== 'trabajador' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {productos.map(producto => (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{producto.materia_activa}</td>
                <td>{producto.ubicacion}</td>
                <td>{producto.stock_actual}</td>
                <td>{producto.unidad}</td>
                <td>{producto.precio} €</td>
                {rol !== 'trabajador' && (
                  <td>
                    <div className="tabla-botones">
                      <BtnSubmit texto="Detalle" to={`/producto/${producto.id}/detalle`} />
                      <BtnSubmit texto="Editar" to={`/producto/${producto.id}`} />
                      <BtnEliminar texto="Eliminar" onClick={() => confirmarEliminar(producto.id)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        productos.map(producto => (
          <div key={producto.id} className="explotacionCard">
            <h4><strong>Producto</strong></h4>
            <p><strong>Nombre:</strong> {producto.nombre}</p>
            <p><strong>Materia activa:</strong> {producto.materia_activa}</p>
            <p><strong>Ubicación:</strong> {producto.ubicacion}</p>
            <p><strong>Stock:</strong> {producto.stock_actual} {producto.unidad}</p>
            <p><strong>Precio:</strong> {producto.precio} €</p>
            <div className="card-botones">
              {rol !== 'trabajador' && (
                <BtnSubmit texto="Detalle" to={`/producto/${producto.id}/detalle`} />
              )}
              {rol !== 'trabajador' && (
                <BtnSubmit texto="Editar" to={`/producto/${producto.id}`} />
              )}
              {rol !== 'trabajador' && (
                <BtnEliminar texto="Eliminar" onClick={() => confirmarEliminar(producto.id)} />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Almacen;