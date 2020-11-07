import React, { Component } from 'react';
// Leaflet Maps
import { MapContainer as Map, TileLayer, Marker, Popup as Pop } from 'react-leaflet';
import L from 'leaflet';
import './Leaflet.css';
import icon from './marker-icon.png';
import iconShadow from './marker-shadow.png';

class Maps extends Component {
	constructor(props) {
		super(props)
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

		// Location Ort-String aufteilen
		const ort = this.props.geoLoc.ort.split(' ');

		// Leaflet Customs Marker-Icons (Bug in React, therefore defining indiv. icons!)
		let DefaultIcon = L.icon({
			iconUrl: icon,
			shadowUrl: iconShadow
		});
		L.Marker.prototype.options.icon = DefaultIcon;

		return (

			/* GeoLocation State wird als 'this.props.geoLoc' aus App.js übernommen */				
			<Map 
				center={this.props.geoLoc.pos} // [Latitude, Longitude]
				zoom='13' 
				style={{width: 'auto', height: '400px'}} 
				scrollWheelZoom={false} 
				attributionControl={false}	// Copyrightvermerk für 'Leaflet/OpenStreetMap' wird ausgeblendet
			>
				<TileLayer 
					attribution='&amp;copy OpenStreetMap' 
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
				/>
				<Marker position={this.props.geoLoc.pos} ref={this.openPopup}>
					<Pop>
						{ort[0]}<br />
						{ort[1]}
					</Pop>
				</Marker>
			</Map>

		)
	}
}

export default Maps;
