import React, { Component } from 'react';
import { Map as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import '../css/leaflet.css';

class Map extends Component {

  render() {
		
    return (
				<div>

				<LeafletMap
					center={[48.137, 11.575]}
					zoom={7}
					style={{ width: '600px', height: '400px'}}
				>
					<TileLayer		
						url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
						attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					/>
				</LeafletMap>
				
				</div>
    );
  }
}

export default Map
