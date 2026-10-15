import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ShoppingCart } from 'lucide-react'
import almacenService from '../services/almacen.js'
import ModalDetalleProducto from './Almacen/ModalDetalleProducto.jsx'
import ModalComprar from './Almacen/ModalComprar.jsx'
import './Style/almacen.css'

// estado del stock: agotado / bajo / ok
const nivel = (p) => {
  const stock = Number(p.stock)
  const minimo = Number(p.minimo)
  if (stock === 0) return { clase: 't-red', texto: 'Agotado', color: 'var(--c-peligro)' }
  if (stock < minimo) return { clase: 't-amb', texto: 'Bajo', color: 'var(--estado-pendiente)' }
  return { clase: 't-grn', texto: 'OK', color: 'var(--estado-realizado)' }
}

// una fila de producto, con barra de stock y marca del mínimo
const Fila = ({ p, modo, onClick }) => {
  const est = nivel(p)
  const u = p.unidad || ''
  const escala = Number(p.maximo) > 0 ? Number(p.maximo) : Number(p.minimo) * 2 || 1
  const fill = Math.min(100, (Number(p.stock) / escala) * 100)
  const marca = Math.min(100, (Number(p.minimo) / escala) * 100)

  return (
    <div className="alm-fila" onClick={onClick}>
      <div className="alm-prod">
        <span className="alm-n">{p.nombre}</span>
        {p.categoria && <span className="alm-cat">{p.categoria}</span>}
      </div>
      <div className="alm-stock">
        <b>{p.stock} {u}</b>
        <small>mínimo {p.minimo} {u}</small>
      </div>
      <div className="alm-nivel">
        <div className="alm-bar">
          <i style={{ width: `${Math.max(fill, 2)}%`, background: est.color }} />
          <span className="alm-marca" style={{ left: `${marca}%` }} />
        </div>
      </div>
      <div className="alm-estado"><span className={`gc-tag ${est.clase}`}>{est.texto}</span></div>
      <div className="alm-consumo">
        {modo === 'frecuente' ? (
          <>
            <b>{p.consumo_anual} {u}</b>
            <small>{p.operaciones_count} usos</small>
          </>
        ) : (
          p.ultimo_uso || '—'
        )}
      </div>
    </div>
  )
}

// una tarjeta (Frecuentes / Menos frecuentes)
const Tarjeta = ({ titulo, desc, orden, items, modo, onAbrir }) => (
  <section className="gc-card">
    <div className="gc-ch">
      <h2>{titulo}<span className="c">{items.length}</span></h2>
      <span style={{ fontSize: 11, color: 'var(--c-texto-apagado)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{orden}</span>
    </div>
    <div style={{ fontSize: 12, color: 'var(--c-texto-apagado)', padding: '0 20px 8px' }}>{desc}</div>
    <div className="alm-fila-head">
      <div>Producto</div><div>Stock</div><div>Nivel</div><div>Estado</div>
      <div style={{ textAlign: 'right' }}>{modo === 'frecuente' ? 'Consumo' : 'Último uso'}</div>
    </div>
    {items.length === 0
      ? <div className="alm-vacio">Sin productos</div>
      : items.map(p => <Fila key={p.id} p={p} modo={modo} onClick={() => onAbrir(p)} />)}
  </section>
)

const Almacen = () => {
  const [datos, setDatos] = useState({ frecuentes: [], menos_frecuentes: [] })
  const [error, setError] = useState('')
  const [detalle, setDetalle] = useState(null)          // producto cuyo detalle se ve
  const [comprar, setComprar] = useState(null)          // { productoId } o {} para abrir el form

  const cargar = () => {
    almacenService.getClasificado()
      .then(data => setDatos(data))
      .catch(() => setError('No se pudieron cargar los productos del almacén.'))
  }

  useEffect(() => { cargar() }, [])

  const todos = [...datos.frecuentes, ...datos.menos_frecuentes]
  const bajos = todos.filter(p => Number(p.stock) <= Number(p.minimo)).length

  // tras registrar una compra se recarga (el stock cambió) y se cierra todo
  const trasComprar = () => {
    cargar()
    setComprar(null)
    setDetalle(null)
  }

  return (
    <>
      <header className="alm-head">
        <div>
          <h1>Almacén</h1>
          <div className="sub">{todos.length} productos · {bajos} bajo mínimo</div>
        </div>
        <div className="alm-acts">
          <Link className="gc-btn" to="/nuevo-producto"><Plus />Nuevo producto</Link>
          <button className="gc-btn pri" onClick={() => setComprar({})}><ShoppingCart />Comprar</button>
        </div>
      </header>

      {error && <span className="mensaje-error">{error}</span>}

      <div className="alm-stack">
        <Tarjeta
          titulo="Frecuentes"
          desc={`Productos con consumo este año (${new Date().getFullYear()})`}
          orden="Orden por consumo"
          items={datos.frecuentes}
          modo="frecuente"
          onAbrir={setDetalle}
        />
        <Tarjeta
          titulo="Menos frecuentes"
          desc="Productos sin consumo este año — se mantienen en catálogo"
          orden="Orden alfabético"
          items={datos.menos_frecuentes}
          modo="menos"
          onAbrir={setDetalle}
        />
      </div>

      {detalle && (
        <ModalDetalleProducto
          producto={detalle}
          onCerrar={() => setDetalle(null)}
          onComprar={(id) => { setDetalle(null); setComprar({ productoId: id }) }}
        />
      )}

      {comprar && (
        <ModalComprar
          productos={todos}
          productoId={comprar.productoId || ''}
          onCerrar={() => setComprar(null)}
          onGuardado={trasComprar}
        />
      )}
    </>
  )
}

export default Almacen
