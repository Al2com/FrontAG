import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import parcelasService from '../../services/parcelas.js';
import '../Style/forms.css'

const EditarParcela = () => {
  const { id } = useParams();       
  const navigate = useNavigate();   

  const [formData, setFormData] = useState({
    explotacion_id: '',
    propietarios_id: '',
    nombre: '',
    poligono: '',
    parcela: '',
    rol: '',
    variedad: '',
    dimension_hanegadas: '',
    num_arboles: '',
    fecha_plantacion: '',
    descripcion: '',
  });

  // al cargar trae los datos de esa parcela
  useEffect(() => {
    parcelasService.getParcela(id)
      .then(data => setFormData(data))
      .catch(err => console.error('Error al cargar parcela:', err))
  }, [id])

  // actualiza el estado cuando el usuario escribe
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // manda los datos al back
  const handleSubmit = (e) => {
    e.preventDefault();
    parcelasService.putActualizar(id, formData)
      .then(() => {
        alert('Parcela actualizada correctamente');
        navigate('/parcelas');
      })
      .catch(err => console.error('Error al actualizar:', err))
  }

  return (
    <div>
      <h1>Editar Parcela</h1>
      <form onSubmit={handleSubmit}>

        <div>
          <label>Nombre</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
        </div>

        <div>
          <label>Poligono</label>
          <input type="number" name="poligono" value={formData.poligono} onChange={handleChange} />
        </div>

        <div>
          <label>Parcela</label>
          <input type="number" name="parcela" value={formData.parcela} onChange={handleChange} />
        </div>

        <div>
          <label>Rol</label>
          <select name="rol" value={formData.rol} onChange={handleChange}>
            <option value="goteo">Goteo</option>
            <option value="manta">Manta</option>
          </select>
        </div>

        <div>
          <label>Variedad</label>
          <input type="text" name="variedad" value={formData.variedad} onChange={handleChange} />
        </div>

        <div>
          <label>Dimension hanegadas</label>
          <input type="number" name="dimension_hanegadas" value={formData.dimension_hanegadas} onChange={handleChange} />
        </div>

        <div>
          <label>Num arboles</label>
          <input type="number" name="num_arboles" value={formData.num_arboles} onChange={handleChange} />
        </div>

        <div>
          <label>Fecha plantacion</label>
          <input type="date" name="fecha_plantacion" value={formData.fecha_plantacion} onChange={handleChange} />
        </div>

        <div>
          <label>Descripcion</label>
          <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} />
        </div>

         <div className='menu-button'>
          <button type="submit">Guardar cambios</button>
          <button type="button" onClick={() => navigate('/parcelas')}>Cancelar</button>
        </div>

      </form>
    </div>
  )
}

export default EditarParcela;