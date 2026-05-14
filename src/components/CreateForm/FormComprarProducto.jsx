import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productosService from "../../services/productos";
import proveedoresService from "../../services/proveedores";
import comprasService from "../../services/compras";

import '../Style/forms.css'

const FormComprarProducto = () => {
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [proveedores, setProveedores] = useState([]);

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

    useEffect(() => {
        productosService.getProductos()
            .then(data => setProductos(data))
            .catch(err => console.error('Error cargando productos:', err));

        proveedoresService.getProveedores()
            .then(data => setProveedores(data))
            .catch(err => console.error('Error cargando proveedores:', err));
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
                .catch(err => console.error("Error al registrar compra:", err));
        }
    };

    return (
        <div>
            <h1>Registrar Compra</h1>
            <form onSubmit={handleSubmit}>

                <div>
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

                <div>
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

                <div>
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

                <div>
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

                <div>
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

                <div className="menu-button">
                    <button type="submit">Registrar Compra</button>
                    <button type="button" onClick={() => navigate('/almacen')}>Atrás</button>
                </div>

            </form>
        </div>
    );
};

export default FormComprarProducto;