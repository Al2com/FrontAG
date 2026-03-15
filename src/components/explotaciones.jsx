import { useEffect , useState } from 'react';
import InfoPanel from './InfoPanel/InfoPanel.jsx'
import explotacionService from '../services/explotaciones.js';
import parcelasService from '../services/parcelas.js';
import BtnCrear from './buttons/BtnCrear.jsx';
import BarraBusqueda from './BarraBusqueda/BarraBusqueda.jsx';
import ExplotacionCard from './InfoPanel/ExplotacionCard .jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import SelectComp from './BarraBusqueda/SelectComp.jsx'
import './Style/ComponetsNavStyle.css';


const Explotaciones = () =>{
// useState es un hook que permite crear y manejar estado (datos que pueden cambiar) en un componente funcional.
  const [numExplo, setNumExplo] = useState(0);//explotaciones
  const [numParcelas, setNumParcelas] = useState(0);
  const [totalHng,setTotalHng] = useState(0);
  const [parcelaGot,setParGot] = useState(0);
  const [parcelaMan,setParMan] = useState(0);

 

  const [resumen,setResumen] = useState([]);


  //useEffect es un hook que ejecuta código cuando el componente se monta, actualiza o desmonta.
  
     useEffect(() => {
      
      explotacionService.getCount()
        .then(data => {
          setNumExplo(data.total)
        
     })

      parcelasService.getCount()
        .then(data => {
          setNumParcelas(data.total)
          setTotalHng(data.totalHng)
          setParGot(data.parcelasgoteo)
          setParMan(data.parcelasmanta)
          
        })
         .catch(err => console.error('Error al obtener resumen:', err))
         
        explotacionService.getResumen()
         .then(data => {
           setResumen(data)
         })
         .catch(err => console.error('Error al obtener resumen:', err))
    }, [])

        // const explotacionesFiltradas = resumen.filter(exp => exp.nombre.includes(busqueda))

    function handleFiltroTamaño(){

    }
return(

       <div>
        <h1>Explotaciones</h1>
          <div className='menuExplo'>
            <p>Gestiona tus fincas y propiedades</p>  


      
            
                <BtnCrear
                  to='/nueva-explotacion'
                  titulo="Crear Explotacion"
                  iconIng="./plusNegro.png"
                  className="btn-nueva-explotacion"
                  
                />
        
            </div> 

       
      
      

         
       
      <div className="primeraSeccion">
        <InfoPanel
          iconImg="./explotaciones.svg"
          altText="menu"
          texto="Explotaciones"
          valor={numExplo}
        />

        <InfoPanel
          iconImg="./dimension.svg"
          altText="Menu"
          texto="Total hangadas"
          valor={totalHng}
        />

        <InfoPanel
          altText="Total parcelas"
          iconImg="./riego.svg"
          texto="Riego Manta"
          valor={parcelaMan}

        />
        <InfoPanel
          altText="Parcelas Riego Goteo"
          iconImg="./riegoGoteo.svg"
          texto="Riego Goteo"
          valor={parcelaGot}

        />

         <InfoPanel
          altText="Total parcelas"
          iconImg="./parcela.svg"
          texto="Total parcelas"
          valor={numParcelas}

        />

      </div>


      <div className="filtro-explo">
      
          <div className="filtro-search">
            <BarraBusqueda 
            iconImg="./search.svg"
            altText="fotoLupa"
            />
          </div>

          <div className="filtro-select">
          <SelectComp 
            onChange={handleFiltroTamaño}
            value="Explotaciones"
            value1="maximo"
            value2="minimo"
            nombre1="Mayor tamaño"
            nombre2="Menor tamaño"
          />

           </div>

           <div className="filtro-select">
          <SelectComp 
            onChange={handleFiltroTamaño}
            value="Parcelas"
            value1="cantidad Parcelas"
            value2=""
            nombre1="Mas parcelas"
            nombre2="Menos parcelas"
          />

           </div>

      </div>

      <div className="seccion-explo">
        
        {resumen.map((explotacion,index) => (
          <div className='seccion-explo-part' key={index}>

            
        <ExplotacionCard 
    
           nombre={explotacion.nombre}
           iconImg="./explotaciones.svg" altText="Ubicacion"  
           ubicacion={explotacion.ubicacion}
           TotalHngExplo={explotacion.parcelas_sum_dimension_hanegadas}
           numParcelas={explotacion.parcelas_count}
        >
         <BtnSubmit texto="Editar" to={`/explotacion/${explotacion.id}`} />
        </ExplotacionCard>
        </div>
          ))}
      </div>

        </div>


    
)
} 

export default Explotaciones