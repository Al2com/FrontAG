import { useEffect, useState } from "react"
import './Style/ComponetsNavStyle.css';
import fumigaciones from '../services/fumigaciones'



const fumigaciones = () => {

    const [fumigaciones, setFumigaciones] = useState()

    useEffect(()=>{

        FumigacionesService.get()
        

    })

    


    return(

        <div>

        </div>
    )

}