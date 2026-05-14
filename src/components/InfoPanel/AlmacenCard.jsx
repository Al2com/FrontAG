import '../Style/cards.css'

const AlmacenCard = ({ iconImg, altText, nombre, materia_activa, precio, ubicacion, stock_actual, unidad,children }) => {
    return (
        <div>
            <div className="almacenCard">
                <h3>{nombre}</h3>
                <div className="cabecera-cardExplo">
                    <img className="explo-icon" src={iconImg} alt={altText} />
                    <p>{ubicacion}</p>
                </div>
                <div className="datos-cardExplo">
                    <p>Materia activa: {materia_activa}</p>
                    <p>Stock actual: {stock_actual} {unidad}</p>
                    <p>Precio por unidad: {precio} €</p>
                    <p>Precio Total: {precio * stock_actual} €</p>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AlmacenCard