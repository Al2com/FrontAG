import { useEffect, useState } from "react";
import productosService from "../../services/productos";
import { useParams, useNavigate } from "react-router-dom";
import Modal from '../Modal/Modal.jsx';
import { parseErrores422, MENSAJE_ERROR_SERVIDOR } from '../../services/errores.js';
import '../Style/forms.css'

const EditarProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // modal de confirmacion para guardar y error de servidor
    const [modalConfirm, setModalConfirm] = useState(false);
    const [errorServidor, setErrorServidor] = useState('');
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

    const [errors, setErrors] = useState({
        nombre: "",
        materia_activa: "",
        precio: "",
        ubicacion: "",
        dosis_recomendada: "",
        stock_minimo: "",
        stock_actual: "",
    });

    // nombre y materia activa: letras, numeros y simbolos habituales (%, paréntesis, +, -, /, ., ,)
    const regexTexto = /^[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ%().,+/\-\s]{2,50}$/;
    const regexUbicacion = /^.{3,}$/;
    const regexDecimal = /^[0-9]{1,6}(\.[0-9]{1,2})?$/;
    const regexEntero = /^[0-9]{1,5}$/;

    useEffect(() => {
        productosService.getProducto(id)
            .then(data => setFormProducto(data))
            .catch(() => setErrorServidor('No se pudieron cargar los datos del producto'))
    }, [id]);

    const validarCampos = (name, value) => {
        let mensaje = '';
        let comprobar = true;

        if (name === 'nombre' && !regexTexto.test(value)) {
            mensaje = 'Entre 2 y 50 caracteres';
            comprobar = false;
        }
        if (name === 'materia_activa' && !regexTexto.test(value)) {
            mensaje = 'Entre 2 y 50 caracteres';
            comprobar = false;
        }
        if (name === 'ubicacion' && !regexUbicacion.test(value)) {
            mensaje = 'Mínimo 3 caracteres';
            comprobar = false;
        }
        if (name === 'precio' && !regexDecimal.test(value)) {
            mensaje = 'Precio válido (ej: 12.50)';
            comprobar = false;
        }
        if (name === 'stock_actual' && !regexEntero.test(value)) {
            mensaje = 'Número entero';
            comprobar = false;
        }
        if (name === 'stock_minimo' && !regexEntero.test(value)) {
            mensaje = 'Número entero';
            comprobar = false;
        }
        // la dosis es opcional: solo se valida si hay valor
        if (name === 'dosis_recomendada' && value !== '' && value !== null && !regexDecimal.test(value)) {
            mensaje = 'Dosis válida (ej: 2.5)';
            comprobar = false;
        }

        setErrors(prev => ({ ...prev, [name]: mensaje }));
        return comprobar;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormProducto({ ...formProducto, [name]: value });
        validarCampos(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nombreOk   = validarCampos('nombre', formProducto.nombre);
        const materiaOk  = validarCampos('materia_activa', formProducto.materia_activa);
        const ubicOk     = validarCampos('ubicacion', formProducto.ubicacion);
        const precioOk   = validarCampos('precio', formProducto.precio);
        const stockAOk   = validarCampos('stock_actual', formProducto.stock_actual);
        const stockMOk   = validarCampos('stock_minimo', formProducto.stock_minimo);
        const dosisOk    = validarCampos('dosis_recomendada', formProducto.dosis_recomendada);

        if (nombreOk && materiaOk && ubicOk && precioOk && stockAOk && stockMOk && dosisOk) {
            setModalConfirm(true);
        }
    };

    // el usuario confirma en el modal y se guardan los cambios
    const guardarCambios = () => {
        productosService.putActualizarProductos(id, formProducto)
            .then(() => navigate("/almacen"))
            .catch(err => {
                setModalConfirm(false);
                const e422 = parseErrores422(err);
                if (e422) {
                    setErrors(prev => ({ ...prev, ...e422 }));
                } else {
                    setErrorServidor(MENSAJE_ERROR_SERVIDOR);
                }
            });
    };

    return (
        <div className="form-container">

            {/* modal de confirmacion para guardar */}
            {modalConfirm && (
                <Modal
                    mesajeError="¿Estás seguro de guardar los cambios?"
                    cerrarModal={() => setModalConfirm(false)}
                    onConfirmar={guardarCambios}
                />
            )}

            <h1>Editar Producto</h1>

            {errorServidor && <span className="mensaje-error">{errorServidor}</span>}

            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-grupo">
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={formProducto.nombre} onChange={handleChange} className={errors.nombre ? 'input-error' : ''} />
                    {errors.nombre && <span className="mensaje-error">{errors.nombre}</span>}
                </div>
                <div className="form-grupo">
                    <label>Materia activa</label>
                    <input type="text" name="materia_activa" value={formProducto.materia_activa} onChange={handleChange} className={errors.materia_activa ? 'input-error' : ''} />
                    {errors.materia_activa && <span className="mensaje-error">{errors.materia_activa}</span>}
                </div>
                <div className="form-grupo">
                    <label>Precio / coste (€)</label>
                    <input type="number" step="0.01" name="precio" value={formProducto.precio ?? ''} onChange={handleChange} className={errors.precio ? 'input-error' : ''} />
                    {errors.precio && <span className="mensaje-error">{errors.precio}</span>}
                </div>
                <div className="form-grupo">
                    <label>Ubicación</label>
                    <input type="text" name="ubicacion" value={formProducto.ubicacion} onChange={handleChange} className={errors.ubicacion ? 'input-error' : ''} />
                    {errors.ubicacion && <span className="mensaje-error">{errors.ubicacion}</span>}
                </div>
                <div className="form-grupo">
                    <label>Dosis recomendada</label>
                    <input type="number" step="0.01" name="dosis_recomendada" value={formProducto.dosis_recomendada ?? ''} onChange={handleChange} className={errors.dosis_recomendada ? 'input-error' : ''} />
                    {errors.dosis_recomendada && <span className="mensaje-error">{errors.dosis_recomendada}</span>}
                </div>
                <div className="form-grupo">
                    <label>Stock actual</label>
                    <input type="number" name="stock_actual" value={formProducto.stock_actual} onChange={handleChange} className={errors.stock_actual ? 'input-error' : ''} />
                    {errors.stock_actual && <span className="mensaje-error">{errors.stock_actual}</span>}
                </div>
                <div className="form-grupo">
                    <label>Stock mínimo</label>
                    <input type="number" name="stock_minimo" value={formProducto.stock_minimo} onChange={handleChange} className={errors.stock_minimo ? 'input-error' : ''} />
                    {errors.stock_minimo && <span className="mensaje-error">{errors.stock_minimo}</span>}
                </div>
                <div className="form-grupo">
                    <label>Unidad</label>
                    <select name="unidad" value={formProducto.unidad} onChange={handleChange}>
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="g">Gramos (g)</option>
                        <option value="l">Litros (l)</option>
                        <option value="ml">Mililitros (ml)</option>
                        <option value="unidad">Unidad</option>
                    </select>
                </div>
                <div className='form-actions full-width'>
                    <button type="submit">Guardar cambios</button>
                    <button type="button" onClick={() => navigate('/almacen')}>Atrás</button>
                </div>
            </form>
        </div>
    );
};

export default EditarProducto;
