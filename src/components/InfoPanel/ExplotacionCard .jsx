
const ExplotacionCard = ({nombre,iconImg,altText,ubicacion,TotalHngExplo,numParcelas,children}) =>{

    return(
        <div>
                    <h3>{nombre}</h3>
                <div className="cabecera-cardExplo">
                    <img className="explo-icon" src={iconImg} alt={altText} />
                    <p>{ubicacion}</p>
                </div>
                <div className="datos-cardExplo">
                    <p>Hectáreas: {TotalHngExplo}hng</p>
                    <p>Parcelas: {numParcelas}</p>
                    {/* Psamos al boton hijo para  */}
                    {children}
                </div>
            </div>
  

    )
}

export default ExplotacionCard