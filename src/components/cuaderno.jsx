import { useState, useEffect } from 'react'
import cuadernoService from '../services/cuaderno.js'
import './Style/cuaderno.css'

// Catálogo oficial de Canso por cultivo. Es fijo: cada fila es un producto del
// impreso (incidencia, materia activa, dosis, P.S., nº registro, comercial).
// La X solo se pone en los productos realmente aplicados, que llegan del back.
const CATALOGOS = {
  citrico: {
    titulo: 'CÍTRICOS',
    filas: [
      ['Acaros, Cochinillas', 'Aceite parafina 79%', '10 L', 'np', '20036', 'Albelda ce'],
      ['Acaros', 'Hexitiazox 10%', '200 g', '14', '24383', 'Cesar'],
      ['Acaros, Mosca B.', 'Piridaben 10%', '1,5 l', '14', 'ES-00114', 'Poseidon'],
      ['Acaros', 'Acequinocil 16,4%', '1 l', '28', '25360', 'Dinamite'],
      ['Pulgón, Minador', 'Acetamiprid 20%', '350 g', '14', '23377', 'Gazel'],
      ['Acaros', 'Fenpiroximato 5,12%', '1 l', '14', '19241', 'Flash um'],
      ['Trip', 'Tau Fluvalinato 24%', '100 cc', '14', '18498', 'Evure'],
      ['Pulgón, Minador', 'Acetamiprid 20%', '250 cc', '14', 'ES-00629', 'Carnadine'],
      ['P. Rojo', 'Piriproxifen 10%', '500 cc', '30', '19675', 'Atominal EC'],
      ['Cotonet i mosca B.', 'Sulfoxaflor 12%', '400 cc', '7', 'ES-00461', 'Closer'],
      ['Aguado, Cons. piel', 'Fosetil-Al 80%', '2,5 kg', '14', '15907', 'Aliette wg'],
      ['Aguado, Alternaria', 'Ox. Cl. Cobre 50%', '1 kg', '14', '14612', 'Oxicoop 50'],
      ['Conserv. piel', 'Ac. Giberélico 40%', '50 g', 'np', '25361', 'Beretox 40 SG'],
      ['Mosca blanca', 'Aceite parafina 79%', '10 l', 'np', '15173', 'Citrolina'],
      ['Ceratitis', 'Spinosad 0,024%', '—', '1', '23808', 'Spintor Cebo'],
      ['Trip, Ceratitis', 'Etofenprox 28,75%', '1,5 l', '14', '23333', 'Shark'],
      ['Acaros, Minador', 'Milbemectina 0,93%', '1,5 l', '14', '25931', 'Koromite'],
      ['Acaros, Minador', 'Hexitiazox 25,87%', '50 cc', '14', 'ES-00234', 'Tiazosac'],
      ['Trips', 'Spinosad 48%', '250 cc', '120', '22939', 'Spintor 480 SC'],
    ],
  },
  kaki: {
    titulo: 'CAQUI',
    filas: [
      ['Orugas', 'Bacillus Thuringiensis K.', '500 g', 'np', '23738', 'Dipel DF'],
      ['Ceratitis, pulgón', 'Azadiractin 3,2%', '750 cc', '3', '23291', 'Align'],
      ['Ceratitis', 'Etofenprox 28,75%', '1 l', '3', '23333', 'Shark'],
      ['Ceratitis', 'Lambda Cihalotrin 10%', 'parcheo', '7', '22398', 'Karate Zeon'],
      ['Ceratitis', 'Spinosad 0,024%', 'parcheo', '1', '23808', 'Spintor Cebo'],
      ['Cotonet i mosca B.', 'Spirotetramat 10%', '1 l', '21', 'ES-00024', 'Movento Gold'],
      ['Mosca blanca', 'Piriproxifen 10%', '400 cc', 'np', '19675', 'Junival'],
      ['Mosca blanca', 'Aceite de parafina 80%', '10 l', '20', 'ES-00079', 'Ovipron Top'],
      ['Mosca blanca', 'Aceite de parafina 79%', '12 l', 'np', '20036', 'Albelda ce'],
      ['Mycosphae. Nawae', 'Piraclostrobin 20%', '400 g', '100', 'ES-00065', 'Cabrio wg'],
      ['Mycosphae. Nawae', 'Azoxistrobin 25%', '500 cc', 'np', '22000', 'Ortiva'],
      ['Mycosphae. Nawae', 'Difenoconazol 25%', '250 cc', 'np', '18767', 'Score'],
      ['Mycosphae. Nawae', 'Potasio 66% + captan 36%', '2 l', 'np', 'ES-00689', 'Merplus'],
      ['Mycosphae. Nawae', 'Fluxapyroxad 30%', '200 cc', '120', 'ES-00381', 'Sercadis'],
      ['Fitorregulador', 'Etefon 48%', '70 cc', '10', '16103', 'Fruitel'],
      ['Conservar piel', 'Ácido giberélico 40%', '120 g', 'np', '25361', 'Berelex'],
      ['Coadyuvante', 'Alquil poliglicol 20%', '500 cc', 'np', '24477', 'Mojante Norton'],
      ['Cotonet i mosca B.', 'Sulfoxaflor 12%', '400 cc', '7', 'ES-00461', 'Closer'],
      ['', '', '', '', '', 'OMITE TOP'],
    ],
  },
}

