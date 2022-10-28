import React from "react";
import L from "leaflet";
import "./Style.css";

import "leaflet-routing-machine";

const mapStyle = {
  width: "90%",
  height: "500px"
};

class Map extends React.Component {
  componentDidMount() {
    this.map = L.map("map", {
      center: [52.520007, 13.404954],  // current - Berlin
      zoom: 7,
      layers: [
        L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        })
      ]
    });

    var routeControl = L.Routing.control({
      show: false,
      fitSelectedRoutes: true,
      plan: false,
      language: 'de',
      routeWhileDragging: true,
      lineOptions: {
        styles: [{
            color: "blue",
            opacity: "0.5",
            weight: 5
          }]
      }
    });

    // Calculate distance and time by kfz
		routeControl.on('routesfound', function(e) {

			const routes = e.routes;
			const summary = routes[0].summary;  // route between first waypoints
      const distance = summary.totalDistance / 1000;
			const minutes = Math.round(summary.totalTime % 3600 / 60);

      console.log(`Total distance: ${distance} km and total time ca: ${minutes} minutes`);
		})

    .addTo(this.map)
    .getPlan();

    const current = new L.LatLng(52.520007, 13.404954, "current");  // Berlin
    const target = new L.LatLng(51.339696, 12.373075, "target");  // Leipzig

    routeControl.setWaypoints([current, target]);
  }
  render() {
    return <div id="map" style={mapStyle} />;
  }
}

export default Map;
