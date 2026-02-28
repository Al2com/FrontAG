import '../Style/formStyles.css'
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useEffect } from 'react';
// import explotacionService from '../../services/explotaciones';
// import usuariosService from '../../services/usuarios';
// import propietariosService from '../../services/propietarios';

const FormFumigacion = () =>{


    return(

       <div className="form-grupo">
        {/* Parcela */}
          <label htmlFor="parcela_id">Parcela *</label>
          <select
            // id="parcela_id"
            // name="parcela_id"
            // value={formData.parcela_id}
            // onChange={handleChange}
            
          >
        
            {/* <option value="">Selecciona una parcela</option>
            {parcelas.map(parcela => (
              <option key={parcela.id} value={parcela.id}>
                {parcela.poligono} - {parcela.parcela} ({parcela.variedad})
              </option>
            ))} */}
          </select>
          {/* {errors.parcela_id && <span className="mensaje-error">{errors.parcela_id}</span>} */}

        {/* Usuario */}
        <div className="form-grupo">
          <label htmlFor="usuario_id">Usuario *</label>
          <select
            id="usuario_id"
            name="usuario_id"
            // value={formData.usuario_id}
            // onChange={handleChange}
            // className={errors.usuario_id ? 'input-error' : ''}
          >
            {/* <option value="">Selecciona un usuario</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.name}
              </option>
            ))} */}
          </select>
           {/* {errors.usuario_id && <span className="mensaje-error">{errors.usuario_id}</span>} */}
        </div>


         {/* Hora de Inicio */}
        <div className="form-grupo">
          <label htmlFor="hora_inicio">Fecha y Hora de Inicio *</label>
          <input
            type="datetime-local"
            id="hora_inicio"
            name="hora_inicio"
            // value={formData.hora_inicio}
            // onChange={handleChange}
            // className={errors.hora_inicio ? 'input-error' : ''}
          />
          {/* {errors.hora_inicio && <span className="mensaje-error">{errors.hora_inicio}</span>} */}

        </div>

          {/* Metodo */}
        <div className="form-grupo">
          <label htmlFor="metodo_aplicacion">Método aplicacón *</label>
          <select
            id="metodo_aplicacion"
            name="metodo_aplicacion"
            // value={formData.usuario_id}
            // onChange={handleChange}
            // className={errors.usuario_id ? 'input-error' : ''}
          >
            {/* <option value="">Selecciona un usuario</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.name}
              </option>
            ))} */}
          </select>
           {/* {errors.usuario_id && <span className="mensaje-error">{errors.usuario_id}</span>} */}
        </div>

          {/* Producto */}
        <div className="form-grupo">
          <label htmlFor="producto_id">Producto *</label>
          <select
            id="producto_id"
            name="producto_id"
            // value={formData.usuario_id}
            // onChange={handleChange}
            // className={errors.usuario_id ? 'input-error' : ''}
          >
            {/* <option value="">Selecciona un usuario</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.name}
              </option>
            ))} */}
          </select>
           {/* {errors.usuario_id && <span className="mensaje-error">{errors.usuario_id}</span>} */}
        </div>

         {/* Cantidad */}
        <div className="form-grupo">
          <label htmlFor="cantidad">Cantidad Recomendada /1500 *</label>
          <select
            id="cantidad"
            name="cantidad"
            // value={formData.usuario_id}
            // onChange={handleChange}
            // className={errors.usuario_id ? 'input-error' : ''}
          >
            {/* <option value="">Selecciona un usuario</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.name}
              </option>
            ))} */}
          </select>
           {/* {errors.usuario_id && <span className="mensaje-error">{errors.usuario_id}</span>} */}
        </div>


         {/* Dosis Introducida */}
        <div className="form-grupo">
          <label htmlFor="dosis_introducida">Dosis Intoducida *</label>
          <select
            id="dosis_introducida"
            name="dosis_introducida"
            // value={formData.usuario_id}
            // onChange={handleChange}
            // className={errors.usuario_id ? 'input-error' : ''}
          >
            {/* <option value="">Selecciona un usuario</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.name}
              </option>
            ))} */}
          </select>
           {/* {errors.usuario_id && <span className="mensaje-error">{errors.usuario_id}</span>} */}
        </div>











</div>

        





    )
}

export default FormFumigacion