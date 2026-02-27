import './Style/ComponetsNavStyle.css';

import InfoPanel from './InfoPanel/InfoPanel.jsx';
import Card2 from './InfoPanel/InfoPanel2.jsx';
import Btn1 from './buttons/BtnCrear.jsx';
import explotacionService from '../services/explotaciones.js';
import parcelasService from '../services/parcelas.js';
import { useEffect , useState } from 'react';

//darle una vuelta a los nombre,es decir descriptivos los nombres de los componente
const Dashboard = () => {


  const [numExplo, setNumExplo] = useState(0);//explotaciones
  const [numParcelas, setnumParcelas] = useState(0);//parcelas

//useEfect 
   useEffect(() => {
    explotacionService.getCount()
      .then(data => setNumExplo(data.total))
      .catch(err => console.error(err));//gestionar errores cunado la informacion no este disponible
  
    parcelasService.getCount()
      .then(data =>{
        setnumParcelas(data.total)
      })
  
    }, [])


  return (
    <div>
      <h1>Dashboard</h1>
      <p>Resumen general de la gestión agrícola</p>

      <div className="primeraSeccion">
        <InfoPanel
          iconImg="./iconExplotacion.svg"
          altText="Explotaciones"
          texto="Explotaciones"
          valor={numExplo}
          comentario="Total de Fincas"
        />

        <InfoPanel
          iconImg="./iconParcelas.svg"
          altText="parcelas"
          texto="Parcelas"
          valor={numParcelas}
          comentario="Total Parcelas"
        />

        <InfoPanel
          iconImg="./iconOperaciones.svg"
          altText="operaciones"
          texto="Operaciones"
          valor="34"
          comentario="Total Operaciones"
        />

        <InfoPanel
          iconImg="./iconAlmacen.svg"
          altText="Almacen"
          texto="Productos"
          valor="9"
          comentario="En almacén"
        />
      </div>

      <div className="segundaSeccion">
     
        <Card2 
        iconImg="./advertencia1.png"
        titulo="Alertas"
        texto="Requieren atención"
        textoBtn="Ver">

        <Btn1 className="BtnCard"
        titulo="Stock Bajo"
        texto="productos con stock bajo"/>

        </Card2>
     

        <Card2 
        iconImg="./advertencia1.png"
        titulo="Actividad Reciente"
        texto="Requieren atención"
        textoBtn="Ver"
        children="" >

        <Btn1
        titulo="Fumigacion"
        texto="Parcela 12/25 15/08/2025"/>

        </Card2>
          
      </div>
    </div>
  );
};

export default Dashboard;

