import { useEffect } from 'react'
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { MapPin, FileText, X } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../Style/mapaParcela.css'

// Arreglo conocido de Leaflet + Vite: sin esto los iconos del marcador no
// cargan (Leaflet construye las rutas de las imágenes de forma que el bundler
// no resuelve). Se importan las imágenes y se registran como icono por defecto.
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import icon from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
})

// PROVISIONAL: punto fijo en la provincia de Valencia (Ribera Alta) para poder
// ver el mapa mientras el backend todavía no devuelve las coordenadas reales
// de la parcela. SUSTITUIR por los datos de la API cuando existan.
const COORDENADAS_PROVISIONALES = { lat: 39.1527, lng: -0.4342 } // Alzira (Valencia)

// Servicio WMS INSPIRE de cartografía catastral de la DG del Catastro.
// Fuente: https://www.catastro.hacienda.gob.es/webinspire/index.html
// (parámetros confirmados en el GetCapabilities del propio servicio)
const WMS_CATASTRO_URL = 'https://ovc.catastro.meh.es/cartografia/INSPIRE/spadgcwms.aspx'
const WMS_CATASTRO_CAPA = 'CP.CadastralParcel'

// Leaflet dentro de un modal arranca con tamaño 0 porque el contenedor aún no
// tiene dimensiones al montar: hay que recalcularlo cuando el modal ya es visible.
const AjustarTamano = () => {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map])
  return null
}

const ModalMapaParcela = ({ parcela, onCerrar }) => {
  const { lat, lng } = COORDENADAS_PROVISIONALES
  const enlaceGoogleMaps = `https://www.google.com/maps?q=${lat},${lng}`

  // cerrar con Escape
  useEffect(() => {
    const alPulsar = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [onCerrar])

  return (
    // clic en el fondo cierra; clic dentro del modal no (stopPropagation)
    <div className="fondo-modal" onClick={onCerrar}>
      <div className="mapa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mapa-modal-cabecera">
          <h3>Parcela {parcela.poligono} - {parcela.parcela}</h3>
          <button className="mapa-modal-cerrar" onClick={onCerrar} aria-label="Cerrar" title="Cerrar">
            <X />
          </button>
        </div>

        <div className="mapa-modal-mapa">
          <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom>
            <AjustarTamano />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; colaboradores de OpenStreetMap'
            />
            <WMSTileLayer
              url={WMS_CATASTRO_URL}
              layers={WMS_CATASTRO_CAPA}
              format="image/png"
              transparent
              version="1.3.0"
              attribution="Dirección General del Catastro"
            />
            <Marker position={[lat, lng]}>
              <Popup>Parcela {parcela.poligono} - {parcela.parcela}</Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="mapa-modal-enlaces">
          <a href={enlaceGoogleMaps} target="_blank" rel="noopener noreferrer">
            <MapPin />Ver en Google Maps
          </a>
          {/* La ficha del Catastro necesita la referencia catastral, que aún no
              llega del backend: enlace deshabilitado hasta que exista el dato. */}
          <button type="button" disabled title="Disponible cuando haya referencia catastral">
            <FileText />Ver en Catastro
          </button>
          <span className="mapa-modal-nota">Disponible cuando haya referencia</span>
        </div>
      </div>
    </div>
  )
}

export default ModalMapaParcela
