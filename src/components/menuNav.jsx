import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import AvatarPerfil from './AvatarPerfil'
import {
  LayoutDashboard, MapPin, Map, ClipboardList, Waves, Apple,
  Package, Receipt, NotebookPen, BarChart3, Bot, Settings, LogOut, Menu,
} from 'lucide-react'

// Secciones y enlaces de la barra lateral. soloAdmin=true oculta el enlace
// al rol trabajador (misma regla que las rutas SoloAdmin de App.jsx).
const SECCIONES = [
  {
    titulo: null,
    items: [
      { to: '/dashboard', texto: 'Dashboard', Icono: LayoutDashboard },
    ],
  },
  {
    titulo: 'Campo',
    items: [
      { to: '/explotaciones', texto: 'Explotaciones', Icono: MapPin, soloAdmin: true },
      { to: '/parcelas', texto: 'Parcelas', Icono: Map, soloAdmin: true },
      { to: '/operaciones', texto: 'Operaciones', Icono: ClipboardList },
      { to: '/riego', texto: 'Riego', Icono: Waves, soloAdmin: true },
      { to: '/recoleccion', texto: 'Recolección', Icono: Apple, soloAdmin: true },
    ],
  },
  {
    titulo: 'Gestión',
    items: [
      { to: '/almacen', texto: 'Almacén', Icono: Package, soloAdmin: true },
      { to: '/gastos', texto: 'Gastos', Icono: Receipt, soloAdmin: true },
      { to: '/cuaderno', texto: 'Cuaderno', Icono: NotebookPen, soloAdmin: true },
      { to: '/analisis', texto: 'Análisis', Icono: BarChart3, soloAdmin: true },
      { to: '/consultor', texto: 'Consultor', Icono: Bot, soloAdmin: true },
    ],
  },
  {
    titulo: 'Cuenta',
    items: [
      { to: '/configuracion', texto: 'Configuración', Icono: Settings },
    ],
  },
]

const MenuNav = ({ user, logout }) => {
  const rol = sessionStorage.getItem('rol')
  const [menuAbierto, setMenuAbierto] = useState(false)

  const cerrar = () => setMenuAbierto(false)
  const puedeVer = (item) => !item.soloAdmin || rol !== 'trabajador'

  return (
    <>
      {/* Cabecera solo visible en móvil */}
      <div className="gc-mobilebar">
        <span className="gc-mb-brand">
          <img src="./logo_gestiocamp.png" alt="" />
          GestióCamp
        </span>
        <button className="gc-hamb" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
          <Menu />
        </button>
      </div>

      <div className={`gc-overlay ${menuAbierto ? 'show' : ''}`} onClick={cerrar}></div>

      <aside className={`gc-aside ${menuAbierto ? 'open' : ''}`}>
        <div className="gc-brand">
          <img className="gc-logo" src="./logo_gestiocamp.png" alt="GestióCamp" />
          <div>
            <b>GestióCamp</b>
            <small>Gestión de fincas agrícolas</small>
          </div>
        </div>

        <nav className="gc-nav">
          {SECCIONES.map((seccion, i) => {
            const items = seccion.items.filter(puedeVer)
            if (items.length === 0) return null
            return (
              <div key={seccion.titulo ?? i}>
                {seccion.titulo && <div className="gc-sec">{seccion.titulo}</div>}
                {items.map((item) => {
                  const Icono = item.Icono
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={cerrar}
                      className={({ isActive }) => (isActive ? 'on' : undefined)}
                    >
                      <Icono />{item.texto}
                    </NavLink>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <div className="gc-user">
          <AvatarPerfil usuario={user} className="gc-av" />
          <div>
            <b>{user?.name}</b>
            <small>{user?.rol}</small>
          </div>
          <button onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión">
            <LogOut />
          </button>
        </div>
      </aside>
    </>
  )
}

export default MenuNav
