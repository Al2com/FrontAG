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
import './App.css'


function App() {

  const [user , setUser]= useState(null);


  useEffect(() => {
    const token= sessionStorage.getItem('token')

    if (token) {
        // 3. Recupero el usuario y actualizo el estado
        const usuarioGuardado = JSON.parse(sessionStorage.getItem('usuario'))
        setUser(usuarioGuardado)
    }

  }, [])


  return (
   <Router>
      {user===null

        ?<FormLogin setUser={setUser} />
        : <div className="app-container">
            <BarraMenu />
            <div className="main-content">
              <header className="top-header">...</header>
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
                </Routes>
              </main>
            </div>
          </div>
        } 
    </Router>
  )
}
  

export default App

  
             