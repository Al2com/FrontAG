// barra semaforo horizontal reutilizable: degradado continuo rojo->naranja->
// verde/azul claro->azul oscuro, con un marcador en la posicion exacta (0-100).
// El significado de "posicion" (que extremo es "bueno") lo decide quien la usa:
// en rentabilidad, 100% = azul = mejor valor; en consumo, 100% = azul = menor
// consumo. La polaridad ('positiva'|'neutra'|'negativa') solo colorea la etiqueta.
const BarraSemaforo = ({ titulo, posicion, etiqueta, polaridad, sinDatos = false, mensajeSinDatos }) => {
  if (sinDatos) {
    return (
      <div className="rentabilidad-barra-bloque">
        {titulo && <div className="rentabilidad-barra-titulo">{titulo}</div>}
        <div className="rentabilidad-barra">
          <span className="rentabilidad-barra-etiqueta rentabilidad-barra-etiqueta--sin-datos">
            {mensajeSinDatos}
          </span>
        </div>
      </div>
    )
  }

  const pos = Math.min(100, Math.max(0, posicion))

  return (
    <div className="rentabilidad-barra-bloque">
      {titulo && <div className="rentabilidad-barra-titulo">{titulo}</div>}
      <div className="rentabilidad-barra">
        <div className="rentabilidad-barra-pista-wrap">
          <div
            className="rentabilidad-barra-marcador"
            style={{ left: `${pos}%` }}
            role="img"
            aria-label={`${etiqueta} (posición ${pos.toFixed(0)} de 100)`}
          />
          <div className="rentabilidad-barra-pista" />
        </div>
        <span className={`rentabilidad-barra-etiqueta rentabilidad-barra-etiqueta--${polaridad}`}>
          {etiqueta}
        </span>
      </div>
    </div>
  )
}

export default BarraSemaforo
