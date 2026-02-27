

const InfoPanel = ({ texto, iconImg, altText, valor, comentario}) => {
  return (
    <div className="card">
      <div className="texto">
        <h3>{texto}</h3>
        <img className="explo-icon" src={iconImg} alt={altText} />
      </div>

      <h5 className="value">{valor}</h5>

      {/* <div>
        <p className="texto">{comentario}</p>
      </div> */}

    </div>
  );
};

export default InfoPanel