/*
 * 	JavaScript file for MAPCONTAINER.HTML
 */

var mapDocument;
var mapFrame = document.getElementById('mapFrame');
var mapWindow = mapFrame.contentWindow;

mapWindow.addEventListener('load', function() {
	console.log("map.js loaded");
	mapDocument = mapFrame.contentDocument || mapFrame.contentWindow.document;
	
	updateCenterToUserLocation();
	setTimeout(function() {
		loadMap();
	}, 3000);
});

const calpoly = {lat: 35.306205, lng: -120.662227}, cpp = {lat: 34.0575651, lng: -117.8229297};

var center = calpoly;
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
}

function addMarkers() {
	var list = ['uav1', 'uav2', 'ugv1', 'ugv2'];
	for (let i = 0; i < list.length; i++) {
		// create icon
		var icon = {
			url: '../resources/vehicle-icons/' + list[i] + '.png',
			scaledSize: new google.maps.Size(60, 60),
			anchor: new google.maps.Point(25, 25)
		};
		
		var goldStar = {
          path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
          fillColor: 'yellow',
          fillOpacity: 0.8,
          scale: 1,
          strokeColor: 'gold',
          strokeWeight: 14
        };
		
		// create marker
		markers[i] = new google.maps.Marker({
	  		position: center,
	  		map: map,
	  		icon: icon.url,
	  		draggable: true // temporary
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
	if (navigator.geolocation) {	
		navigator.geolocation.getCurrentPosition(function(p) {
			center = {
				lat: p.coords.latitude,
				lng: p.coords.longitude
			};
		});
	}
}