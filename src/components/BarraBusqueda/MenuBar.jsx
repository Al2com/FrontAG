import { Link } from 'react-router-dom';
import '../Style/menuNav.css';


const MenuBar =({to,texto,iconImg,altText,isSeleccionado, onClick}) =>{


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