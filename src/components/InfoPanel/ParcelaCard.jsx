import '../Style/ExplotacionCard.css';
const ParcelaCard = ({poligono,parcela,iconImg,altText,variedad,num_arboles,explotacion,dimension_hanegadas,fecha_plantacion,rol,children}) =>{

    return(
        <div>
            <div className="explotacionCard ">
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
                    {children}
                </div>
            </div>
        </div>

    )
}

export default ParcelaCard