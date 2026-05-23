const ExplotacionCard = ({ nombre, iconImg, altText, ubicacion, TotalHngExplo, numParcelas, children }) => {
  return (
    <div className="explotacionCard">
      <h3>{nombre}</h3>
      <div className="cabecera-cardExplo">
        <img className="explo-icon" src={iconImg} alt={altText} />
        <p>{ubicacion}</p>
      </div>
      <div className="datos-cardExplo">
        <p>Hanegadas: {TotalHngExplo} hng</p>
        <p>Parcelas: {numParcelas}</p>
        {children}
      </div>
    </div>
  )
}

export default ExplotacionCard