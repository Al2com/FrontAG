const ExplotacionCard = ({ nombre, iconImg, altText, ubicacion, TotalHngExplo, numParcelas, children }) => {
  return (
    <div className="explotacionCard">
      <h3>{nombre}</h3>
      <div className="cabecera-cardExplo">
        <img className="explo-icon" src={iconImg} alt={altText} />
        <p>{ubicacion}</p>
      </div>
      <div className="datos-cardExplo">
        <p><strong>Hanegadas:</strong> <span className="num">{TotalHngExplo} hng</span></p>
        <p><strong>Parcelas:</strong> <span className="num">{numParcelas}</span></p>
        {children}
      </div>
    </div>
  )
}

export default ExplotacionCard