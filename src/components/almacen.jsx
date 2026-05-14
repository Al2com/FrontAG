import BtnCrear from './buttons/BtnCrear.jsx';
import productosService from '../services/productos.js'
import AlmacenCard from '../components/InfoPanel/AlmacenCard.jsx'
import { useEffect ,useState} from 'react';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import './Style/cards.css'





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
      {productos.map((lista, index) => (
        <div key={index} className="seccion-explo-part">
          <AlmacenCard 
            iconImg='./almacen.svg'
            ubicacion={lista.ubicacion}
            nombre={lista.nombre}
            materia_activa={lista.materia_activa}
            precio={lista.precio}
            stock_actual={lista.stock_actual} 
            unidad={lista.unidad}
          >
          <BtnSubmit texto="Editar" to={`/producto/${lista.id}`} />


          </ AlmacenCard>
        </div>
      ))}
    </div>


    )
}

export default Almacen