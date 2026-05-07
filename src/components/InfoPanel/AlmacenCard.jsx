


const AlmacenCard = ({iconImg, altText, nombre, precio, ubicacion, stock_actual, unidad, children}) => {
    return(
        <div>
            <div className="almacenCard">
                <h3>{nombre}</h3>
                <div className="cabecera-cardExplo">
                    <img className="explo-icon" src={iconImg} alt={altText} />
                    <p>{ubicacion}</p>
                </div>
                <div className="datos-cardExplo">
                    <p>Stock actual: {stock_actual} {unidad}</p>
                    <p>Precio: {precio} €</p>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AlmacenCard