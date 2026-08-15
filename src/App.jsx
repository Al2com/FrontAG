import './components/Style/variables.css'
import './App.css'

import { useState, useEffect } from 'react' 
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import MenuNav from './components/menuNav.jsx'
import FormExplotacion from './components/CreateForm/FormExplotacion.jsx'
import FormParcela from './components/CreateForm/FormParcela.jsx'
import Dashboard from './components/dashboard.jsx'
import Explotaciones from './components/explotaciones.jsx'
import Parcelas from './components/parcelas.jsx'
import Operaciones from './components/operaciones.jsx'
import FormOperaciones from './components/CreateForm/FormOperaciones.jsx'
import Recoleccion from './components/recoleccion.jsx'
import Almacen from './components/almacen.jsx'
import FormFumigacion from './components/CreateForm/FormFumigacion.jsx'
import FormLogin from './components/CreateForm/FormLogin.jsx'
import FormProducto from './components/CreateForm/FormProducto.jsx'
import EditarExplotacion from './components/CreateForm/EditarExplotacion.jsx'
import EditarParcela from './components/CreateForm/EditarParcela.jsx'
import EditarProducto from './components/CreateForm/EditarProducto.jsx'
import EditarOperacion from './components/CreateForm/EditarOperacion.jsx'
import FormComprarProducto from './components/CreateForm/FormComprarProducto.jsx'
import EditarFumigacion from './components/CreateForm/EditarFumigacion.jsx'
import Gastos from './components/gastos.jsx'
import Riego from './components/riego.jsx'
import Analisis from './components/analisis.jsx'
import Cuaderno from './components/cuaderno.jsx'
import DetalleProducto from './components/DetalleProducto.jsx'
import FormRecoleccion from './components/CreateForm/FormRecoleccion.jsx'
import EditarRecoleccion from './components/CreateForm/EditarRecoleccion.jsx'
import FormForgotPassword from './components/CreateForm/FormForgotPassword.jsx'
import FormResetPassword from './components/CreateForm/FormResetPassword.jsx'
import Configuracion from './components/configuracion.jsx'
import { useTheme } from './hooks/useTheme.js'

// Bloquea rutas para el rol trabajador: si lo es, lo manda al dashboard.
// El trabajador solo puede acceder a Dashboard y Operaciones.
const SoloAdmin = ({ children }) => {
  const rol = sessionStorage.getItem('rol')
  return rol === 'trabajador' ? <Navigate to="/dashboard" replace /> : children
}

function App() {

  // si el usuario esta en sesion storage todavia lo recupera, es decir si hay token lo recupera.
  // lectura inicial en el propio useState (no en un efecto) para no disparar un
  // segundo render de arranque solo para pintar el usuario ya guardado
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem('token')
    return token ? JSON.parse(sessionStorage.getItem('usuario')) : null
  });
  const { sincronizarConUsuario } = useTheme()

  useEffect(() => {
    if (user) {
        sincronizarConUsuario(user)
    }
    // solo al montar: aplica el tema guardado en BD a la sesión recuperada
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('usuario')
    sessionStorage.removeItem('rol')
    setUser(null)
}


  return (
   <Router>
      {user===null

        // Sin sesión: además del login, dejamos públicas las pantallas de
        // recuperación. El enlace del correo (/reset-password?token=...) lo abre
        // un usuario deslogueado, así que tienen que ser accesibles aquí.
        ? <Routes>
            <Route path="/forgot-password" element={<FormForgotPassword />} />
            <Route path="/reset-password" element={<FormResetPassword />} />
            <Route path="*" element={<FormLogin setUser={setUser} />} />
          </Routes>
        : <div className="app-container">
            <MenuNav user={user} logout={logout} />
            <div className="main-content">
              <main className="content">
                <Routes>
              {/* accesibles para todos los roles (trabajador incluido) */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/operaciones" element={<Operaciones />} />
              <Route path="/configuracion" element={<Configuracion user={user} setUser={setUser} />} />

              {/* solo administrador: el trabajador es redirigido al dashboard */}
              <Route path="/explotaciones" element={<SoloAdmin><Explotaciones /></SoloAdmin>} />
              <Route path="/parcelas" element={<SoloAdmin><Parcelas /></SoloAdmin>} />
              <Route path="/riego" element={<SoloAdmin><Riego /></SoloAdmin>} />
              <Route path="/recoleccion" element={<SoloAdmin><Recoleccion /></SoloAdmin>} />
              <Route path="/nueva-recoleccion" element={<SoloAdmin><FormRecoleccion /></SoloAdmin>} />
              <Route path="/recoleccion/:id" element={<SoloAdmin><EditarRecoleccion /></SoloAdmin>} />
              <Route path="/almacen" element={<SoloAdmin><Almacen /></SoloAdmin>} />
              <Route path="/nueva-explotacion" element={<SoloAdmin><FormExplotacion /></SoloAdmin>} />
              <Route path="/nueva-parcela" element={<SoloAdmin><FormParcela /></SoloAdmin>} />
              <Route path="/nueva-operacion" element={<SoloAdmin><FormOperaciones /></SoloAdmin>} />
              <Route path="/nueva-fumigacion" element={<SoloAdmin><FormFumigacion /></SoloAdmin>} />
              <Route path="/nuevo-producto" element={<SoloAdmin><FormProducto /></SoloAdmin>} />
              <Route path="/comprar-producto" element={<SoloAdmin><FormComprarProducto /></SoloAdmin>} />
              <Route path="/explotacion/:id" element={<SoloAdmin><EditarExplotacion /></SoloAdmin>} />
              <Route path="/parcela/:id" element={<SoloAdmin><EditarParcela/></SoloAdmin>} />
              <Route path="/producto/:id" element={<SoloAdmin><EditarProducto/></SoloAdmin>} />
              <Route path="/producto/:id/detalle" element={<SoloAdmin><DetalleProducto/></SoloAdmin>} />
              <Route path="/operacion/:id" element={<SoloAdmin><EditarOperacion/></SoloAdmin>} />
              <Route path="/editar-fumigacion/:id" element={<SoloAdmin><EditarFumigacion /></SoloAdmin>} />
              <Route path="/gastos" element={<SoloAdmin><Gastos/></SoloAdmin>} />
              <Route path="/cuaderno" element={<SoloAdmin><Cuaderno/></SoloAdmin>} />
              <Route path="/analisis" element={<SoloAdmin><Analisis/></SoloAdmin>} />

              {/* ruta comodin: cualquier direccion no definida cae aqui */}
              <Route path="*" element={
                <div className="form-container" style={{ textAlign: 'center' }}>
                  <h1>Página no encontrada</h1>
                  <p>La dirección a la que intentas acceder no existe.</p>
                  <Link to="/dashboard">Volver al inicio</Link>
                </div>
              } />

                </Routes>
              </main>
            </div>
          </div>
        } 
    </Router>
  )
}
  

export default App

  
             