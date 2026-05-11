import './Style/cards.css';
import InfoPanel from './InfoPanel/InfoPanel.jsx';
import InfoPanel2 from './InfoPanel/InfoPanel2.jsx';
import Btn1 from './buttons/BtnCrear.jsx';
import explotacionService from '../services/explotaciones.js';
import parcelasService from '../services/parcelas.js';
import operacionesService from '../services/operaciones.js';
import fumigacionesService from '../services/fumigaciones.js';
import tareasService from '../services/tareas.js';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [numExplo, setNumExplo] = useState(0);
  const [numParcelas, setNumParcelas] = useState(0);
  const [totalOperaciones, setTotalOperaciones] = useState(0);
  const [totalFumigaciones, setTotalFumigaciones] = useState(0);
  const [actividadReciente, setActividadReciente] = useState({ operaciones: [], fumigaciones: [] });

  useEffect(() => {
    explotacionService.getCount()
      .then(data => setNumExplo(data.total))
      .catch(err => console.error('Error explotaciones:', err));

    parcelasService.getCount()
      .then(data => setNumParcelas(data.total))
      .catch(err => console.error('Error parcelas:', err));

    operacionesService.getLista()
      .then(data => setTotalOperaciones(data.total))
      .catch(err => console.error('Error operaciones:', err));

    fumigacionesService.getLista()
      .then(data => setTotalFumigaciones(data.totalFumigaciones))
      .catch(err => console.error('Error fumigaciones:', err));

    tareasService.getActividadReciente()
      .then(data => setActividadReciente(data))
      .catch(err => console.error('Error actividad reciente:', err));

  }, [])

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Resumen general de la gestión agrícola</p>

      <div className="primeraSeccion">
        <InfoPanel iconImg="./explotaciones.svg" altText="Explotaciones" texto="Explotaciones" valor={numExplo} comentario="Total de Fincas" />
        <InfoPanel iconImg="./parcela.svg" altText="Parcelas" texto="Parcelas" valor={numParcelas} comentario="Total Parcelas" />
        <InfoPanel iconImg="./operaciones.svg" altText="Operaciones" texto="Operaciones" valor={totalOperaciones} comentario="Total Operaciones" />
        <InfoPanel iconImg="./fumigar1.svg" altText="Fumigaciones" texto="Fumigaciones" valor={totalFumigaciones} comentario="Total Fumigaciones" />
        <InfoPanel iconImg="./almacen.svg" altText="Almacen" texto="Productos" valor="9" comentario="En almacén" />
      </div>

      <div className="segundaSeccion">
        <InfoPanel2 iconImg="./advertencia1.png" titulo="Alertas" texto="Requieren atención" textoBtn="Ver">
          <Btn1 className="BtnCard" titulo="Stock Bajo" texto="productos con stock bajo"/>
        </InfoPanel2>

        <InfoPanel2 iconImg="./operaciones.svg" titulo="Actividad Reciente">
           <h3>Operaciones</h3>
          {actividadReciente.operaciones.map((op, index) => (
            <p key={index}><strong>{op.tipo_operacion}</strong> — {op.operario} — {op.estado}</p>
          ))}
          <h3>Fumigaciones</h3>
          {actividadReciente.fumigaciones.map((fum, index) => (
            <p key={index}><strong>{fum.tipo_operacion}</strong><strong>{fum.metodo_aplicacion}</strong> — {fum.operario} — {fum.estado}</p>
          ))}
        </InfoPanel2>
      </div>
    </div>
  );
};

export default Dashboard;