

const Card2 = ({ titulo, iconImg,altText,texto,children }) => {
  return (
    <div className="card2">
      <div className="tituloCard2">
        <img src={iconImg} alt={altText}/>
        <h4>{titulo}</h4>
      </div>
      <p>{texto}</p>
{/* Psamos al boton hijo para  */}
      {children}

    </div>
  );
};

export default Card2