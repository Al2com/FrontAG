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
    // modal de confirmacion para registrar la compra
    const [modalConfirm, setModalConfirm] = useState(false);

    // alta rapida de proveedor desde la propia compra
    const [mostrarNuevoProv, setMostrarNuevoProv] = useState(false);
    const [nuevoProv, setNuevoProv] = useState({ nombre_empresa: '', direccion: '', telefono: '' });
    const [errorProv, setErrorProv] = useState('');

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

    // recarga la lista de proveedores (la uso al montar y tras crear uno nuevo)
    const cargarProveedores = () => {
        return proveedoresService.getProveedores()
            .then(data => setProveedores(data))
            .catch(() => setMensajeModal("Error al cargar los proveedores. Inténtalo de nuevo."));
    };

    // Cargamos productos y proveedores al montar el componente
    useEffect(() => {
        productosService.getProductos()
            .then(data => setProductos(data))
            .catch(() => setMensajeModal("Error al cargar los productos. Inténtalo de nuevo."));

        cargarProveedores();
    }, []);

    // crea un proveedor desde el mini-formulario y lo deja seleccionado
    const crearProveedor = () => {
        setErrorProv('');
        if (!nuevoProv.nombre_empresa.trim() || !nuevoProv.direccion.trim()) {
            setErrorProv('El nombre de empresa y la dirección son obligatorios');
            return;
        }
        proveedoresService.postCrear(nuevoProv)
            .then(creado => {
                cargarProveedores();
                // selecciona automáticamente el proveedor recién creado
                setFormData(prev => ({ ...prev, proveedor_id: creado.id }));
                setErrors(prev => ({ ...prev, proveedor_id: '' }));
                setNuevoProv({ nombre_empresa: '', direccion: '', telefono: '' });
                setMostrarNuevoProv(false);
            })
            .catch(err => {
                const msg = err.response?.data?.errors
                    ? Object.values(err.response.data.errors)[0][0]
                    : 'No se pudo crear el proveedor';
                setErrorProv(msg);
            });
    };

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
            setModalConfirm(true);
        }
    };

    // el usuario confirma en el modal y se registra la compra
    const crearCompra = () => {
        comprasService.postCrearCompra(formData)
            .then(() => navigate("/almacen"))
            .catch(() => {
                setModalConfirm(false);
                setMensajeModal("Error al registrar la compra. Inténtalo de nuevo.");
            });
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

            {/* Modal de confirmacion para registrar la compra */}
            {modalConfirm && (
                <Modal
                    mesajeError="¿Estás seguro de registrar esta compra?"
                    cerrarModal={() => setModalConfirm(false)}
                    onConfirmar={crearCompra}
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            name="proveedor_id"
                            value={formData.proveedor_id}
                            onChange={handleChange}
                            className={errors.proveedor_id ? 'input-error' : ''}
                            style={{ flex: 1 }}
                        >
                            <option value="">Selecciona un proveedor</option>
                            {proveedores.map(proveedor => (
                                <option key={proveedor.id} value={proveedor.id}>
                                    {proveedor.nombre_empresa}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setMostrarNuevoProv(!mostrarNuevoProv)}
                            title="Crear proveedor"
                        >
                            +
                        </button>
                    </div>
                    {errors.proveedor_id && <span className="mensaje-error">{errors.proveedor_id}</span>}

                    {mostrarNuevoProv && (
                        <div className="nuevo-proveedor" style={{ marginTop: '8px', display: 'grid', gap: '6px' }}>
                            <input
                                type="text"
                                placeholder="Nombre de la empresa *"
                                value={nuevoProv.nombre_empresa}
                                onChange={e => setNuevoProv({ ...nuevoProv, nombre_empresa: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Dirección *"
                                value={nuevoProv.direccion}
                                onChange={e => setNuevoProv({ ...nuevoProv, direccion: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Teléfono"
                                value={nuevoProv.telefono}
                                onChange={e => setNuevoProv({ ...nuevoProv, telefono: e.target.value })}
                            />
                            <button type="button" onClick={crearProveedor}>Crear proveedor</button>
                            {errorProv && <span className="mensaje-error">{errorProv}</span>}
                        </div>
                    )}
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