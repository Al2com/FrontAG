const Modal = ({ mesajeError, cerrarModal, onConfirmar }) => {
  return (
    <div className="fondo-modal">
      <div className="modal">
        <p>{mesajeError}</p>
        <div className="modal-botones">
          {/* si viene onConfirmar muestro dos botones, si no solo el de cerrar */}
          {onConfirmar ? (
            <>
              <button className="btn-confirmar" onClick={onConfirmar}>Confirmar</button>
              <button className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
            </>
          ) : (
            <button onClick={cerrarModal}>Cerrar</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal