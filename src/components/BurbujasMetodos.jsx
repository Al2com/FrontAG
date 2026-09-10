import { useState } from 'react'
import './Style/burbujasMetodos.css'

// diametro minimo y maximo de una burbuja, para que un metodo con muy
// pocos litros/cantidad siga siendo visible y clicable
const DIAMETRO_MIN = 70
const DIAMETRO_MAX = 180

// escala lineal simple: el valor mas alto del conjunto ocupa el diametro
// maximo, el resto se reparte proporcionalmente, con un suelo visible
const calcularDiametro = (valor, valorMaximo) => {
  if (!valorMaximo || valorMaximo <= 0) return DIAMETRO_MIN
  const proporcion = Math.min(Math.max(valor / valorMaximo, 0), 1)
  return DIAMETRO_MIN + proporcion * (DIAMETRO_MAX - DIAMETRO_MIN)
}

const METODOS = {
  tractor: { etiqueta: 'Tractor', clase: 'burbuja-metodo--tractor' },
  mochila: { etiqueta: 'Mochila', clase: 'burbuja-metodo--mochila' },
}

// burbujas de dos niveles (tractor/mochila y su desglose por producto),
// reutilizable para cualquier metrica de esos dos metodos: al pulsar una
// burbuja principal aparecen sus sub-burbujas de producto; al pulsar de
// nuevo la misma burbuja (que se queda visible, marcada como activa) se
// cierra el detalle y se vuelve a la vista con ambos metodos
//
// tractor / mochila: { productos: [...], ...campos con las metricas }
// valorPrincipal(datosMetodo) -> numero para el tamaño de la burbuja principal
// etiquetaPrincipal(datosMetodo) -> texto mostrado dentro de la burbuja principal
// valorProducto(producto) -> numero para el tamaño de la burbuja de producto
// etiquetaProducto(producto) -> texto mostrado dentro de la burbuja de producto
const BurbujasMetodos = ({
  tractor,
  mochila,
  valorPrincipal,
  etiquetaPrincipal,
  valorProducto,
  etiquetaProducto,
}) => {
  const [metodoActivo, setMetodoActivo] = useState(null)

  const datosPorMetodo = { tractor, mochila }
  const maximoPrincipal = Math.max(valorPrincipal(tractor) || 0, valorPrincipal(mochila) || 0)

  const alternarMetodo = (metodo) => setMetodoActivo(actual => (actual === metodo ? null : metodo))

  const productosActivos = metodoActivo ? datosPorMetodo[metodoActivo].productos : []
  const maximoProducto = productosActivos.length > 0
    ? Math.max(...productosActivos.map(p => valorProducto(p) || 0))
    : 0

  return (
    <div className="burbujas-metodos-lienzo">
      {['tractor', 'mochila'].map(metodo => {
        if (metodoActivo && metodoActivo !== metodo) return null

        const datos = datosPorMetodo[metodo]
        const diametro = calcularDiametro(valorPrincipal(datos) || 0, maximoPrincipal)
        const activa = metodoActivo === metodo

        return (
          <button
            key={metodo}
            type="button"
            className={`burbuja-metodo ${METODOS[metodo].clase} ${activa ? 'burbuja-metodo--activa' : ''}`}
            style={{ width: diametro, height: diametro }}
            onClick={() => alternarMetodo(metodo)}
            aria-label={`${METODOS[metodo].etiqueta}: ${etiquetaPrincipal(datos)}. ${activa ? 'Pulsa para cerrar el detalle.' : 'Pulsa para ver el detalle por producto.'}`}
          >
            <span className="burbuja-metodo-valor">{etiquetaPrincipal(datos)}</span>
            <span className="burbuja-metodo-etiqueta">{METODOS[metodo].etiqueta}</span>
          </button>
        )
      })}

      {metodoActivo && productosActivos.length === 0 && (
        <p className="burbujas-productos-vacio">Sin productos registrados en este método.</p>
      )}
      {metodoActivo && productosActivos.map(producto => {
        const diametro = calcularDiametro(valorProducto(producto) || 0, maximoProducto)
        return (
          <div
            key={producto.producto_id}
            role="button"
            tabIndex={0}
            className="burbuja-producto"
            style={{ width: diametro, height: diametro }}
            aria-label={`${producto.nombre}: ${etiquetaProducto(producto)}`}
          >
            <span className="burbuja-producto-cantidad">{etiquetaProducto(producto)}</span>
            <span className="burbuja-producto-nombre">{producto.nombre}</span>
          </div>
        )
      })}
    </div>
  )
}

export default BurbujasMetodos
