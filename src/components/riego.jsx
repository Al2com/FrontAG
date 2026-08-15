import { useState } from 'react'
import RiegoManta from './RiegoManta'
import GestionRiego from './GestionRiego'
import './Style/cards.css'

const Riego = () => {
  const [tab, setTab] = useState('manta') // 'manta' | 'goteo'

  return (
    <div className="rentabilidad-contenedor">
      <div className="menuExplo">
        <div className="menu-button" style={{ gap: '10px' }}>
          <button
            type="button"
            className={tab === 'manta' ? 'activo' : ''}
            onClick={() => setTab('manta')}
          >
            Riego a manta
          </button>
          <button
            type="button"
            className={tab === 'goteo' ? 'activo' : ''}
            onClick={() => setTab('goteo')}
          >
            Goteo y mantenimiento
          </button>
        </div>
      </div>

      {tab === 'manta' ? <RiegoManta /> : <GestionRiego />}
    </div>
  )
}

export default Riego
