import BtnCrear from './buttons/BtnCrear.jsx';
import  '../components/Style/formStyles.css';





const Almacen = () =>{

  const rol = sessionStorage.getItem('rol')

    return(
      <div>
        <div className="menuExplo">
          <div>
            <h2>Página de Almacen</h2>
            <p>Gestión de inventario y productos químicos</p>
          </div>
          <div className="menu-buttons">
            {rol!=='trabajador' && (
               <BtnCrear
                to="/nuevo-producto"
                titulo="Añadir Producto Nuevo"
                iconIng="./plusNegro.png"
                className="btn-nueva-explotacion"
             />
            )}

            {rol!=='trabajador' && (
               <BtnCrear
                to="/nuevo-producto"
                titulo="Comprar Producto"
                iconIng="./plusNegro.png"
                className="btn-nueva-explotacion"
             />
            )}

            {rol!=='trabajador' && (
               <BtnCrear
                to="/nuevo-producto"
                titulo="Ver Almacén"
                iconIng="./iconAlmacen.svg"
                className="btn-nueva-explotacion"
             />
            )}

          
          </div>

         </div>
      </div>
   

    )
}

export default Almacen