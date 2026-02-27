import '../Style/ExplotacionCard.css';
const ParcelaCard = ({pol_parcela,iconImg,altText,variedad,explotacion,dimension_hanegadas,rol,children}) =>{

    return(
        <div>
            <div className="explotacionCard ">
                <h3>Poligono-parcela: {pol_parcela}</h3>
                <div className="cabecera-cardExplo">
                    <img className="explo-icon" src={iconImg} alt={altText}/>
                   <span>{explotacion}</span>
                </div>
                <div className="datos-cardExplo">
                    <p>Dimensión Parcela:<span>{dimension_hanegadas}</span> </p>
                     <p>Tipo riego: {rol}</p>
                    <p>Variedad: {variedad}</p>
                    {children}
                </div>
            </div>
        </div>

    )
}

export default ParcelaCard