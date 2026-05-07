import BtnCrear from './buttons/BtnCrear.jsx';
import productosService from '../services/productos.js'
import AlmacenCard from '../components/InfoPanel/AlmacenCard.jsx'
import { useEffect ,useState} from 'react';
import './Style/almacen.css'





const Almacen = () =>{

  const [productos, setproductos] = useState([])

  useEffect(() => {
    productosService.getProductos()
    .then(data => setproductos(data))
  
    
  },[] ) 

  const rol = sessionStorage.getItem('rol')

    return(
       <div>
    <div className="menuExplo">
      <div>
        <h2>Página de Almacen</h2>
        <p>Gestión de inventario y productos químicos</p>
      </div>
      <div className="menu-buttons">
        <BtnCrear to="/nuevo-producto" titulo="Añadir Producto Nuevo" iconIng="./plusNegro.png" />
        <BtnCrear to="/comprar-producto" titulo="Comprar Producto" iconIng="./plusNegro.png" />
      </div>
    </div>

    {/* Cards debajo de los botones */}
    <div className="seccion-explo">
      {productos.map((lista, index) => (
        <div key={index} className="seccion-explo-part">
          <AlmacenCard 
            iconImg='./almacen.svg'
            nombre={lista.nombre}
            precio={lista.precio}
            ubicacion={lista.ubicacion}
            stock_actual={lista.stock_actual} 
            unidad={lista.unidad}
          />
        </div>
      ))}
    </div>
  </div>

    )
}

export default Almacen