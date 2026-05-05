import { useState } from 'react'
import MenuBar from './BarraBusqueda/MenuBar'
import './Style/menuNav.css'

const BarraMenu = () => {

  const rol = sessionStorage.getItem('rol');

  const [botonActivo, setBotonActivo] = useState('Dashboard')
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/AgroControl.webp" alt="AgroGestión" className="logo-img" />
        <div className="logo-text">
          <h4>AgroGestión</h4>
          <span>Gestión de tierras</span>
        </div>
      </div>
      
      <div className="navbar-divider"></div>
      
     
      <div className="navbar-items">
        <MenuBar
          to="/dashboard"
          iconImg="./iconDashboard.svg"
          altText="Dashboard"
          texto="Dashboard"
          isSeleccionado={botonActivo === 'Dashboard'} 
          onClick={() => setBotonActivo('Dashboard')}
        />
        {rol !== 'trabajador' && (
          <MenuBar
            to="/explotaciones"
            iconImg="./explotaciones.svg"
            altText="Explotaciones"
            texto="Explotaciones" 
            isSeleccionado={botonActivo === 'Explotaciones'} 
            onClick={() => setBotonActivo('Explotaciones')}
          />
        )}
        {rol !== 'trabajador' && (
          <MenuBar
            to="/parcelas"
            iconImg="./parcela.svg"
            altText="Parcelas"
            texto="Parcelas" 
            isSeleccionado={botonActivo === 'Parcelas'} 
            onClick={() => setBotonActivo('Parcelas')}
          />
          )}
     
        <MenuBar 
          to="/operaciones"
          iconImg="./operaciones.svg"
          altText="Operaciones"
          texto="Operaciones"
          isSeleccionado={botonActivo === 'Operaciones'} 
          onClick={() => setBotonActivo('Operaciones')}
        />
        {rol !== 'trabajador' && (
        <MenuBar 
          to="/recoleccion"
          iconImg="./iconRecoleccion.svg"
          altText="Recoleccion"
          texto="Recoleccion"
          isSeleccionado={botonActivo === 'Recoleccion'} 
          onClick={() => setBotonActivo('Recoleccion')}
        />
        )}

        {rol !== 'trabajador' && ( 
        <MenuBar 
          to="/almacen"
          iconImg="./iconAlmacen.svg"
          altText="Almacen"
          texto="Almacen"
          isSeleccionado={botonActivo === 'Almacen'} 
          onClick={() => setBotonActivo('Almacen')}
        />
         )}

          {rol !== 'trabajador' && ( 
        <MenuBar 
          to="/almacen"
          iconImg="./iconAlmacen.svg"
          altText="Rentavilidad"
          texto="Rentavilidad"
          isSeleccionado={botonActivo === 'Rentavilidad'} 
          onClick={() => setBotonActivo('Rentavilidad')}
        />
         )}
      </div>
    </nav>
  )
}

export default BarraMenu