import '../Style/barraBusqueda.css';

const BarraBusqueda = ({iconImg,altText,texto}) => {


    return(
        
        <div className="barraMenu">
            <img src={iconImg} alt={altText}/>
        </div>
        
    )
}
export default BarraBusqueda