const COLS = [1, 2, 3, 4, 5, 6, 7]

// normaliza para casar productos: minúsculas y sin espacios sobrantes
const norm = (s) => (s || '').toString().toLowerCase().trim()

const Cuaderno = () => {
  const anioActual = new Date().getFullYear()
  const [anio, setAnio] = useState(anioActual.toString())
  const [cultivo, setCultivo] = useState('citrico')
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  const anios = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3]
  const catalogo = CATALOGOS[cultivo]

  // socio = usuario logueado (el impreso no maneja nº de socio en la app)
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null')

  // pido al back los datos cada vez que cambia el año o el cultivo
  useEffect(() => {
    setError('')
    cuadernoService.getCuaderno(anio, cultivo)
      .then(setDatos)
      .catch(() => setError('No se pudieron cargar los datos del cuaderno'))
  }, [anio, cultivo])

  // construyo dos índices para casar: por nombre comercial (preferente) y por
  // materia activa (respaldo, por si el producto se registró con otro nombre)
  const porNombre = {}
  const porMateria = {}
  ;(datos?.productos || []).forEach(p => {
    porNombre[norm(p.nombre)] = p.columnas
    if (p.materia_activa) porMateria[norm(p.materia_activa)] = p.columnas
  })

  const columnasDe = (fila) =>
    porNombre[norm(fila[5])] || porMateria[norm(fila[1])] || []

  const fechas = datos?.fechas || []

  const imprimir = () => window.print()

  return (
    <div className="cuaderno-contenedor">

      {/* Controles de la app: no se imprimen */}
      <div className="cuaderno-barra no-imprimir">
        <div>
          <h2>Cuaderno de campo</h2>
          <p>Genera la hoja de tratamientos de la cooperativa lista para entregar</p>
          {error && <span className="mensaje-error">{error}</span>}
        </div>
        <div className="cuaderno-controles">
          <div className="cuaderno-toggle">
            <button
              className={cultivo === 'citrico' ? 'activo' : ''}
              onClick={() => setCultivo('citrico')}
            >Cítricos</button>
            <button
              className={cultivo === 'kaki' ? 'activo' : ''}
              onClick={() => setCultivo('kaki')}
            >Kaki</button>
          </div>
          <select value={anio} onChange={(e) => setAnio(e.target.value)}>
            {anios.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button className="cuaderno-descargar" onClick={imprimir}>
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Hoja imprimible: reproduce el impreso de Canso */}
      <div className="cuaderno-hoja">
        <table className="cuaderno-tabla">
          <thead>
            <tr>
              <td colSpan={2} className="cc-logo">CANSO</td>
              <td colSpan={4} className="cc-titulo">{catalogo.titulo} {anio}</td>
              {COLS.map(n => <th key={n} className="cc-num">{n}</th>)}
            </tr>
            <tr>
              <td className="cc-lbl">Nº Socio</td>
              <td className="cc-dato"></td>
              <td colSpan={2} className="cc-lbl">Nombre socio</td>
              <td colSpan={2} className="cc-dato">{usuario?.name || ''}</td>
              <td colSpan={7} className="cc-parcelas">{datos?.parcelas || 'Todas las parcelas'}</td>
            </tr>
            <tr>
              <td colSpan={6} className="cc-lbl der">FECHA</td>
              {COLS.map((n, i) => <td key={n} className="cc-fecha">{fechas[i] || ''}</td>)}
            </tr>
            <tr>
              <td colSpan={6} className="cc-lbl der">LITROS</td>
              {COLS.map(n => <td key={n} className="cc-litros"></td>)}
            </tr>
            <tr>
              <td colSpan={6} className="cc-lbl der">MAQUINARIA</td>
              <td colSpan={7} className="cc-maq"></td>
            </tr>
            <tr className="cc-cabecera">
              <th>Incidencia</th>
              <th>Materia activa</th>
              <th>Dosis</th>
              <th>P.S.</th>
              <th>Nº Reg.</th>
              <th>Comercial</th>
              {COLS.map(n => <th key={n} className="cc-num"></th>)}
            </tr>
          </thead>
          <tbody>
            {catalogo.filas.map((fila, idx) => {
              const columnas = columnasDe(fila)
              const usado = columnas.length > 0
              return (
                <tr key={idx} className={usado ? 'cc-usado' : ''}>
                  <td className="cc-inc">{fila[0]}</td>
                  <td>{fila[1]}</td>
                  <td>{fila[2]}</td>
                  <td>{fila[3]}</td>
                  <td className="cc-reg">{fila[4]}</td>
                  <td className="cc-com">{fila[5]}</td>
                  {COLS.map(n => (
                    <td key={n} className="cc-x">{columnas.includes(n) ? 'X' : ''}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="cuaderno-pie">
          <span>Aplicador: nombre y firma _______________________</span>
          <span>Eficacia 1–7 · Validación final (NO RELLENAR)</span>
        </div>
      </div>
    </div>
  )
}

export default Cuaderno
