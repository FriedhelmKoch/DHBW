import React, { Component } from 'react';
// Leaflet Maps
import { MapContainer as Map, TileLayer, Marker, Popup as Pop } from 'react-leaflet';
import L from 'leaflet';
import './Leaflet.css';
import icon from './marker-icon.png';
import iconShadow from './marker-shadow.png';

class Maps extends Component {
	constructor() {
		super()
	}

	// Leaflet Map Marker
	openPopup(marker) {
		if (marker && marker.leafletElement) {
			window.setTimeout(() => {
				marker.leafletElement.openPopup()
			})
		}
	}

	render() {

		// Leaflet Customs Marker-Icons (Bug in React, therefore defining indiv. icons!)
		let DefaultIcon = L.icon({
			iconUrl: icon,
			shadowUrl: iconShadow
		});
		L.Marker.prototype.options.icon = DefaultIcon;

		return (
							
			<Map center={[48.130064, 11.583815]} zoom='13' style={{width: 'auto', height: '400px'}} scrollWheelZoom={false} attributionControl={false}>
				<TileLayer 
					attribution='&amp;copy OpenStreetMap' 
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
				/>
				<Marker position={[48.130064, 11.583815]} ref={this.openPopup}>
					<Pop>
						München<br />
						Museumsinsel
					</Pop>
				</Marker>
			</Map>

		)
	}
}

export default Maps;
