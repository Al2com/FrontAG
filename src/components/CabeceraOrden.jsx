// cabecera de columna ordenable, compartida por todas las tablas de
// listado (Operaciones, Fumigaciones, Explotaciones, Parcelas, Almacén,
// Recolección): recibe el hook useOrdenTabla ya instanciado por la página
const CabeceraOrden = ({ orden, clave, children }) => {
  const activa = orden.columna === clave
  return (
    <th className={`ordenable ${activa ? 'ordenable--activa' : ''}`} onClick={() => orden.alternarOrden(clave)}>
      {children}
      <span className="indicador-orden">{activa ? (orden.direccion === 1 ? '▲' : '▼') : '↕'}</span>
    </th>
  )
}

export default CabeceraOrden
