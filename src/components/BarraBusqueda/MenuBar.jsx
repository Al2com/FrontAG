import { Link } from 'react-router-dom';
import '../Style/navbar.css';


const MenuBar =({to,texto,iconImg,altText,isSeleccionado, onClick, disabled}) =>{

  // item deshabilitado: se ve en gris y no navega (pendiente de implementar)
  if (disabled) {
    return (
      <div className="menu-item menu-item-disabled" title="Próximamente" aria-disabled="true">
        <img className='iconMenu' src={iconImg} alt={altText} />
        <span className='textMenu'>{texto}</span>
      </div>
    )
  }

  return(

  <Link to={to} className="router-link">
  <div className={`menu-item ${isSeleccionado ? 'activeMenu' : ''}`} onClick={onClick}>
        <img className='iconMenu' src={iconImg} alt={altText} />
        <span className='textMenu'>{texto}</span>
  </div>
    </Link>
  )

}

export default MenuBar