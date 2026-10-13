import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
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

// Punto de partida (centro inicial) mientras la parcela no tiene ubicación
// fijada: zona de l'Alcúdia. En cuanto el usuario hace clic, se guarda la
// ubicación real de ESA parcela.
const CENTRO_INICIAL = { lat: 39.1938, lng: -0.5078 }

// Clave de almacenamiento por parcela. PROVISIONAL: se guarda en el navegador
// (localStorage). Cuando exista el backend, esto se sustituye por lat/lng de la
// API (leer al abrir y guardar con un PUT).
const claveUbicacion = (parcela) => `parcela-ubicacion-${parcela.id}`

const leerUbicacionGuardada = (parcela) => {
  try {
    const guardado = localStorage.getItem(claveUbicacion(parcela))
    if (guardado) {
      const o = JSON.parse(guardado)
      if (o && Number.isFinite(o.lat) && Number.isFinite(o.lng)) return o
    }
  } catch { /* localStorage no disponible: se usa el centro inicial */ }
  return null
}

// Servicio WMS INSPIRE de cartografía catastral de la DG del Catastro.
// Fuente: https://www.catastro.hacienda.gob.es/webinspire/index.html
const WMS_CATASTRO_URL = 'https://ovc.catastro.meh.es/cartografia/INSPIRE/spadgcwms.aspx'
const WMS_CATASTRO_CAPA = 'CP.CadastralParcel'

// Captura el clic en el mapa para fijar/actualizar la ubicación de la parcela.
const FijarUbicacionAlHacerClic = ({ onFijar }) => {
  useMapEvents({
    click(e) {
      onFijar({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

const ModalMapaParcela = ({ parcela, onCerrar }) => {
  const guardada = leerUbicacionGuardada(parcela)
  const [ubicacion, setUbicacion] = useState(guardada)
  // centro del mapa: la ubicación guardada si existe, o el punto de partida
  const centro = ubicacion ?? CENTRO_INICIAL
  const enlaceGoogleMaps = ubicacion
    ? `https://www.google.com/maps?q=${ubicacion.lat},${ubicacion.lng}`
    : null

  // guarda la ubicación elegida por el usuario (de momento, en el navegador)
  const fijarUbicacion = (nueva) => {
    setUbicacion(nueva)
    try {
      localStorage.setItem(claveUbicacion(parcela), JSON.stringify(nueva))
    } catch { /* si localStorage falla, al menos queda fijada en esta sesión */ }
  }

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

        <p className="mapa-modal-ayuda">
          {ubicacion
            ? 'Haz clic en el mapa (o arrastra el marcador) para ajustar la ubicación de esta parcela.'
            : 'Esta parcela aún no tiene ubicación. Haz clic en el mapa, sobre la parcela del Catastro, para fijarla.'}
        </p>

        <div className="mapa-modal-mapa">
          <MapContainer center={[centro.lat, centro.lng]} zoom={ubicacion ? 17 : 14} scrollWheelZoom>
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
            <FijarUbicacionAlHacerClic onFijar={fijarUbicacion} />
            {ubicacion && (
              <Marker
                position={[ubicacion.lat, ubicacion.lng]}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng()
                    fijarUbicacion({ lat, lng })
                  },
                }}
              >
                <Popup>Parcela {parcela.poligono} - {parcela.parcela}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="mapa-modal-enlaces">
          {enlaceGoogleMaps ? (
            <a href={enlaceGoogleMaps} target="_blank" rel="noopener noreferrer">
              <MapPin />Ver en Google Maps
            </a>
          ) : (
            <button type="button" disabled title="Fija primero la ubicación en el mapa">
              <MapPin />Ver en Google Maps
            </button>
          )}
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
