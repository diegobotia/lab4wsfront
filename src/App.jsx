import { MapContainer, Marker, Popup ,TileLayer, useMapEvent } from "react-leaflet"
import L from 'leaflet'
import CocheSVG from "./CocheSVG"
import { useEffect, useState } from "react"
import { Client } from "@stomp/stompjs"

function EvtClickMapa({ onClick }){

   useMapEvent({
    click(e) {
      onClick(e.latlng)
    }
   })
}



export default function App(){
  const position = [6.25184, -75.56359]
const [posicionCoche, setPosicionCoche] = useState([0,0])
const [posicionAnterior, setPosicionAnterior] = useState([0,0])
const [anguloCoche, setAnguloCoche] = useState(0)

useEffect (()=> {
const cliente = new Client({
  brokerURL: 'ws://localhost:8080/websocket' 
})

const calcularAnguloDireccionGPS = (puntoAnterior, puntoNuevo) => {
  const [lat1,lon1] = puntoAnterior
  const [lat2,lon2] = puntoNuevo
  console.log(puntoAnterior, puntoNuevo)

  const deltaX = lat2 - lat1
  const deltaY = lon2 - lon1
  const anguloRad = Math.atan2(deltaY,deltaX)
  const anguloGrados = (anguloRad *180) / Math.PI
  return anguloGrados

}


 
cliente.onConnect = () => {
  console.log('Conectado')
  cliente.subscribe('/taxi/coordenada' , (m) => {
    const coordenada = JSON.parse(m.body)
    const puntoNuevo = [coordenada.x, coordenada.y]
    const anguloNuevo = calcularAnguloDireccionGPS(posicionAnterior, puntoNuevo)
    setPosicionAnterior(puntoNuevo)
    setPosicionCoche([coordenada.x, coordenada.y])
    setAnguloCoche(anguloNuevo)

//    setPosicionCoche(puntoNuevo)
  })
}

cliente.activate()
return () => {
  if(cliente) {
    cliente.deactivate()
  }
}

}, [posicionAnterior])

const svgIconoCoche = L.divIcon({
    html: `<div class='svg-icon' style="transform: rotate(${anguloCoche}deg);">${CocheSVG}</div>
    `,
    className: 'svg-icon'
})

  return(
   
<MapContainer center={position} zoom={13} scrollWheelZoom={false}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
   <EvtClickMapa onClick={(c) => console.log('coordenadas.add(new Coordenadas('+ c.lat +', ' + c.lng +'));')} />
  <Marker position={posicionCoche} icon={svgIconoCoche} />
  
   
  </MapContainer>

  )
}
