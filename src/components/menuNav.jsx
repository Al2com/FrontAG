import { useState } from 'react'
import MenuBar from './BarraBusqueda/MenuBar'
import './Style/menuNav.css'

const BarraMenu = () => {
  const [botonActivo, setBotonActivo] = useState('Dashboard')
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/logo.png" alt="AgroGestión" className="logo-img" />
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
        <MenuBar
          to="/explotaciones"
          iconImg="./iconExplotacion.svg"
          altText="Explotaciones"
          texto="Explotaciones" 
          isSeleccionado={botonActivo === 'Explotaciones'} 
          onClick={() => setBotonActivo('Explotaciones')}
        />
        <MenuBar
          to="/parcelas"
          iconImg="./iconParcelas.svg"
          altText="Parcelas"
          texto="Parcelas" 
          isSeleccionado={botonActivo === 'Parcelas'} 
          onClick={() => setBotonActivo('Parcelas')}
        />
        <MenuBar 
          to="/operaciones"
          iconImg="./iconOperaciones.svg"
          altText="Operaciones"
          texto="Operaciones"
          isSeleccionado={botonActivo === 'Operaciones'} 
          onClick={() => setBotonActivo('Operaciones')}
        />
        <MenuBar 
          to="/recoleccion"
          iconImg="./iconRecoleccion.svg"
          altText="Recoleccion"
          texto="Recoleccion"
          isSeleccionado={botonActivo === 'Recoleccion'} 
          onClick={() => setBotonActivo('Recoleccion')}
        />
        <MenuBar 
          to="/almacen"
          iconImg="./iconAlmacen.svg"
          altText="Almacen"
          texto="Almacen"
          isSeleccionado={botonActivo === 'Almacen'} 
          onClick={() => setBotonActivo('Almacen')}
        />
      </div>
    </nav>
  )
}

export default BarraMenu