import { useRef, useState } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import settingsService from '../services/settings'
import backupService from '../services/backup'
import Modal from './Modal/Modal.jsx'
import AvatarPerfil from './AvatarPerfil.jsx'
import { generarMiniatura } from '../utils/imagen.js'
import './Style/forms.css'
import './Style/configuracion.css'

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']
const TAMANO_MAX_BYTES = 2 * 1024 * 1024
const fechaHoy = () => new Date().toISOString().slice(0, 10)

const Configuracion = ({ user, setUser }) => {
  const { tema, alternarTema } = useTheme()
  const rol = sessionStorage.getItem('rol')

  const actualizarUsuarioLocal = (cambios) => {
    const actualizado = { ...user, ...cambios }
    setUser(actualizado)
    sessionStorage.setItem('usuario', JSON.stringify(actualizado))
  }

  // --- foto de perfil ---
  const inputFotoRef = useRef(null)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [errorFoto, setErrorFoto] = useState('')
  const [confirmarBorrarFoto, setConfirmarBorrarFoto] = useState(false)

  const manejarSeleccionFoto = async (e) => {
    const archivo = e.target.files[0]
    e.target.value = '' // permite volver a elegir el mismo archivo despues de un error
    if (!archivo) return

    setErrorFoto('')

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      setErrorFoto('Formato no admitido. Usa JPG, PNG o WEBP.')
      return
    }
    if (archivo.size > TAMANO_MAX_BYTES) {
      setErrorFoto('La imagen no puede superar los 2 MB.')
      return
    }

    setSubiendoFoto(true)
    try {
      const miniatura = await generarMiniatura(archivo)
      const resultado = await settingsService.subirFotoPerfil(archivo, miniatura)
      actualizarUsuarioLocal({
        foto_perfil_url: resultado.foto_perfil_url,
        foto_perfil_thumb_url: resultado.foto_perfil_thumb_url,
      })
    } catch (err) {
      setErrorFoto(err.response?.data?.mensaje || 'No se pudo subir la foto de perfil.')
    } finally {
      setSubiendoFoto(false)
    }
  }

  const borrarFoto = async () => {
    setConfirmarBorrarFoto(false)
    setSubiendoFoto(true)
    try {
      await settingsService.borrarFotoPerfil()
      actualizarUsuarioLocal({ foto_perfil_url: null, foto_perfil_thumb_url: null })
    } catch {
      setErrorFoto('No se pudo eliminar la foto de perfil.')
    } finally {
      setSubiendoFoto(false)
    }
  }

  // --- copia de seguridad ---
  const inputBackupRef = useRef(null)
  const [descargando, setDescargando] = useState('') // '' | 'csv' | 'json'
  const [importando, setImportando] = useState(false)
  const [archivoAImportar, setArchivoAImportar] = useState(null)
  const [mensajeBackup, setMensajeBackup] = useState({ tipo: '', texto: '' })

  const descargarCsv = async () => {
    setDescargando('csv')
    setMensajeBackup({ tipo: '', texto: '' })
    try {
      const blob = await backupService.descargarCsv()
      backupService.descargarBlob(blob, `agrogestion-datos-${fechaHoy()}.zip`)
    } catch {
      setMensajeBackup({ tipo: 'error', texto: 'No se pudo generar el CSV.' })
    } finally {
      setDescargando('')
    }
  }

  const descargarJson = async () => {
    setDescargando('json')
    setMensajeBackup({ tipo: '', texto: '' })
    try {
      const blob = await backupService.descargarJson()
      backupService.descargarBlob(blob, `agrogestion-backup-${fechaHoy()}.json`)
    } catch {
      setMensajeBackup({ tipo: 'error', texto: 'No se pudo generar el respaldo.' })
    } finally {
      setDescargando('')
    }
  }

  const manejarSeleccionBackup = (e) => {
    const archivo = e.target.files[0]
    e.target.value = ''
    if (!archivo) return
    setArchivoAImportar(archivo) // el modal de confirmación dispara la importación real
  }

  const confirmarImportar = async () => {
    const archivo = archivoAImportar
    setArchivoAImportar(null)
    setImportando(true)
    setMensajeBackup({ tipo: '', texto: '' })
    try {
      await backupService.importar(archivo)
      setMensajeBackup({ tipo: 'exito', texto: 'Respaldo importado correctamente. Tus datos se han reemplazado por los del archivo.' })
    } catch (err) {
      setMensajeBackup({ tipo: 'error', texto: err.response?.data?.mensaje || 'No se pudo importar el respaldo.' })
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="form-container configuracion">
      <h1>Configuración</h1>

      {/* MODO OSCURO */}
      <section className="config-seccion">
        <h2>Apariencia</h2>
        <div className="config-fila">
          <span>Modo oscuro</span>
          <label className="switch">
            <input type="checkbox" checked={tema === 'oscuro'} onChange={alternarTema} />
            <span className="switch-slider"></span>
          </label>
        </div>
      </section>

      {/* FOTO DE PERFIL */}
      <section className="config-seccion">
        <h2>Foto de perfil</h2>
        <div className="config-foto">
          <AvatarPerfil usuario={user} className="config-avatar" />
          <div className="config-foto-acciones">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              ref={inputFotoRef}
              onChange={manejarSeleccionFoto}
              style={{ display: 'none' }}
            />
            <button type="button" className="btn-vista" disabled={subiendoFoto} onClick={() => inputFotoRef.current.click()}>
              {subiendoFoto ? 'Subiendo…' : 'Cambiar foto'}
            </button>
            {user?.foto_perfil_url && (
              <button type="button" className="btn-eliminar" disabled={subiendoFoto} onClick={() => setConfirmarBorrarFoto(true)}>
                Eliminar
              </button>
            )}
          </div>
        </div>
        {errorFoto && <span className="mensaje-error">{errorFoto}</span>}
        <p className="config-ayuda">JPG, PNG o WEBP. Máximo 2 MB.</p>
      </section>

      {/* COPIA DE SEGURIDAD: solo admin, dueño de los datos del inquilino */}
      {rol === 'admin' && (
        <section className="config-seccion">
          <h2>Copia de seguridad</h2>

          <div className="config-fila config-fila--columna">
            <div>
              <strong>Descargar en CSV</strong>
              <p className="config-ayuda">Un ZIP con un CSV por tabla, para consultar los datos fuera de la app.</p>
            </div>
            <button type="button" className="btn-vista" disabled={descargando !== ''} onClick={descargarCsv}>
              {descargando === 'csv' ? 'Generando…' : 'Descargar CSV'}
            </button>
          </div>

          <div className="config-fila config-fila--columna">
            <div>
              <strong>Descargar respaldo</strong>
              <p className="config-ayuda">Un JSON con todos tus datos, listo para restaurarlo más adelante.</p>
            </div>
            <button type="button" className="btn-vista" disabled={descargando !== ''} onClick={descargarJson}>
              {descargando === 'json' ? 'Generando…' : 'Descargar respaldo'}
            </button>
          </div>

          <div className="config-fila config-fila--columna">
            <div>
              <strong>Importar respaldo</strong>
              <p className="config-ayuda">Sustituye tus datos actuales por los del archivo JSON seleccionado.</p>
            </div>
            <input
              type="file"
              accept="application/json"
              ref={inputBackupRef}
              onChange={manejarSeleccionBackup}
              style={{ display: 'none' }}
            />
            <button type="button" className="btn-vista" disabled={importando} onClick={() => inputBackupRef.current.click()}>
              {importando ? 'Importando…' : 'Importar respaldo'}
            </button>
          </div>

          {mensajeBackup.texto && (
            <span className={mensajeBackup.tipo === 'error' ? 'mensaje-error' : 'mensaje-exito'}>
              {mensajeBackup.texto}
            </span>
          )}
        </section>
      )}

      {confirmarBorrarFoto && (
        <Modal
          mesajeError="¿Seguro que quieres eliminar tu foto de perfil?"
          onConfirmar={borrarFoto}
          cerrarModal={() => setConfirmarBorrarFoto(false)}
        />
      )}

      {archivoAImportar && (
        <Modal
          mesajeError={`Vas a importar "${archivoAImportar.name}". Esto reemplazará todos tus datos actuales por los del archivo y no se puede deshacer. ¿Continuar?`}
          onConfirmar={confirmarImportar}
          cerrarModal={() => setArchivoAImportar(null)}
        />
      )}
    </div>
  )
}

export default Configuracion
