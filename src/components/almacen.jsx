import { useEffect, useState } from 'react';
import productosService from '../services/productos.js';
import BtnCrear from './buttons/BtnCrear.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import BtnEliminar from './buttons/btnEliminar.jsx';
import './Style/cards.css';
import './Style/forms.css';
import './Style/search.css';

const Almacen = () => {
  const [productos, setProductos] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [mostrarTabla, setMostrarTabla] = useState(false);

  const rol = sessionStorage.getItem('rol');

  useEffect(() => {
    productosService.getProductos()
      .then(data => setProductos(data))
      .catch(() => setErrorCarga('Error al cargar los productos'));
  }, []);

  const eliminarProducto = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      productosService.borrarProducto(id)
        .then(() => setProductos(productos.filter(p => p.id !== id)))
        .catch(() => setErrorCarga('Error al eliminar el producto'));
    }
  };

  return (
    <div>
      <div className="menuExplo">
      
        <div className="menu-button">
          {rol !== 'trabajador' && (
            <BtnCrear to="/nuevo-producto" titulo="Añadir Producto" iconIng="./plusNegro.png" />
          )}
          {rol !== 'trabajador' && (
            <BtnCrear to="/comprar-producto" titulo="Comprar Producto" iconIng="./plusNegro.png" />
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

      {mostrarTabla ? (
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
                      <BtnSubmit texto="Editar" to={`/producto/${producto.id}`} />
                      <BtnEliminar texto="Eliminar" onClick={() => eliminarProducto(producto.id)} />
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
                <BtnSubmit texto="Editar" to={`/producto/${producto.id}`} />
              )}
              {rol !== 'trabajador' && (
                <BtnEliminar texto="Eliminar" onClick={() => eliminarProducto(producto.id)} />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Almacen;