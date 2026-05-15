const BtnEliminar = ({ onClick, texto}) => {
  return (
    <button type="button" onClick={onClick} className="btn-eliminar">
      {texto}
    </button>
  )
}

export default BtnEliminar