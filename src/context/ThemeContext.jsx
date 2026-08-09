import { useEffect, useState } from 'react'
import settingsService from '../services/settings'
import { ThemeContext } from './themeContextObjeto.js'

const TEMAS_VALIDOS = ['claro', 'oscuro']
const leerTemaGuardado = () => {
    const guardado = localStorage.getItem('tema')
    return TEMAS_VALIDOS.includes(guardado) ? guardado : 'claro'
}

// Envuelve toda la app (ver main.jsx) para que el tema se pueda cambiar
// desde Configuración pero se aplique al instante en cualquier pantalla.
export const ThemeProvider = ({ children }) => {
    const [tema, setTema] = useState(leerTemaGuardado)

    // aplica el atributo en <html> cada vez que cambia el tema: de aquí
    // cuelgan todas las reglas [data-tema="oscuro"] de variables.css
    useEffect(() => {
        document.documentElement.setAttribute('data-tema', tema)
        localStorage.setItem('tema', tema)
    }, [tema])

    // cambia el tema ya mismo (localStorage) y, si hay sesión, lo manda
    // al back para que viaje entre dispositivos. Si falla la petición no
    // deshacemos el cambio visual: es una preferencia, no algo crítico.
    const cambiarTema = (nuevoTema) => {
        setTema(nuevoTema)
        if (sessionStorage.getItem('token')) {
            settingsService.actualizarTema(nuevoTema).catch(() => {})
        }
    }

    const alternarTema = () => cambiarTema(tema === 'oscuro' ? 'claro' : 'oscuro')

    // se llama tras el login: el tema guardado en BD manda sobre el local,
    // así el usuario ve siempre su preferencia aunque cambie de dispositivo
    const sincronizarConUsuario = (usuario) => {
        if (usuario?.tema && TEMAS_VALIDOS.includes(usuario.tema)) {
            setTema(usuario.tema)
        }
    }

    return (
        <ThemeContext.Provider value={{ tema, cambiarTema, alternarTema, sincronizarConUsuario }}>
            {children}
        </ThemeContext.Provider>
    )
}
