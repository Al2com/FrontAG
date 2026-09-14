import Pill from '../Pill.jsx'

const ParcelaCard = ({ poligono, parcela, iconImg, altText, variedad, num_arboles, explotacion, dimension_hanegadas, fecha_plantacion, rol, nombre, children }) => {
  return (
    <div className="explotacionCard">
      <div className="cabecera-cardExplo" style={{ justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--esp-xs)' }}>
          <img className="explo-icon" src={iconImg} alt={altText} />
          {explotacion}
        </span>
        <Pill texto={rol === 'goteo' ? 'Goteo' : 'Manta'} tono={rol === 'goteo' ? 'info' : 'aviso'} />
      </div>
      <h3>Pol. {poligono} - Par. {parcela}{nombre ? ` · ${nombre}` : ''}</h3>
      <div className="datos-cardExplo">
        <p><strong>Hanegadas:</strong> <span className="num">{dimension_hanegadas}</span></p>
        <p><strong>Variedad:</strong> {variedad}</p>
        <p><strong>Árboles:</strong> <span className="num">{num_arboles}</span></p>
        <p><strong>Año plantación:</strong> <span className="num">{fecha_plantacion}</span></p>
        {children}
      </div>
    </div>
  )
}

export default ParcelaCard