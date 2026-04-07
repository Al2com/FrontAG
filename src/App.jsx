import { useState, useEffect } from 'react' 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import BarraMenu from './components/menuNav.jsx'
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
import Tareas from './components/tareas.jsx'
import './App.css'


function App() {

  const [user , setUser]= useState(null);


  useEffect(() => {
    const token= sessionStorage.getItem('token')

    if (token) {
        // si el usuario esta en sesion storage todavia lo recupera, es decir si hay token lo recupera
        const usuarioGuardado = JSON.parse(sessionStorage.getItem('usuario'))
        setUser(usuarioGuardado)//lo re-renderiza setUser
    }

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

        ?<FormLogin setUser={setUser} />
        : <div className="app-container">
            <BarraMenu />
            <div className="main-content">
            <header className="top-header">
              <img className="user-avatar" src="/usuario.png" alt="Usuario"/>
              <span className="user-name">{user.name}</span>
              <span className="user-rol">{user.rol}</span>
              <button className="btn-logout" onClick={logout}>Cerrar sesión</button>
            </header>
              <main className="content">
                <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/explotaciones" element={<Explotaciones />} />
              <Route path="/parcelas" element={<Parcelas />} />
              <Route path="/operaciones" element={<Operaciones />} />
              <Route path="/recoleccion" element={<Recoleccion />} />
              <Route path="/almacen" element={<Almacen />} />
              <Route path="/nueva-explotacion" element={<FormExplotacion />} />
              <Route path="/nueva-parcela" element={<FormParcela />} />
              <Route path="/nueva-operacion" element={<FormOperaciones />} />
              <Route path="/nueva-fumigacion" element={<FormFumigacion />} />
              <Route path="/tareas" element={<Tareas />} />
                </Routes>
              </main>
            </div>
          </div>
        } 
    </Router>
  )
}
  

export default App

  
             