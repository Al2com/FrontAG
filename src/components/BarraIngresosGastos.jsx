// Barra horizontal de rentabilidad de la parcela seleccionada: los ingresos de
// recoleccion frente a los gastos totales del año, ambos a la misma escala
// (el mayor de los dos ocupa el 100%) para que se comparen de un vistazo.
// La ganancia neta y el margen vienen ya calculados del back
// (AnalisisController::resumenFinanciero), que es la unica fuente de verdad.
const formatoEuro = (valor) => (valor === null || valor === undefined ? '-' : `${valor.toFixed(2)} €`)

const BarraIngresosGastos = ({ ingresos, gastos, gananciaNeta, margen, sinDatos }) => {
  const maximo = Math.max(ingresos ?? 0, gastos ?? 0)
  const porcentaje = (valor) => (maximo > 0 ? Math.max((valor / maximo) * 100, 1) : 0)
  const positiva = (gananciaNeta ?? 0) >= 0

  return (
    <div className="barra-ingresos-gastos">
      <div className="barra-ingresos-gastos-fila">
        <span className="barra-ingresos-gastos-etiqueta">Ingresos</span>
        <div className="barra-ingresos-gastos-pista">
          <div
            className="barra-ingresos-gastos-relleno barra-ingresos-gastos-relleno--ingresos"
            style={{ width: `${porcentaje(ingresos ?? 0)}%` }}
          />
        </div>
        <span className="barra-ingresos-gastos-valor">{formatoEuro(ingresos)}</span>
      </div>

      <div className="barra-ingresos-gastos-fila">
        <span className="barra-ingresos-gastos-etiqueta">Gastos</span>
        <div className="barra-ingresos-gastos-pista">
          <div
            className="barra-ingresos-gastos-relleno barra-ingresos-gastos-relleno--gastos"
            style={{ width: `${porcentaje(gastos ?? 0)}%` }}
          />
        </div>
        <span className="barra-ingresos-gastos-valor">{formatoEuro(gastos)}</span>
      </div>

      <div className={`barra-ingresos-gastos-neto ${positiva ? 'es-positivo' : 'es-negativo'}`}>
        <span>Ganancia neta</span>
        <span>
          {formatoEuro(gananciaNeta)}
          {sinDatos || margen === null || margen === undefined ? '' : ` · margen ${margen.toFixed(2)}%`}
        </span>
      </div>

      {sinDatos && (
        <p className="rentabilidad-vacio">Sin recolección o sin gastos registrados: el margen no se calcula.</p>
      )}
    </div>
  )
}

export default BarraIngresosGastos
