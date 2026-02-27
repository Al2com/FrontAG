import { Link } from 'react-router-dom'

const BtnCrear = ({ to, titulo, iconIng, altText, className }) => {
  return (
    <Link to={to}>
     <button> <img src={iconIng} alt={altText}/>{titulo}</button>
    </Link>
  )
}

export default BtnCrear