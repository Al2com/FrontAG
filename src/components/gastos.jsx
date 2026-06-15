import { useEffect, useState, Fragment } from 'react'
import gastosService from '../services/gastos'
import GestionRiego from './GestionRiego'
import './Style/cards.css'

const Gastos = () => {
  const anioActual = new Date().getFullYear()

  const [resumen, setResumen] = useState({ porExplotacion: [], porParcela: [] })
  const [campaña, setCampaña] = useState(anioActual.toString())
  const [parcelaAbierta, setParcelaAbierta] = useState(null)
  const [explotacionAbierta, setExplotacionAbierta] = useState(null)
  const [vista, setVista] = useState('resumen') // 'resumen' | 'gestion'
  const [error, setError] = useState('')

  // pido al back el resumen ya calculado cada vez que cambia la campaña
  const cargar = () => {
    setError('')
    gastosService.getResumen(campaña)
      .then(data => setResumen(data))
      .catch(() => setError('Error al cargar los gastos'))
  }

  useEffect(() => { cargar() }, [campaña])

  const anios = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3]

  const toggleParcela = (id) =>
    setParcelaAbierta(parcelaAbierta === id ? null : id)
  const toggleExplotacion = (nombre) =>
    setExplotacionAbierta(explotacionAbierta === nombre ? null : nombre)

  // vista de gestion de riego (cards con editar/borrar/añadir)
  if (vista === 'gestion') {
    return <GestionRiego onVolver={() => { setVista('resumen'); cargar() }} />
  }

  // agrupo las parcelas por explotacion para el desplegable de arriba
  const parcelasPorExplotacion = {}
  resumen.porParcela.forEach(p => {
    if (!parcelasPorExplotacion[p.explotacion]) parcelasPorExplotacion[p.explotacion] = []
    parcelasPorExplotacion[p.explotacion].push(p)
  })

  return (
    <div className="rentabilidad-contenedor">
      <div className="menuExplo">
        <div className="menu-button">
          <div className="filtro-explo">
            <div className="barra-select">
              <select value={campaña} onChange={(e) => setCampaña(e.target.value)}>
                <option value="todas">Campaña ▾</option>
                {anios.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <button type="button" onClick={() => setVista('gestion')}>Gestión de riego</button>
        </div>
      </div>

      {error && <span className="mensaje-error">{error}</span>}

      {/* resumen por explotacion */}
      <h3 className="rentabilidad-titulo-seccion">Por Explotación</h3>

      {resumen.porExplotacion.map(explo => {
        const estaAbierta = explotacionAbierta === explo.nombre
        const parcelas = parcelasPorExplotacion[explo.nombre] || []
        return (
          <div key={explo.nombre} className="rentabilidad-card">
            <div className="rentabilidad-cabecera" onClick={() => toggleExplotacion(explo.nombre)}>
              <div className="rentabilidad-cabecera-izq">
                <img src="./explotaciones.svg" alt="explotacion" />
                <h4>{explo.nombre}</h4>
              </div>
              <div className="rentabilidad-cabecera-der">
                <span className="rentabilidad-coste">{explo.coste.toFixed(2)} €</span>
                <img src="./plus.png" alt="plus" />
              </div>
            </div>

            {estaAbierta && (
              <div className="rentabilidad-desplegable">
                {parcelas.map(p => (
                  <div key={p.id} className="rentabilidad-fila-parcela">
                    <span>{p.nombre}</span>
                    <span>{p.costeTotal.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* desglose completo por parcela */}
      <h3 className="rentabilidad-titulo-seccion">Por Parcela</h3>

      {resumen.porParcela.map(parcela => {
        const estaAbierta = parcelaAbierta === parcela.id

        // agrupo el riego por concepto sumando los meses del año
        const riegoPorConcepto = {}
        parcela.riego.forEach(r => {
          riegoPorConcepto[r.concepto] = (riegoPorConcepto[r.concepto] || 0) + r.importe
        })

        return (
          <div key={parcela.id} className="rentabilidad-card">
            <div className="rentabilidad-cabecera" onClick={() => toggleParcela(parcela.id)}>
              <div className="rentabilidad-cabecera-izq">
                <img src="./parcela.svg" alt="parcela" />
                <h4>{parcela.nombre}</h4>
              </div>
              <div className="rentabilidad-cabecera-der">
                <span className="rentabilidad-coste">{parcela.costeTotal.toFixed(2)} €</span>
                <img src="./plus.png" alt="plus" />
              </div>
            </div>

            <div className="rentabilidad-resumen">
              <span>{parcela.explotacion}</span>
              <span>{parcela.variedad}</span>
            </div>

            {estaAbierta && (
              <div className="rentabilidad-desplegable">
                <table className="tabla-operaciones">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Detalle</th>
                      <th>Horas</th>
                      <th>Litros</th>
                      <th>Importe</th>
                    </tr>
                  </thead>
                  <tbody>

                    {/* operaciones agrupadas por tipo y operario */}
                    {parcela.operaciones.map(op =>
                      op.operarios.map((o, i) => (
                        <tr key={`${op.tipo}-${o.operario}`}>
                          <td style={{ textTransform: 'capitalize', fontWeight: i === 0 ? 600 : 400 }}>
                            {i === 0 ? op.tipo : ''} — {o.operario}
                          </td>
                          <td className="detalle-fechas">{o.detalle}</td>
                          <td>{o.horas.toFixed(1)} h</td>
                          <td>—</td>
                          <td>{i === 0 ? `${op.precioTipo.toFixed(2)} €` : ''}</td>
                        </tr>
                      ))
                    )}

                    <tr className="tabla-separador"><td colSpan={5}></td></tr>

                    {/* fumigaciones tractor con material debajo */}
                    {parcela.fumigacionesTractor.length === 0
                      ? (
                        <tr>
                          <td colSpan={5} style={{ fontStyle: 'italic', color: 'var(--c-texto-apagado)' }}>
                            Sin fumigaciones con tractor
                          </td>
                        </tr>
                      )
                      : parcela.fumigacionesTractor.map(fum => (
                        <Fragment key={`tractor-${fum.id}`}>
                          <tr>
                            <td>Tractor</td>
                            <td className="detalle-fechas">
                              {fum.fecha} · {fum.unidades} turbo{fum.unidades !== 1 ? 's' : ''}
                              {fum.hanegadas > 0 && ` · ${fum.hanegadas} han.`}
                            </td>
                            <td>—</td>
                            <td>{fum.litros} L</td>
                            <td>{fum.precio.toFixed(2)} €</td>
                          </tr>
                          {fum.productos.map((prod, j) => (
                            <tr key={`prod-t-${fum.id}-${j}`} className="tabla-fila-material">
                              <td>{prod.nombre}</td>
                              <td>{prod.dosis} {prod.unidad}/turbo · {prod.cantidad} {prod.unidad}</td>
                              <td>—</td>
                              <td>—</td>
                              <td>{prod.coste.toFixed(2)} €</td>
                            </tr>
                          ))}
                        </Fragment>
                      ))
                    }

                    <tr className="tabla-separador"><td colSpan={5}></td></tr>

                    {/* fumigaciones mochila con material debajo */}
                    {parcela.fumigacionesMochila.length === 0
                      ? (
                        <tr>
                          <td colSpan={5} style={{ fontStyle: 'italic', color: 'var(--c-texto-apagado)' }}>
                            Sin fumigaciones con mochila
                          </td>
                        </tr>
                      )
                      : parcela.fumigacionesMochila.map(fum => (
                        <Fragment key={`mochila-${fum.id}`}>
                          <tr>
                            <td>Mochila hierba</td>
                            <td className="detalle-fechas">
                              {fum.fecha} · {fum.operario} · {fum.unidades} mochila{fum.unidades !== 1 ? 's' : ''}
                            </td>
                            <td>{(fum.duracion_minutos / 60).toFixed(1)} h</td>
                            <td>{fum.litros} L</td>
                            <td>{fum.precio.toFixed(2)} €</td>
                          </tr>
                          {fum.productos.map((prod, j) => (
                            <tr key={`prod-m-${fum.id}-${j}`} className="tabla-fila-material">
                              <td>{prod.nombre}</td>
                              <td>{prod.dosis} {prod.unidad}/mochila · {prod.cantidad} {prod.unidad}</td>
                              <td>—</td>
                              <td>—</td>
                              <td>{prod.coste.toFixed(2)} €</td>
                            </tr>
                          ))}
                        </Fragment>
                      ))
                    }

                    {/* impuestos */}
                    {parcela.impuestos.total > 0 && (
                      <Fragment>
                        <tr className="tabla-separador"><td colSpan={5}></td></tr>
                        {parcela.impuestos.municipal > 0 && (
                          <tr>
                            <td>Impuesto municipal</td>
                            <td>Anual</td>
                            <td>—</td>
                            <td>—</td>
                            <td>{parcela.impuestos.municipal.toFixed(2)} €</td>
                          </tr>
                        )}
                        {parcela.impuestos.cequiaje > 0 && (
                          <tr>
                            <td>Cequiaje</td>
                            <td>Anual</td>
                            <td>—</td>
                            <td>—</td>
                            <td>{parcela.impuestos.cequiaje.toFixed(2)} €</td>
                          </tr>
                        )}
                      </Fragment>
                    )}

                    {/* gasto de riego agrupado por concepto */}
                    {Object.keys(riegoPorConcepto).length > 0 && (
                      <Fragment>
                        <tr className="tabla-separador"><td colSpan={5}></td></tr>
                        {Object.entries(riegoPorConcepto).map(([concepto, importe]) => (
                          <tr key={`riego-${concepto}`}>
                            <td style={{ textTransform: 'capitalize' }}>Riego · {concepto}</td>
                            <td>Recibos del año</td>
                            <td>—</td>
                            <td>—</td>
                            <td>{importe.toFixed(2)} €</td>
                          </tr>
                        ))}
                      </Fragment>
                    )}

                    {/* total */}
                    <tr className="tabla-total">
                      <td colSpan={4}><strong>TOTAL</strong></td>
                      <td><strong>{parcela.costeTotal.toFixed(2)} €</strong></td>
                    </tr>

                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Gastos
