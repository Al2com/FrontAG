import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import BarraMenu from './components/menuNav.jsx'
import FormExplotacion from './components/CreateForm/FormExplotacion.jsx'
import FormParcela from './components/CreateForm/FormParcela.jsx'
import Dashboard from './components/Dashboard.jsx'
import Explotaciones from './components/explotaciones.jsx'
import Parcelas from './components/parcelas.jsx'
import Operaciones from './components/operaciones.jsx'
import FormOperaciones from './components/CreateForm/FormOperaciones.jsx'
import Recoleccion from './components/recoleccion.jsx'
import Almacen from './components/almacen.jsx'

import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <BarraMenu />
        <div className="main-content">
      
          <header className="top-header">
            <div className="header-left">
              <img className='user-login' src="/logo_inicio.gif" alt="Inicio"/>
            </div>
            
            <div className="header-right">
              <img className='user-avatar' src="/usuario.png" alt="Usuario"/>
              <span className="user-name">Usuario</span>
            </div>
          </header>
     
          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/explotaciones" element={<Explotaciones />} />
              <Route path="/parcelas" element={<Parcelas />} />
              <Route path="/operaciones" element={<Operaciones />} />
              <Route path="/recoleccion" element={<Recoleccion />} />
              <Route path="/almacen" element={<Almacen />} />
              <Route path="/nueva-explotacion" element={<FormExplotacion />} />
              <Route path="/nueva-parcela" element={<FormParcela />} />
              <Route path="/nueva-operacion" element={<FormOperaciones />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App