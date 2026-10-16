import { useState, useEffect } from 'react'
import { X, ShoppingCart } from 'lucide-react'
import productosService from '../../services/productos.js'
import '../Style/almacen.css'

// color de la barra según el estado del stock
const colorStock = (p) => {
  if (Number(p.stock) === 0) return 'var(--c-peligro)'
  if (Number(p.stock) < Number(p.minimo)) return 'var(--estado-pendiente)'
  return 'var(--estado-realizado)'
}

const ModalDetalleProducto = ({ producto, onCerrar, onComprar, onAjustado }) => {
  const [hist, setHist] = useState(null)
  const [tab, setTab] = useState('compras')
  const [error, setError] = useState('')
  // stock local: se actualiza en vivo al ajustar (regularizar inventario)
  const [stock, setStock] = useState(producto.stock)
  const [ajustando, setAjustando] = useState(false)
  const [valor, setValor] = useState('')
  const [guardandoAjuste, setGuardandoAjuste] = useState(false)
  const [errorAjuste, setErrorAjuste] = useState('')

  useEffect(() => {
    productosService.getHistorial(producto.id)
      .then(setHist)
      .catch(() => setError('No se pudo cargar el historial.'))
  }, [producto.id])

  useEffect(() => {
    const alPulsar = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [onCerrar])

  const u = producto.unidad || ''
  const escala = Number(producto.maximo) > 0 ? Number(producto.maximo) : Number(producto.minimo) * 2 || 1
  const fill = Math.min(100, (Number(stock) / escala) * 100)
  const marca = Math.min(100, (Number(producto.minimo) / escala) * 100)

  // regulariza el inventario: fija el stock al valor contado
  const guardarAjuste = () => {
    if (valor === '' || Number(valor) < 0) { setErrorAjuste('Introduce un stock válido.'); return }
    setGuardandoAjuste(true)
    setErrorAjuste('')
    productosService.ajustarStock(producto.id, Number(valor))
      .then(res => { setStock(res.stock_actual); setAjustando(false); onAjustado?.() })
      .catch(() => setErrorAjuste('No se pudo ajustar el stock.'))
      .finally(() => setGuardandoAjuste(false))
  }

  const compras = hist?.compras ?? []
  const usos = hist?.usos ?? []
  const gastado = compras.reduce((s, c) => s + (Number(c.importe_total) || 0), 0)
  const consumido = usos.reduce((s, x) => s + (Number(x.cantidad) || 0), 0)

  return (
    <div className="fondo-modal" onClick={onCerrar}>
      <div className="alm-modal" onClick={e => e.stopPropagation()}>
        <div className="alm-modal-head">
          <div>
            <h2>{producto.nombre}</h2>
            {producto.categoria && <div className="cat">{producto.categoria}</div>}
          </div>
          <button className="alm-modal-cerrar" onClick={onCerrar} aria-label="Cerrar" title="Cerrar"><X /></button>
        </div>

        <div className="alm-modal-stock">
          <div>
            {ajustando ? (
              <div className="alm-ajuste">
                <input
                  type="number" step="0.01" min="0" value={valor}
                  onChange={e => setValor(e.target.value)} autoFocus
                />
                <button onClick={guardarAjuste} disabled={guardandoAjuste}>
                  {guardandoAjuste ? '…' : 'Guardar'}
                </button>
                <button className="btn-cancel" onClick={() => { setAjustando(false); setErrorAjuste('') }}>Cancelar</button>
              </div>
            ) : (
              <div className="big">{stock} <small>{u} en almacén</small></div>
            )}
            <div className="cap">
              mínimo {producto.minimo} {u}{producto.maximo != null ? ` · máximo ${producto.maximo} ${u}` : ''}
              {!ajustando && (
                <button className="alm-ajuste-link" onClick={() => { setValor(String(stock)); setAjustando(true) }}>
                  Ajustar
                </button>
              )}
            </div>
            {errorAjuste && <div className="mensaje-error" style={{ fontSize: 12 }}>{errorAjuste}</div>}
          </div>
          <div className="barwrap">
            <div className="alm-bar">
              <i style={{ width: `${Math.max(fill, 2)}%`, background: colorStock({ stock, minimo: producto.minimo }) }} />
              <span className="alm-marca" style={{ left: `${marca}%` }} />
            </div>
            <div className="foot">
              <span>0</span>
              <span>mín. {producto.minimo}{u}</span>
              {producto.maximo != null && <span>{producto.maximo}{u}</span>}
            </div>
          </div>
        </div>

        <div className="alm-tabs">
          <button className={`alm-tab ${tab === 'compras' ? 'on' : ''}`} onClick={() => setTab('compras')}>
            Compras <span className="n">{compras.length ? `(${compras.length})` : ''}</span>
          </button>
          <button className={`alm-tab ${tab === 'usos' ? 'on' : ''}`} onClick={() => setTab('usos')}>
            Usos <span className="n">{usos.length ? `(${usos.length})` : ''}</span>
          </button>
        </div>

        <div className="alm-pane">
          {error && <div className="alm-vacio">{error}</div>}
          {!hist && !error && <div className="alm-vacio">Cargando…</div>}

          {hist && tab === 'compras' && (compras.length === 0
            ? <div className="alm-vacio">Sin compras este año</div>
            : compras.map((c, i) => (
              <div className="alm-hist" key={`c${i}`}>
                <div className="fecha">{c.fecha}</div>
                <div className="donde">{c.proveedor || '—'}<small>Entrada de stock</small></div>
                <div className="qty pos">+{c.cantidad} {u}</div>
                <div className="extra">{c.importe_total != null ? `${Number(c.importe_total).toFixed(2)} €` : '—'}</div>
              </div>
            )))}

          {hist && tab === 'usos' && (usos.length === 0
            ? <div className="alm-vacio">Sin usos este año</div>
            : usos.map((x, i) => (
              <div className="alm-hist" key={`u${i}`}>
                <div className="fecha">{x.fecha}</div>
                <div className="donde">
                  {x.parcela ? `Pol. ${x.parcela.poligono} · Par. ${x.parcela.parcela}` : '—'}
                  <small style={{ textTransform: 'capitalize' }}>{x.tipo_operacion}</small>
                </div>
                <div className="qty neg">−{x.cantidad} {u}</div>
                <div className="extra"></div>
              </div>
            )))}
        </div>

        <div className="alm-modal-foot">
          <div className="total">
            Gastado este año: <b>{gastado.toFixed(2)} €</b> · Consumido: <b>{consumido} {u}</b>
          </div>
          <button onClick={() => onComprar(producto.id)}>
            <ShoppingCart style={{ width: 16, height: 16 }} />Comprar más
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalDetalleProducto
