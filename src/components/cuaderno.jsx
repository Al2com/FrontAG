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

// Catálogo de herbicidas del bloque "Manejo del suelo" de la plantilla.
// Se casa por MATERIA ACTIVA, porque el nombre comercial del impreso (Glifocoop)
// no coincide con el del almacén (Insecticida Glifosato).
// [labor efectuada, nº registro, materia activa, dosis, P.S., nombre comercial]
const HERBICIDAS = [
  ['Herbicida', '25449', 'Glifosato 36%', '3-6 L', 'NP', 'Glifocoop'],
  ['Herbicida', '—', 'MCPA 50%', '—', '—', 'U46'],
  ['Herbicida', '—', 'Oxifluorfén 24%', '—', '—', 'Goal'],
]

const COLS = [1, 2, 3, 4, 5, 6, 7]
const MESES_RIEGO = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre']

// Tabla de variedades y fechas de entrega (hoja 3, texto fijo de la plantilla)
const VARIEDADES_ENTREGA = [
  ['Adelanto', '15 Agosto al 30 Agosto'],
  ['Normal 1', '15 Agosto al 30 Agosto'],
  ['Normal 2', '1 Septiembre al 15 Septiembre'],
  ['Conservación', '1 Septiembre al 15 Septiembre'],
]

// normaliza para casar productos: minúsculas y sin espacios sobrantes
const norm = (s) => (s || '').toString().toLowerCase().trim()

