import './Style/pill.css'

// insignia de estado/nivel reutilizable en toda la app: mismo componente para
// estado de tarea (pendiente/realizada/revisada), nivel de stock, tipo de
// riego... solo cambia el "tono" semantico, no el marcado
// tono: 'bueno' | 'aviso' | 'alerta' | 'info' | 'neutro'
const Pill = ({ texto, tono = 'neutro' }) => (
  <span className={`pill pill--${tono}`}>{texto}</span>
)

export default Pill
