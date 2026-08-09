import { useContext } from 'react'
import { ThemeContext } from '../context/themeContextObjeto.js'

export const useTheme = () => useContext(ThemeContext)
