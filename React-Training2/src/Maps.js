import React from "react";
import { MapContainer, TileLayer, MapConsumer} from "react-leaflet";
import "./Leaflet.css";
import L from "leaflet";
// Own Icons
import marker from "./marker-icon.png";
import markerShadow from "./marker-shadow.png";

export default function Map(props) {

	console.log(`GeoData from App: ${JSON.stringify(props.startGeoData)}`);

	const customIcon = L.icon({
		iconSize: [25, 41],
		iconAnchor: [10, 41],
		popupAnchor: [2, -40],
		iconUrl: marker,
		shadowUrl: markerShadow
	});

	// Options for the marker
	const markerOptions = {
		clickable: true,
		draggable: false,
		icon: customIcon,
		opacity: .7
	}

	let markArr = [];

  return (
    <MapContainer
      center={props.startGeoData}  // Berlin as startpoint 
      zoom={13}
      style={{ height: "300px" }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapConsumer>
        {(map) => {
          console.log("map center:", map.getCenter());

					map.locate().on("locationfound", function (e) {
						map.flyTo(e.latlng, map.getZoom());
						//const radius = e.accuracy;
						//console.log(`DEBUG - Position Accuracy: ${e.accuracy}`)
						const radius = 300;
						const circle = L.circle(e.latlng, radius, {color: 'red', weight: 3, opacity:.7});
						circle.addTo(map);
					});

          map.on("click", function (e) {
            const { lat, lng } = e.latlng;
						console.log(`DEBUG - latlng: ${lat},${lng}`);

						props.resultGeoData([lat,lng]);

            let mark = L.marker([lat, lng], markerOptions).addTo(map).bindPopup(`Pos: ${JSON.stringify(e.latlng)}`).openPopup();

						markArr.push(mark);
						if (markArr.length > 1) {  // always only one marker
              map.removeLayer(markArr[0]);
							markArr.shift();
        		};
						const position = mark.getLatLng();
						console.log(`DEBUG - Pos: ${JSON.stringify(position)}`);
          });
					
          return null;
        }}
      </MapConsumer>
    </MapContainer>
  );
}
