/*
 * 	JavaScript file for MAPCONTAINER.HTML
 */
const path = require('path');
var mapDocument;
var mapFrame = document.getElementById('mapFrame');
var mapWindow = mapFrame.contentWindow;
var center;

mapWindow.addEventListener('load', function() {
	console.log("map.js loaded");
	mapDocument = mapFrame.contentDocument || mapFrame.contentWindow.document;

  updateCenterToUserLocation();
	setTimeout(function() {
		loadMap();
	}, 3000);
});

const calpoly = {lat: 35.306205, lng: -120.662227}, cpp = {lat: 34.0575651, lng: -117.8229297};

center = cpp;
var map;
var markers = [];

function loadMap() {
	addMap();
	addMarkers();
	addButtons();
}

function addMap(id) {
	map = new google.maps.Map(mapDocument.getElementById('map'), {
		center: center,
		zoom: 18,
		mapTypeId: 'satellite',
		scaleControl: true,
		streetViewControl: false,
		fullscreenControl: false
	});
	map.setTilt(0);
	console.log("center: " + center.lat + ", " + center.lng);
}

function addMarkers() {
	var list = ['uav1.png', 'uav2.png', 'ugv1.png', 'ugv2.png'];
	for (let i = 0; i < list.length; i++) {
		// create icon
		var icon = {
			url: path.join( __dirname, 'resources','vehicle-icons', list[i]),
			scaledSize: new google.maps.Size(100, 100),
			anchor: new google.maps.Point(25, 25)
		};

		// create marker
		markers[i] = new google.maps.Marker({
	  		position: center,
	  		map: map,
	  		icon: icon
		});
		markers[i].index = i;

		// create marker listener
		markers[i].addListener('click', function() {
			updateVehicleStatus(markers[i]);
		});

		console.log(markers[i].getPosition() + ", " + markers[i].icon.url);
	}
}

function addButtons() {
	var centerMapButton = mapDocument.createElement('button');
	centerMapButton.id = 'centerMap';
	centerMapButton.innerHTML = 'Center Map';
	centerMapButton.index = 1;
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerMapButton);

	centerMapButton.addEventListener('click', function() {
			map.panTo(center);
	});
}

function updateCenterToUserLocation() {
	console.log("Getting user location.");
	if (navigator.geolocation) {
		console.log("Found navigator.");
		navigator.geolocation.getCurrentPosition(function(p) {
			console.log("Setting center.");
			center = {
				lat: p.coords.latitude,
				lng: p.coords.longitude
			};
		});
	}
}
