import { useEffect, useState } from "react";
import productosService from "../../services/productos";
import { useParams, useNavigate } from "react-router-dom";
import '../Style/forms.css'

const EditarProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formProducto, setFormProducto] = useState({
        nombre: "",
        materia_activa: "",
        precio: "",
        ubicacion: "",
        dosis_recomendada: "",
        stock_minimo: "",
        stock_actual: "",
        unidad: "",
    });

    useEffect(() => {
        productosService.getProducto(id)
            .then(data => setFormProducto(data))
            .catch(err => console.error('Error al cargar producto:', err))
    }, [id]);

    const handleChange = (e) => {
        setFormProducto({ ...formProducto, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        productosService.putActualizarProductos(id, formProducto)
            .then(() => {
                alert("Producto actualizado correctamente");
                navigate("/almacen"); // ✅ navigate
            })
            .catch(err => console.error('Error al actualizar:', err));
    };

    return (
        <div>
            <h1>Editar Producto</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={formProducto.nombre} onChange={handleChange} />
                </div>
                <div>
                    <label>Materia activa</label>
                    <input type="text" name="materia_activa" value={formProducto.materia_activa} onChange={handleChange} />
                </div>
                <div>
                    <label>Precio</label>
                    <input type="number" step="0.01" name="precio" value={formProducto.precio} onChange={handleChange} />
                </div>
                <div>
                    <label>Ubicación</label>
                    <input type="text" name="ubicacion" value={formProducto.ubicacion} onChange={handleChange} />
                </div>
                <div>
                    <label>Dosis recomendada</label>
                    <input type="number" step="0.01" name="dosis_recomendada" value={formProducto.dosis_recomendada} onChange={handleChange} />
                </div>
                <div>
                    <label>Stock actual</label>
                    <input type="number" name="stock_actual" value={formProducto.stock_actual} onChange={handleChange} />
                </div>
                <div>
                    <label>Stock mínimo</label>
                    <input type="number" name="stock_minimo" value={formProducto.stock_minimo} onChange={handleChange} />
                </div>
                <div>
                    <label>Unidad</label>
                    <select name="unidad" value={formProducto.unidad} onChange={handleChange}>
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="g">Gramos (g)</option>
                        <option value="l">Litros (l)</option>
                        <option value="ml">Mililitros (ml)</option>
                        <option value="unidad">Unidad</option>
                    </select>
                </div>
                <div className='menu-button'>
                    <button type="submit">Guardar cambios</button>
                    <button type="button" onClick={() => navigate('/almacen')}>Atrás</button>
                </div>
            </form>
        </div>
    );
};

export default EditarProducto;