import '../Style/barraBusqueda.css';

const BarraBusqueda = ({iconImg,altText, onChange}) => {


    return(
        
        <div className="barra-search">
            <img src={iconImg} alt={altText}/>
            <input onChange={onChange} placeholder="buscar" /> 
                        
        </div>
        
    )
}
export default BarraBusqueda