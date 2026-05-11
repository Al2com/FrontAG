
const ParcelaCard = ({poligono,parcela,iconImg,altText,variedad,num_arboles,explotacion,dimension_hanegadas,fecha_plantacion,rol,nombre,children}) =>{

    return(
        <div>
                <h3>Poligono-parcela: {poligono}/{parcela}</h3>
                <div className="cabecera-cardExplo">
                    <img className="explo-icon" src={iconImg} alt={altText}/>
                   <span>{explotacion}</span>
                </div>
                <div className="datos-cardExplo">
                    <p>Dimensión Parcela:<span>{dimension_hanegadas}</span> </p>
                     <p>Tipo riego: {rol}</p>
                    <p>Variedad: {variedad}</p>
                    <p>Cantidad Arboles:{num_arboles}</p>
                    <p>Año plantacion:{fecha_plantacion}</p>
                    <p>Nombre parcela : {nombre}</p>
                    {children}
                </div>
            </div>

    )
}

export default ParcelaCard