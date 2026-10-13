// Celda KPI del sistema GestióCamp (misma apariencia que la franja del
// dashboard). Mantiene la firma antigua (iconImg/altText/texto/valor) para
// no tener que tocar cada pantalla que lo usa.
const InfoPanel = ({ texto, iconImg, altText, valor }) => {
  return (
    <div className="gc-kpi">
      <span className="l">
        {iconImg && <img src={iconImg} alt={altText || ''} />}
        {texto}
      </span>
      <span className="v">{valor}</span>
    </div>
  );
};

export default InfoPanel
