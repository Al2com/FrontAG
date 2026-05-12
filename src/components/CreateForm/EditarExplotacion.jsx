import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import explotacionService from '../../services/explotaciones.js';

const EditarExplotacion = () => {
  const { id } = useParams(); //te lo da dentro del componente para poder usarlo, cuando llamas a la
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    descripcion: '',
    user_id: '',
    propietario_id: '',
  });

  // Al cargar trae los datos de esa explotación
  useEffect(() => {
    explotacionService.getExplo(id)
      .then(data => setFormData(data))
      .catch(err => console.error('Error al cargar explotación:', err))
  }, [id])

  // Actualiza el estado cuando el usuario escribe
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Envía los datos al backend
  const handleSubmit = (e) => {
    e.preventDefault();
    explotacionService.putActualizar(id, formData)
      .then(() => {
        alert('Explotación actualizada correctamente');
        navigate('/explotaciones');
      })
      .catch(err => console.error('Error al actualizar:', err))
  }

  return (
    <div>
      <h1>Editar Explotación</h1>
      <form onSubmit={handleSubmit}>

        <div>
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Ubicación</label>
          <input
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Descripción</label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
          />
        </div>

        <div className='menu-button'>
          <button type="submit">Guardar cambios</button>
          <button type="button" onClick={() => navigate('/explotaciones')}>Cancelar</button>
        </div>

      </form>
    </div>
  )
}

export default EditarExplotacion;