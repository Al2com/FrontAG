import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import productosService from '../services/productos.js';
import comprasService from '../services/compras.js';
import almacenService from '../services/almacen.js';
import BurbujasFlotantes from './BurbujasFlotantes.jsx';
import BtnCrear from './buttons/BtnCrear.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import BtnEliminar from './buttons/btnEliminar.jsx';
import Modal from './Modal/Modal.jsx';
import Pill from './Pill.jsx';
import CabeceraOrden from './CabeceraOrden.jsx';
import { useOrdenTabla } from '../hooks/useOrdenTabla.js';
import './Style/cards.css';
import './Style/forms.css';
import './Style/search.css';
import './Style/detalleProducto.css';

const euro = (valor) => `${(Number(valor) || 0).toFixed(2)} €`;
// mismo umbral que el backend (AlmacenController::stockBajo): stock_actual <= stock_minimo
const stockBajo = (p) => p.stock_minimo != null && p.stock_actual <= p.stock_minimo;

const Almacen = () => {
  const [productos, setProductos] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const ordenProductos = useOrdenTabla();
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

  const productosOrdenados = ordenProductos.ordenar(productos, (p, clave) => p[clave]);

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
              {mostrarTabla ? 'Bloques' : 'Tabla'}
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
            <BurbujasFlotantes
              datos={resumenGeneral.top_productos.map(p => ({ id: p.nombre, etiqueta: p.nombre, valor: p.gasto }))}
              formatoValor={euro}
              vacio="Todavía no hay compras registradas."
            />
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
              <CabeceraOrden orden={ordenProductos} clave="nombre">Nombre</CabeceraOrden>
              <CabeceraOrden orden={ordenProductos} clave="materia_activa">Materia activa</CabeceraOrden>
              <CabeceraOrden orden={ordenProductos} clave="ubicacion">Ubicación</CabeceraOrden>
              <CabeceraOrden orden={ordenProductos} clave="stock_actual">Stock</CabeceraOrden>
              <CabeceraOrden orden={ordenProductos} clave="precio">Precio</CabeceraOrden>
              {rol !== 'trabajador' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {productosOrdenados.map(producto => (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{producto.materia_activa}</td>
                <td>{producto.ubicacion}</td>
                <td className="num">
                  {producto.stock_actual} {producto.unidad}{' '}
                  {stockBajo(producto) && <Pill texto="Stock bajo" tono="alerta" />}
                </td>
                <td className="num">{producto.precio} €</td>
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
        <div className="grid-bloques">
        {productosOrdenados.map(producto => (
          <div key={producto.id} className="explotacionCard">
            <div className="cabecera-cardExplo">
              <span style={{ fontWeight: 600, color: 'var(--c-texto)' }}>{producto.nombre}</span>
              {stockBajo(producto) && <Pill texto="Stock bajo" tono="alerta" />}
            </div>
            <div className="datos-cardExplo">
              <p><strong>Materia activa:</strong> {producto.materia_activa}</p>
              <p><strong>Ubicación:</strong> {producto.ubicacion}</p>
              <p><strong>Stock:</strong> <span className="num">{producto.stock_actual} {producto.unidad}</span></p>
              <p><strong>Precio:</strong> <span className="num">{producto.precio} €</span></p>
            </div>
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
        ))}
        </div>
      )}
    </div>
  );
};

export default Almacen;