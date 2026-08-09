import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import productosService from '../services/productos.js'
import comprasService from '../services/compras.js'
import proveedoresService from '../services/proveedores.js'
import InfoPanel from './InfoPanel/InfoPanel.jsx'
import './Style/cards.css'
import './Style/forms.css'
import './Style/search.css'
import './Style/detalleProducto.css'

const euro = (valor) => `${(Number(valor) || 0).toFixed(2)} €`
const fecha = (str) => {
    if (!str) return '—'
    const d = new Date(str)
    return isNaN(d) ? str : d.toLocaleDateString('es-ES')
}
// recharts no formatea con Intl por si solo: XAxis de meses "2026-07" -> "jul 2026"
const mesLegible = (aaaaMm) => {
    const [anio, mes] = aaaaMm.split('-')
    const d = new Date(Number(anio), Number(mes) - 1, 1)
    return d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
}

const DetalleProducto = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [producto, setProducto] = useState(null)
    const [proveedores, setProveedores] = useState([])
    const [compras, setCompras] = useState([])
    const [resumen, setResumen] = useState(null)
    const [error, setError] = useState('')

    const [filtros, setFiltros] = useState({ desde: '', hasta: '', proveedor_id: '' })

    useEffect(() => {
        productosService.getProducto(id).then(setProducto).catch(() => {})
        proveedoresService.getProveedores().then(setProveedores).catch(() => {})
    }, [id])

    // el histórico y el resumen se recalculan solos al cambiar cualquier filtro
    useEffect(() => {
        const filtrosActivos = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''))

        Promise.all([
            comprasService.getHistorialProducto(id, filtrosActivos),
            comprasService.getResumenProducto(id, filtrosActivos),
        ])
            .then(([historial, agregados]) => {
                setError('')
                setCompras(historial)
                setResumen(agregados)
            })
            .catch(() => setError('No se pudo cargar el histórico de compras'))
    }, [id, filtros])

    const cambiarFiltro = (e) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value })
    }

    // si el rango de fechas elegido cabe en ~14 meses, el desglose mensual es
    // más útil que el anual; si no hay filtro o es más amplio, mejor por año
    const usarDesgloseMensual = filtros.desde && filtros.hasta &&
        (new Date(filtros.hasta) - new Date(filtros.desde)) / (1000 * 60 * 60 * 24 * 30) <= 14

    return (
        <div className="form-container">
            <div className="detalle-producto-cabecera">
                <h1>{producto ? producto.nombre : 'Detalle de producto'}</h1>
                <button type="button" onClick={() => navigate('/almacen')}>Volver al almacén</button>
            </div>

            {error && <span className="mensaje-error">{error}</span>}

            {producto && (
                <p className="texto-ayuda">
                    {producto.materia_activa} · Stock actual: {producto.stock_actual} {producto.unidad} · Precio actual: {euro(producto.precio)}/{producto.unidad}
                </p>
            )}

            {/* filtros: fecha y proveedor, en una sola fila como pide el patrón de filtros del resto de la app */}
            <div className="menuExplo">
                <div className="menu-button">
                    <div className="filtro-explo">
                        <label className="texto-ayuda">Desde</label>
                        <input type="date" name="desde" value={filtros.desde} onChange={cambiarFiltro} />
                        <label className="texto-ayuda">Hasta</label>
                        <input type="date" name="hasta" value={filtros.hasta} onChange={cambiarFiltro} />
                        <div className="barra-select">
                            <select name="proveedor_id" value={filtros.proveedor_id} onChange={cambiarFiltro}>
                                <option value="">Todos los proveedores</option>
                                {proveedores.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre_comercial || p.nombre_empresa}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {resumen && (
                <>
                    {/* indicadores: mismo componente/estilo que las tarjetas del dashboard */}
                    <div className="primeraSeccion">
                        <InfoPanel texto="Gasto total" iconImg="./expenses.svg" altText="gasto" valor={euro(resumen.gasto_total)} />
                        <InfoPanel texto="Precio medio" iconImg="./iconAlmacen.svg" altText="medio" valor={euro(resumen.precio_medio)} />
                        <InfoPanel texto="Precio mínimo" iconImg="./iconAlmacen.svg" altText="minimo" valor={euro(resumen.precio_minimo)} />
                        <InfoPanel texto="Precio máximo" iconImg="./iconAlmacen.svg" altText="maximo" valor={euro(resumen.precio_maximo)} />
                        <InfoPanel
                            texto="Última compra"
                            iconImg="./iconAlmacen.svg"
                            altText="ultima"
                            valor={resumen.ultima_compra ? `${euro(resumen.ultima_compra.precio)} (${fecha(resumen.ultima_compra.fecha)})` : '—'}
                        />
                        <InfoPanel texto="Valor del stock" iconImg="./iconAlmacen.svg" altText="valor" valor={euro(resumen.valor_stock_actual)} />
                    </div>

                    {/* gráficos */}
                    <div className="detalle-producto-graficos">
                        <div className="rentabilidad-card detalle-producto-grafico">
                            <h4>Evolución del precio unitario</h4>
                            {resumen.evolucion_precio.length === 0 ? (
                                <p className="texto-ayuda">Sin compras en el periodo seleccionado.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={resumen.evolucion_precio} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" vertical={false} />
                                        <XAxis dataKey="fecha" tickFormatter={fecha} stroke="var(--c-texto-apagado)" fontSize={12} />
                                        <YAxis stroke="var(--c-texto-apagado)" fontSize={12} tickFormatter={(v) => `${v} €`} width={55} />
                                        <Tooltip formatter={(v) => euro(v)} labelFormatter={fecha} />
                                        <Line type="monotone" dataKey="precio" name="Precio" stroke="var(--c-primario-medio)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="rentabilidad-card detalle-producto-grafico">
                            <h4>Gasto por {usarDesgloseMensual ? 'mes' : 'año'}</h4>
                            {(usarDesgloseMensual ? resumen.gasto_por_mes : resumen.gasto_por_anio).length === 0 ? (
                                <p className="texto-ayuda">Sin compras registradas.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={usarDesgloseMensual ? resumen.gasto_por_mes : resumen.gasto_por_anio} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" vertical={false} />
                                        <XAxis
                                            dataKey={usarDesgloseMensual ? 'mes' : 'anio'}
                                            tickFormatter={usarDesgloseMensual ? mesLegible : undefined}
                                            stroke="var(--c-texto-apagado)"
                                            fontSize={12}
                                        />
                                        <YAxis stroke="var(--c-texto-apagado)" fontSize={12} tickFormatter={(v) => `${v} €`} width={55} />
                                        <Tooltip formatter={(v) => euro(v)} labelFormatter={usarDesgloseMensual ? mesLegible : undefined} />
                                        <Bar dataKey="gasto" name="Gasto" fill="var(--c-primario-claro)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="rentabilidad-card detalle-producto-grafico">
                            <h4>Precio medio por proveedor</h4>
                            {resumen.precio_por_proveedor.length === 0 ? (
                                <p className="texto-ayuda">Sin compras registradas.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={resumen.precio_por_proveedor} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--c-borde)" vertical={false} />
                                        <XAxis dataKey="proveedor" stroke="var(--c-texto-apagado)" fontSize={12} />
                                        <YAxis stroke="var(--c-texto-apagado)" fontSize={12} tickFormatter={(v) => `${v} €`} width={55} />
                                        <Tooltip formatter={(v) => euro(v)} />
                                        <Bar dataKey="precio_medio" name="Precio medio" fill="var(--c-primario)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* histórico de compras */}
            <h3 className="rentabilidad-titulo-seccion">Histórico de compras</h3>
            <table className="tabla-operaciones">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Proveedor</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Importe</th>
                    </tr>
                </thead>
                <tbody>
                    {compras.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ fontStyle: 'italic', color: 'var(--c-texto-apagado)' }}>
                                No hay compras en el periodo seleccionado
                            </td>
                        </tr>
                    ) : (
                        compras.map(compra => (
                            <tr key={compra.id}>
                                <td>{fecha(compra.fecha_compra)}</td>
                                <td>{compra.proveedor?.nombre_comercial || compra.proveedor?.nombre_empresa || '—'}</td>
                                <td>{compra.cantidad_compra} {producto?.unidad}</td>
                                <td>{euro(compra.precio)}</td>
                                <td>{euro(compra.cantidad_compra * compra.precio)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default DetalleProducto
