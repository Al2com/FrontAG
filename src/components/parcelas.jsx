import {useEffect,useState} from 'react';
import CardInfo from './InfoPanel/InfoPanel.jsx';
import BtnCrear from './buttons/BtnCrear.jsx';
import BarraBusqueda from './BarraBusqueda/BarraBusqueda.jsx';
import parcelasService from '../services/parcelas.js';
import ParcelaCard from './InfoPanel/ParcelaCard.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import './Style/buttons.css';
import './Style/Parcelas.css'



const Parcela = () => {
 
   const [numParcelas, setNumParcelas] = useState(0);
   const [totalHng,setTotalHng] = useState(0);
    const [parcelaGot,setParGot] = useState(0);
    const [parcelaMan,setParMan] = useState(0);
    const [parResumen,setParResumen] = useState([]);
  

   useEffect (() => {
     
     parcelasService.getCount()
     .then(data =>{
      setNumParcelas(data.total)
      setTotalHng(data.totalHng)
      setParGot(data.parcelasgoteo)
      setParMan(data.parcelasmanta)

     })

     parcelasService.getResumenP()
      .then(data => {
       
       setParResumen(data)
         
      })
      .catch(err => console.error('Error al obtener resumen:', err))
   },[])

    return (
   
      <div>
        <h1>Parcelas</h1>
          <div className='menuExplo'>
            <p>Gestiona las parcelas de tus explotaciones</p> 


                  < BtnCrear 
                    to="/nueva-parcela"
                    titulo="Crear Parcela"
                    iconIng="./plusNegro.png"
                    className="btn-nueva-explotacion"
                  />
          </div> 

    <div className="primeraSeccion">
        
        <CardInfo
          iconImg="./iconParcelas.svg"
          altText="menu"
          texto="Total Parcelas"
          valor={numParcelas}
     
        />

        <CardInfo
          iconImg="./superficie.png"
          altText="Menu"
          texto="Total hectarias"
          valor={totalHng}
         
        />

        <CardInfo
          altText="Total Riego Manta"
          iconImg="./riego-manta.png"
          texto="Riego Manta"
          valor={parcelaMan}
          
        
        />
         <CardInfo
          altText="Parcelas Riego Goteo"
          iconImg="./riego-goteo.png"
          texto="Riego Goteo"
          valor={parcelaGot}
        
        />

      </div>

      <div className="filtroExplo">
            <BarraBusqueda 
            iconImg="./lupa.png"
            altText="fotoLupa"/>
         </div>
             

         {parResumen.map((parcelas,index)=>(
          <div key={index}>
            <ParcelaCard
               pol_parcela= { parcelas.pol_parcela}
               iconImg="./iconUbicacion.svg"
               altText="pick"
               explotacion={parcelas.explotacion.nombre}
               dimension_hanegadas={parcelas.dimension_hanegadas}
               rol={parcelas.rol}
               variedad={parcelas.variedad}
              //  explotacion={parcelas.explotacion.nombre}
              >
                 <BtnSubmit texto="Editar" to={`/parcelas/${parcelas.id}`} />
              </ParcelaCard>
            </div>
         ))}

    
    </div>


 
    )
}

export default Parcela