// Logo de la cooperativa. Mientras no exista public/canso.png se muestra un
// hueco con el texto; en cuanto se coloque el archivo, aparece la imagen sola.
const Logo = () => (
  <>
    <img
      src="./canso.png"
      alt="CANSO"
      className="cc-logo-img"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
        if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'inline-block'
      }}
    />
    <span className="cc-logo-hueco" style={{ display: 'none' }}>CANSO</span>
  </>
)

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

  // índices para casar fitosanitarios: por nombre comercial y por materia activa
  const porNombre = {}
  const porMateria = {}
  ;(datos?.productos || []).forEach(p => {
    porNombre[norm(p.nombre)] = p.columnas
    if (p.materia_activa) porMateria[norm(p.materia_activa)] = p.columnas
  })
  const columnasDe = (fila) =>
    porNombre[norm(fila[5])] || porMateria[norm(fila[1])] || []

  const fechas = datos?.fechas || []

  // bloque "Manejo del suelo" (herbicidas): sus propias fechas, casado por materia activa
  const manejoSuelo = datos?.manejoSuelo || { fechas: [], productos: [] }
  const fechasSuelo = manejoSuelo.fechas || []
  const porMateriaSuelo = {}
  const porNombreSuelo = {}
  ;(manejoSuelo.productos || []).forEach(p => {
    if (p.materia_activa) porMateriaSuelo[norm(p.materia_activa)] = p.columnas
    porNombreSuelo[norm(p.nombre)] = p.columnas
  })
  const columnasDeHerbicida = (fila) =>
    porMateriaSuelo[norm(fila[2])] || porNombreSuelo[norm(fila[5])] || []

  const imprimir = () => window.print()

  // cabecera común (logo, título, socio y bloque parcelas/fecha/litros/maquinaria)
  const cabecera = (fechasBloque) => (
    <thead>
      <tr>
        <td colSpan={2} className="cc-logo"><Logo /></td>
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
        {COLS.map((n, i) => <td key={n} className="cc-fecha">{fechasBloque[i] || ''}</td>)}
      </tr>
      <tr>
        <td colSpan={6} className="cc-lbl der">LITROS</td>
        {COLS.map(n => <td key={n} className="cc-litros"></td>)}
      </tr>
      <tr>
        <td colSpan={6} className="cc-lbl der">MAQUINARIA</td>
        <td colSpan={7} className="cc-maq"></td>
      </tr>
    </thead>
  )

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
            <button className={cultivo === 'citrico' ? 'activo' : ''} onClick={() => setCultivo('citrico')}>Cítricos</button>
            <button className={cultivo === 'kaki' ? 'activo' : ''} onClick={() => setCultivo('kaki')}>Kaki</button>
          </div>
          <select value={anio} onChange={(e) => setAnio(e.target.value)}>
            {anios.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button className="cuaderno-descargar" onClick={imprimir}>Descargar PDF</button>
        </div>
      </div>

      {/* ===================== HOJA 1 — Fitosanitarios ===================== */}
      <div className="cuaderno-hoja">
        <table className="cuaderno-tabla">
          {cabecera(fechas)}
          <tbody>
            <tr className="cc-cabecera">
              <th>Incidencia</th><th>Materia activa</th><th>Dosis</th>
              <th>P.S.</th><th>Nº Reg.</th><th>Comercial</th>
              {COLS.map(n => <th key={n} className="cc-num"></th>)}
            </tr>
            {catalogo.filas.map((fila, idx) => {
              const columnas = columnasDe(fila)
              return (
                <tr key={idx} className={columnas.length ? 'cc-usado' : ''}>
                  <td className="cc-inc">{fila[0]}</td>
                  <td>{fila[1]}</td>
                  <td>{fila[2]}</td>
                  <td>{fila[3]}</td>
                  <td className="cc-reg">{fila[4]}</td>
                  <td className="cc-com">{fila[5]}</td>
                  {COLS.map(n => <td key={n} className="cc-x">{columnas.includes(n) ? 'X' : ''}</td>)}
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="cuaderno-pie">
          <span>Aplicador: nombre y firma _______________________</span>
          <span>Eficacia 1–7</span>
        </div>
      </div>

      {/* ===================== HOJA 2 — Manejo del suelo, abonado, riego ===================== */}
      <div className="cuaderno-hoja">
        {/* Manejo del suelo (herbicidas) con la cabecera repetida */}
        <table className="cuaderno-tabla">
          {cabecera(fechasSuelo)}
          <tbody>
            <tr className="cc-cabecera">
              <th>Labor efectuada</th><th>Nº Reg.</th><th>Materia activa</th>
              <th>Dosis</th><th>P.S.</th><th>Comercial</th>
              {COLS.map(n => <th key={n} className="cc-num"></th>)}
            </tr>
            {HERBICIDAS.map((fila, idx) => {
              const columnas = columnasDeHerbicida(fila)
              return (
                <tr key={idx} className={columnas.length ? 'cc-usado' : ''}>
                  <td className="cc-inc">{fila[0]}</td>
                  <td className="cc-reg">{fila[1]}</td>
                  <td>{fila[2]}</td>
                  <td>{fila[3]}</td>
                  <td>{fila[4]}</td>
                  <td className="cc-com">{fila[5]}</td>
                  {COLS.map(n => <td key={n} className="cc-x">{columnas.includes(n) ? 'X' : ''}</td>)}
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Abonado (estructura vacía, se rellena a mano) */}
        <h3 className="cc-seccion">Abonado (a manta)</h3>
        <table className="cuaderno-tabla cuaderno-tabla-libre">
          <thead>
            <tr className="cc-cabecera">
              <th>Fecha</th><th>Parcelas</th><th>Tipo de abono</th>
              <th>Riqueza N-P-K</th><th>Dosis Kg/Hg</th><th>Tipo de fert.</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3].map(i => (
              <tr key={i}><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            ))}
          </tbody>
        </table>
        <p className="cc-obs">Observaciones:</p>

        {/* Riego */}
        <h3 className="cc-seccion">Riego (goteo / a manta)</h3>
        <table className="cuaderno-tabla cuaderno-tabla-libre">
          <thead>
            <tr className="cc-cabecera">
              <th>M³ Agua</th>
              {MESES_RIEGO.map(m => <th key={m} className="cc-center">{m}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              {MESES_RIEGO.map(m => <td key={m}></td>)}
            </tr>
          </tbody>
        </table>
        <p className="cc-obs">Orientación M³/Hg por riego (a manta): 50 M³/Hg · Observaciones:</p>

        {/* Validaciones (las rellena el técnico) y firma del productor */}
        <div className="cc-validacion">
          <div className="cc-recuadro">
            <strong>Validación intermedia</strong> <span className="cc-no-rellenar">(NO RELLENAR)</span>
            <p>Firma: ____________  Fecha: __________</p>
            <p>Asesor: _________________________</p>
            <p>Nº inscripción ROPO: ______________</p>
          </div>
          <div className="cc-recuadro">
            <strong>Validación final</strong> <span className="cc-no-rellenar">(NO RELLENAR)</span>
            <p>Firma: ____________  Fecha: __________</p>
            <p>Asesor: _________________________</p>
            <p>Nº inscripción ROPO: ______________</p>
          </div>
        </div>
        <p className="cc-firma">Firma del productor _______________   L'Alcúdia, a ____ de ____________ de 20____</p>

        {/* Documentación a conservar (intro; la lista sigue en la hoja 3) */}
        <h3 className="cc-seccion">Documentación a conservar junto con el cuaderno de explotación</h3>
        <p className="cc-texto">Se conservarán junto al cuaderno de explotación durante al menos 2 años los siguientes documentos, según proceda:</p>
      </div>

      {/* ===================== HOJA 3 — Documentación y entregas ===================== */}
      <div className="cuaderno-hoja">
        <ul className="cc-lista">
          <li>Facturas u otros documentos que justifiquen la adquisición de los productos fitosanitarios utilizados.</li>
          <li>Contratos con las empresas o personas físicas que hayan realizado los tratamientos fitosanitarios.</li>
          <li>Certificado de inspección de los equipos de aplicación de producto fitosanitario.</li>
          <li>Justificantes de entrega de envases vacíos de los productos fitosanitarios en el correspondiente punto de recogida.</li>
          <li>Boletines de análisis de residuos de productos fitosanitarios realizados sobre cultivo y producciones, y en su caso, agua de riego.</li>
          <li>Documentación relativa al asesoramiento recibido.</li>
        </ul>

        <table className="cuaderno-tabla cuaderno-tabla-libre cc-entregas">
          <thead>
            <tr className="cc-cabecera"><th>Variedades</th><th>Fechas entrega</th></tr>
          </thead>
          <tbody>
            {VARIEDADES_ENTREGA.map(([v, f], i) => (
              <tr key={i}><td>{v}</td><td>{f}</td></tr>
            ))}
          </tbody>
        </table>

        <div className="cc-recuadros">
          <div className="cc-recuadro">
            <p className="cc-center"><strong>¡¡LA ENTREGA ES OBLIGATORIA!!</strong></p>
            <ul className="cc-lista">
              <li>Se deben respetar los plazos de seguridad, así como las dosis recomendadas.</li>
              <li>En caso de utilizar algún producto que no esté en la lista, detallarlo en las líneas en blanco.</li>
              <li>Marcar con una X las casillas correspondientes.</li>
            </ul>
          </div>
          <div className="cc-recuadro">
            <p><strong>NOTA:</strong> Ante cualquier modificación con respecto a la fertilización y a los tratamientos fitosanitarios, ya sea de dosificación, cambio de materias activas, eliminación o adición, o cambio de fecha en la realización del tratamiento, deberá ser supervisado por el servicio técnico y ser aprobado por este, conforme a las características de la parcela o de las incidencias que se puedan dar durante el ciclo del cultivo.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cuaderno
