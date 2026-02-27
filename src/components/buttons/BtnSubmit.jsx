import { Link } from "react-router-dom"
const BntSubmit = ({ texto,to }) => {
  return (
    <Link to={to} className="router-link">
    <button type="submit">
      {texto}
    </button>
    </Link>
  )
}

export default BntSubmit