import { useState } from 'react'
import MenuBar from './BarraBusqueda/MenuBar'
import './Style/cards.css'
import './Style/navbar.css'

const MenuNav = ({ user, logout }) => {

  const rol = sessionStorage.getItem('rol');

  const [botonActivo, setBotonActivo] = useState('Dashboard')
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Marca el item activo y cierra el drawer en movil
  const seleccionar = (nombre) => {
    setBotonActivo(nombre)
    setMenuAbierto(false)
  }

  return (
    <>
      {/* Cabecera movil: logo a la izquierda, hamburguesa a la derecha */}
      <div className="mobile-header">
        <div className="mobile-header-logo">
          <img src="./AgroControl.webp" alt="AgroGestión" className="logo-img" />
          <h4>AgroGestión</h4>
        </div>
        <button
          className={`hamburger-btn ${menuAbierto ? 'abierto' : ''}`}
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Overlay oscuro al abrir el menu en movil */}
      {menuAbierto && (
        <div className="navbar-overlay" onClick={() => setMenuAbierto(false)}></div>
      )}

      <nav className={`navbar ${menuAbierto ? 'navbar-abierta' : ''}`}>
        <div className="navbar-logo">
          <img src="./AgroControl.webp" alt="AgroGestión" className="logo-img" />
          <div className="logo-text">
            <h4>AgroGestión</h4>
            <span>Gestión de tierras</span>
          </div>
        </div>

        {/* Perfil: nombre y rol del usuario */}
        <div className="navbar-perfil">
          <img className="navbar-perfil-avatar" src="/usuario.png" alt="Usuario" />
          <div className="navbar-perfil-info">
            <span className="navbar-perfil-nombre">{user?.name}</span>
            <span className="navbar-perfil-rol">{user?.rol}</span>
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
            onClick={() => seleccionar('Dashboard')}
          />
          {rol !== 'trabajador' && (
            <MenuBar
              to="/explotaciones"
              iconImg="./explotaciones.svg"
              altText="Explotaciones"
              texto="Explotaciones"
              isSeleccionado={botonActivo === 'Explotaciones'}
              onClick={() => seleccionar('Explotaciones')}
            />
          )}
          {rol !== 'trabajador' && (
            <MenuBar
              to="/parcelas"
              iconImg="./parcela.svg"
              altText="Parcelas"
              texto="Parcelas"
              isSeleccionado={botonActivo === 'Parcelas'}
              onClick={() => seleccionar('Parcelas')}
            />
          )}

          <MenuBar
            to="/operaciones"
            iconImg="./operaciones.svg"
            altText="Operaciones"
            texto="Operaciones"
            isSeleccionado={botonActivo === 'Operaciones'}
            onClick={() => seleccionar('Operaciones')}
          />
          {rol !== 'trabajador' && (
            <MenuBar
              to="/recoleccion"
              iconImg="./iconRecoleccion.svg"
              altText="Recoleccion"
              texto="Recolección"
              isSeleccionado={botonActivo === 'Recoleccion'}
              onClick={() => seleccionar('Recoleccion')}
            />
          )}

          {rol !== 'trabajador' && (
            <MenuBar
              to="/almacen"
              iconImg="./iconAlmacen.svg"
              altText="Almacen"
              texto="Almacén"
              isSeleccionado={botonActivo === 'Almacen'}
              onClick={() => seleccionar('Almacen')}
            />
          )}

          {rol !== 'trabajador' && (
            <MenuBar
              to="/gastos"
              iconImg="./expenses.svg"
              altText="Gastos"
              texto="Gastos"
              isSeleccionado={botonActivo === 'Gastos'}
              onClick={() => seleccionar('Gastos')}
            />
          )}
          {rol !== 'trabajador' && (
            <MenuBar
              iconImg="./analisis.svg"
              altText="Análisis"
              texto="Análisis"
              disabled
            />
          )}
        </div>

        {/* Cerrar sesion al final del menu */}
        <button className="navbar-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </nav>
    </>
  )
}

export default MenuNav
