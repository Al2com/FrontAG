import {useEffect,useState} from 'react';
import CardInfo from './InfoPanel/InfoPanel.jsx';
import BtnCrear from './buttons/BtnCrear.jsx';
import BarraBusqueda from './BarraBusqueda/BarraBusqueda.jsx';
import SelectComp from './BarraBusqueda/SelectComp.jsx';
import parcelasService from '../services/parcelas.js';
import ParcelaCard from './InfoPanel/ParcelaCard.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import './Style/buttons.css';
import './Style/Parcelas.css';

const Parcela = () => {
 
   const [numParcelas, setNumParcelas] = useState(0);
   const [totalHng, setTotalHng] = useState(0);
   const [parcelaGot, setParGot] = useState(0);
   const [parcelaMan, setParMan] = useState(0);
   const [parResumen, setParResumen] = useState([]);
   const [busqueda, setBusqueda] = useState('');       
   const [filtroRiego, setFiltroRiego] = useState('todos');  
   const [filtroDimension, setFiltroDimension] = useState('todos');  
  
   useEffect(() => {
     parcelasService.getCount()
       .then(data => {
         setNumParcelas(data.total)
         setTotalHng(data.totalHng)
         setParGot(data.parcelasgoteo)
         setParMan(data.parcelasmanta)
       })

     parcelasService.getResumenP()
       .then(data => setParResumen(data))
       .catch(err => console.error('Error al obtener resumen:', err))
   }, [])

   const rol = sessionStorage.getItem('rol')

   const parcelasFiltradas = parResumen
     .filter(p => p.variedad.toLowerCase().includes(busqueda.toLowerCase()))
     .filter(p => filtroRiego === 'todos' || p.rol === filtroRiego)
     .sort((a, b) => {
       if (filtroDimension === 'maximo') return b.dimension_hanegadas - a.dimension_hanegadas
       if (filtroDimension === 'minimo') return a.dimension_hanegadas - b.dimension_hanegadas
       return 0
     })

   return (
     <div>
       <h1>Parcelas</h1>
       <div className='menuExplo'>
         <p>Gestiona las parcelas de tus explotaciones</p> 
    
           <BtnCrear 
             to="/nueva-parcela"
             titulo="Crear Parcela"
             iconIng="./plusNegro.png"
             className="btn-nueva-explotacion"
           />
   
       </div> 

       <div className="primeraSeccion">
         <CardInfo iconImg="./parcela.svg" altText="menu" texto="Total Parcelas" valor={numParcelas} />
         <CardInfo iconImg="./dimension.svg" altText="Menu" texto="Total hectáreas" valor={totalHng} />
         <CardInfo altText="Total Riego Manta" iconImg="./riego.svg" texto="Riego Manta" valor={parcelaMan} />
         <CardInfo altText="Parcelas Riego Goteo" iconImg="./riegoGoteo.svg" texto="Riego Goteo" valor={parcelaGot} />
       </div>

       <div className="filtro-explo">
         <div className="filtro-search">
           <BarraBusqueda 
             iconImg="./search.svg"
             altText="fotoLupa"
             onChange={(e) => setBusqueda(e.target.value)}
           />
         </div>
         <div className="filtro-select">
           <SelectComp
             onChange={(e) => setFiltroRiego(e.target.value)}
             value1="goteo"
             value2="manta"
             nombre1="Goteo"
             nombre2="Manta"
           />
         </div>
         <div className="filtro-select">
           <SelectComp
             onChange={(e) => setFiltroDimension(e.target.value)}
             value1="maximo"
             value2="minimo"
             nombre1="Mayor dimensión"
             nombre2="Menor dimensión"
           />
         </div>
       </div>

       <div className="seccion-explo">
         {parcelasFiltradas.map((parcela, index) => (
           <div className='seccion-explo-part' key={index}>
             <ParcelaCard 
               poligono={parcela.poligono}
               parcela={parcela.parcela}
               iconImg="./parcela.svg"
               altText="pick"
               explotacion={parcela.explotacion.nombre}
               dimension_hanegadas={parcela.dimension_hanegadas}
               rol={parcela.rol}
               variedad={parcela.variedad}
               num_arboles={parcela.num_arboles}
               fecha_plantacion={parcela.fecha_plantacion}
               nombre={parcela.nombre}
             >
               <BtnSubmit texto="Editar" to={`/parcela/${parcela.id}`} />
             </ParcelaCard>
           </div>
         ))}
       </div>

     </div>
   )
}

export default Parcela