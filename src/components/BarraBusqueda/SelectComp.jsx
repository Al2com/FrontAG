import '../Style/barraBusqueda.css'

const SelectComp = ({onChange,value1,value2,nombre1,nombre2,value}) => {

    return(
        <div className="barra-select">

        <select onChange={onChange} >
            <option value="">{value}</option>
            <option value={value1}>{nombre1}</option>
            <option value={value2}>{nombre2}</option>
        </select>
        </div>
    )
}

export default SelectComp