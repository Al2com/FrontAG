const Modal = ({mesajeError, cerrarModal}) =>{

    return(

        <div className="fondo-modal">
            <div className="modal">
            <p>{mesajeError}</p>
                <button onClick={cerrarModal}>Cerrar</button>
            </div>
        </div>

        

    );

}

export default Modal;