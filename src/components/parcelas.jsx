import {useEffect,useState} from 'react';
import InfoPanel from './InfoPanel/InfoPanel.jsx'
import BtnCrear from './buttons/BtnCrear.jsx';
import BarraBusqueda from './BarraBusqueda/BarraBusqueda.jsx';
import SelectComp from './BarraBusqueda/SelectComp.jsx';
import parcelasService from '../services/parcelas.js';
import ParcelaCard from './InfoPanel/ParcelaCard.jsx';
import BtnSubmit from './buttons/BtnSubmit.jsx';
import BtnEliminar from './buttons/btnEliminar.jsx';
import './Style/cards.css'
import axios from '../services/axios.js' 



const Parcela = () => {
 
   const [numParcelas, setNumParcelas] = useState(0);
   const [totalHng, setTotalHng] = useState(0);
   const [parcelaGot, setParGot] = useState(0);
   const [parcelaMan, setParMan] = useState(0);
   const [parResumen, setParResumen] = useState([]);
   const [busqueda, setBusqueda] = useState('');       
   const [filtroRiego, setFiltroRiego] = useState('todos');  
   const [filtroDimension, setFiltroDimension] = useState('todos');  
   const [errorCarga, setErrorCarga] = useState('')


  
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

       const eliminarParcela = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta parcela?')) {
      parcelasService.borrarParcela(id)
        .then(() => {
          setParResumen(parResumen.filter(p => p.id !== id))
        })
        .catch(() => setErrorCarga('Error al eliminar la parcela'))
    }
  }

   return (
     <div>
       <h1>Parcelas</h1>
       {errorCarga && <span className="mensaje-error">{errorCarga}</span>}
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
         <InfoPanel iconImg="./parcela.svg" altText="menu" texto="Total Parcelas" valor={numParcelas} />
         <InfoPanel iconImg="./dimension.svg" altText="Menu" texto="Total hectáreas" valor={totalHng} />
         <InfoPanel altText="Total Riego Manta" iconImg="./riego.svg" texto="Riego Manta" valor={parcelaMan} />
         <InfoPanel altText="Parcelas Riego Goteo" iconImg="./riegoGoteo.svg" texto="Riego Goteo" valor={parcelaGot} />
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
              <div className='card-botones'>
                <BtnSubmit texto="Editar" to={`/parcela/${parcela.id}`} />
                <BtnEliminar texto="Eliminar" onClick={() => eliminarParcela(parcela.id)} />
              </div>
            </ParcelaCard>
          </div>
        ))}
       </div>
   )
}

export default Parcela