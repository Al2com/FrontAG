import '../Style/formStyles.css'
import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import parcelasService from '../../services/parcelas'
import productoService from '../../services/productos'

// import explotacionService from '../../services/explotaciones';
// import usuariosService from '../../services/usuarios';
// import propietariosService from '../../services/propietarios';

const FormFumigacion = () =>{

  const [parcelas,setParcelas] = useState([]);
  const [productos,setProductos] = useState([]);
  const [formData, setFormData] = useState({
             parcela_id : "",
            //  usuario_id : "",
             operario : "",
             metodo_aplicacion : "",
             hora_inicio : "",
             duracion_minutos : "",
             producto_id:"",
             dosis_introducida : "",
  });

  const [errors, setErrors] = useState({
             parcela_id : "",
            //  usuario_id : "",
             operario_id : "",
             metodo_aplicacion : "",
             hora_inicio : "",
             duracion_minutos : "",
             producto_id:"",
             dosis_introducida : "",
  });


 useEffect(() => {
     parcelasService.getLista()
       .then(data => setParcelas(data))
       .catch(err => console.error('Error cargando parcelas:', err))

     productoService.getProductos()
      .then(data => {setProductos(data)
                    //  setDosisRecomendada(data)
      }) 
       

      .catch(err => console.error('Error cargando productos:', err))
  
   }, [])

 

   function validarCampos(name,value){

      let mensaje = '';
      let comprobar = true;

      

     if ((/*name === 'usuario_id' || */ name === 'parcela_id' || name === 'metodo_aplicacion' ) && value === "") {
        mensaje = 'Debes seleccionar una opción';
        comprobar = false;
     }

      if (name === 'hora_inicio' && value === "") {
        mensaje = 'La fecha y hora son obligatorias';
        comprobar = false;
      }

       setErrors(prevErrors => ({ ...prevErrors, [name]: mensaje })); 
    
       return comprobar;
   }


  

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        validarCampos(name, value);
        console.log('name:', name, 'value:', value)
    }
//busca el producto selecionado para sacar la dosis recomendada
    const productoSeleccionado =productos.find(item => item.id === Number(formData.producto_id))


    


    return(


      <div className="form-container">

        <form >


       <div className="form-grupo">
        {/* Parcela */}
          <label htmlFor="parcela_id">Parcela *</label>
          <select
            id="parcela_id"
            name="parcela_id"
            value={formData.parcela_id}
            onChange={handleChange}
            
          >
            <option value="">Selecciona una parcela</option>
            {parcelas.map(parcela => (
              <option key={parcela.id} value={parcela.id}>
                {parcela.poligono} - {parcela.parcela} ({parcela.variedad})
              </option>
            ))} 
          </select>
           {errors.parcela_id && <span className="mensaje-error">{errors.parcela_id}</span>}


          {/* Metodo */}
        <div className="form-grupo">
          <label htmlFor="metodo_aplicacion">Método aplicacón *</label>
          <select
            id="metodo_aplicacion"
            name="metodo_aplicacion"
            value={formData.metodo_aplicacion}
            onChange={handleChange}
            className={errors.metodo_aplicacion ? 'input-error' : ''}
          >
             <option value="">Selecciona método aplicación</option>
             <option value="mochila">Mochila</option>
             <option value="tractor">Tractor</option>
          
          </select>
           {errors.metodo_aplicacion && <span className="mensaje-error">{errors.metodo_aplicacion}</span>}
        </div>
         
         
         
         
         
         {/* Operario */}
         {formData.metodo_aplicacion === 'mochila' && (
        <div className="form-grupo">
          <label htmlFor="operario">Operario *</label>
          <select
            id="operario"
            name="operario"
            value={formData.operario}
            onChange={handleChange}
            className={errors.operario ? 'input-error' : ''}
          >
             <option value="">Selecciona un usuario</option>
             <option value="Luis Pérez">Luis Perez</option>
             <option value="Pepe Martinez">Pepe Matinez</option>
          </select>
           {errors.operario && <span className="mensaje-error">{errors.operario}</span>}
        </div>
          )}


         {/* Hora de Inicio */}
        <div className="form-grupo">
          <label htmlFor="hora_inicio">Fecha y Hora de Inicio *</label>
          <input
            type="datetime-local"
            id="hora_inicio"
            name="hora_inicio"
            value={formData.hora_inicio}
            onChange={handleChange}
            className={errors.hora_inicio ? 'input-error' : ''}
          />
          {errors.hora_inicio && <span className="mensaje-error">{errors.hora_inicio}</span>}

        </div>

         

       {/* Producto */}
        <div className="form-grupo">
          <label htmlFor="producto_id">Producto *</label>
          <select
            id="producto_id"
            name="producto_id"
            value={formData.producto_id || ''}
            onChange={handleChange}
            className={errors.producto ? 'input-error' : ''}
          >
            <option value="">Selecciona un producto</option>
            {productos.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}-{producto.unidad}
              </option>
            ))}
          </select>

          {errors.producto && ( <span className="mensaje-error">{errors.producto}</span>)}
        </div>
      
         {/* Dosis Recomendada */}
            <div className="form-grupo">
              <label htmlFor="dosis_recomendada" >Dosis Recomendada</label> 
                {productoSeleccionado && <p>{productoSeleccionado.dosis_recomendada}</p>}
            </div>




         {/* Dosis Introducida */}
        <div className="form-grupo">
          <label htmlFor="dosis_introducida">Dosis Intoducida *</label>

          <input 
            id="dosis_introducida"
            value={FormData.dosis_introducida}
            onChange={handleChange}
          >

          </input>
           
           {/* {errors.usuario_id && <span className="mensaje-error">{errors.usuario_id}</span>} */}
        </div>

      </div>
    </form>
  </div>

        





  )
}

export default FormFumigacion