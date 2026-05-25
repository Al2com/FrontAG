import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productosService from "../../services/productos";
import proveedoresService from "../../services/proveedores";
import comprasService from "../../services/compras";
import Modal from "../Modal/Modal"

import "../Style/forms.css"


const FormComprarProducto = () => {
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [mensajeModal, setMensajeModal] = useState("");

    const [formData, setFormData] = useState({
        producto_id: "",
        proveedor_id: "",
        fecha_compra: "",
        cantidad_compra: "",
        precio: "",
    });

    const [errors, setErrors] = useState({
        producto_id: "",
        proveedor_id: "",
        fecha_compra: "",
        cantidad_compra: "",
        precio: "",
    });

    // Cargamos productos y proveedores al montar el componente
    useEffect(() => {
        productosService.getProductos()
            .then(data => setProductos(data))
            .catch(() => setMensajeModal("Error al cargar los productos. Inténtalo de nuevo."));

        proveedoresService.getProveedores()
            .then(data => setProveedores(data))
            .catch(() => setMensajeModal("Error al cargar los proveedores. Inténtalo de nuevo."));
    }, []);

    const regexDecimal = /^[0-9]{1,5}(\.[0-9]{1,2})?$/;

    const validarCampos = (name, value) => {
        let mensaje = "";
        let comprobar = true;

        if (name === "producto_id" && value === "") {
            mensaje = "Debes seleccionar un producto";
            comprobar = false;
        }

        if (name === "proveedor_id" && value === "") {
            mensaje = "Debes seleccionar un proveedor";
            comprobar = false;
        }

        if (name === "fecha_compra" && value === "") {
            mensaje = "La fecha es obligatoria";
            comprobar = false;
        }

        if (name === "cantidad_compra" && !regexDecimal.test(value)) {
            mensaje = "Formato incorrecto, ej: 10.50";
            comprobar = false;
        }

        if (name === "precio" && !regexDecimal.test(value)) {
            mensaje = "Formato incorrecto, ej: 12.50";
            comprobar = false;
        }

        // prevErrors garantiza que cogemos el estado más reciente antes de actualizarlo
        setErrors(prevErrors => ({ ...prevErrors, [name]: mensaje }));
        return comprobar;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validarCampos(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validamos todos los campos antes de enviar
        const productoOk = validarCampos("producto_id", formData.producto_id);
        const proveedorOk = validarCampos("proveedor_id", formData.proveedor_id);
        const fechaOk = validarCampos("fecha_compra", formData.fecha_compra);
        const cantidadOk = validarCampos("cantidad_compra", formData.cantidad_compra);
        const precioOk = validarCampos("precio", formData.precio);

        if (productoOk && proveedorOk && fechaOk && cantidadOk && precioOk) {
            comprasService.postCrearCompra(formData)
                .then(() => {
                    alert("Compra registrada correctamente");
                    navigate("/almacen");
                })
                .catch(() => setMensajeModal("Error al registrar la compra. Inténtalo de nuevo."));
        }
    };

    return (
        <div className="form-container">
            <h1>Registrar Compra</h1>

            {/* Modal de error, se muestra solo si hay mensaje */}
            {mensajeModal && (
                <Modal
                    mesajeError={mensajeModal}
                    cerrarModal={() => setMensajeModal("")}
                />
            )}

            <form className="form-grid" onSubmit={handleSubmit}>

                <div className="form-grupo">
                    <label>Producto *</label>
                    <select
                        name="producto_id"
                        value={formData.producto_id}
                        onChange={handleChange}
                        className={errors.producto_id ? 'input-error' : ''}
                    >
                        <option value="">Selecciona un producto</option>
                        {productos.map(producto => (
                            <option key={producto.id} value={producto.id}>
                                {producto.nombre} - {producto.unidad}
                            </option>
                        ))}
                    </select>
                    {errors.producto_id && <span className="mensaje-error">{errors.producto_id}</span>}
                </div>

                <div className="form-grupo">
                    <label>Proveedor *</label>
                    <select
                        name="proveedor_id"
                        value={formData.proveedor_id}
                        onChange={handleChange}
                        className={errors.proveedor_id ? 'input-error' : ''}
                    >
                        <option value="">Selecciona un proveedor</option>
                        {proveedores.map(proveedor => (
                            <option key={proveedor.id} value={proveedor.id}>
                                {proveedor.nombre_empresa}
                            </option>
                        ))}
                    </select>
                    {errors.proveedor_id && <span className="mensaje-error">{errors.proveedor_id}</span>}
                </div>

                <div className="form-grupo">
                    <label>Fecha de compra *</label>
                    <input
                        type="datetime-local"
                        name="fecha_compra"
                        value={formData.fecha_compra}
                        onChange={handleChange}
                        className={errors.fecha_compra ? 'input-error' : ''}
                    />
                    {errors.fecha_compra && <span className="mensaje-error">{errors.fecha_compra}</span>}
                </div>

                <div className="form-grupo">
                    <label>Cantidad *</label>
                    <input
                        type="number"
                        step="0.01"
                        name="cantidad_compra"
                        value={formData.cantidad_compra}
                        onChange={handleChange}
                        className={errors.cantidad_compra ? 'input-error' : ''}
                        placeholder="Ej: 10.50"
                    />
                    {errors.cantidad_compra && <span className="mensaje-error">{errors.cantidad_compra}</span>}
                </div>

                <div className="form-grupo">
                    <label>Precio por unidad litro/Kilo (€) *</label>
                    <input
                        type="number"
                        step="0.01"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        className={errors.precio ? 'input-error' : ''}
                        placeholder="Ej: 12.50"
                    />
                    {errors.precio && <span className="mensaje-error">{errors.precio}</span>}
                </div>

                <div className="form-actions full-width">
                    <button type="submit">Registrar Compra</button>
                    <button type="button" onClick={() => navigate('/almacen')}>Atrás</button>
                </div>

            </form>
        </div>
    );
};

export default FormComprarProducto;