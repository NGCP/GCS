/*
 * 	JavaScript file/method definitions for MAPCONTAINER.HTML
 *	Please keep map, locations, and markers outside of functions to allow functions to access them
 */
 
var mapContainer;
window.onload = function() {
	let mapFrame = document.getElementById('mapContainer');
	mapContainer = mapFrame.contentDocument || mapFrame.contentWindow.document;
}

const calpoly = {lat: 35.306205, lng: -120.662227}, cpp = {lat: 34.0575651, lng: -117.8229297};
var center = calpoly; // This is the location if the user location will not be found (in time), see below for big comment block

var map, infoWindow;

var markers = [];

/*
 * 	Load the map into mapContainer with all the markers and buttons
 *	@param htmlID	id of html element in MAPCONTAINER.HTML to be turned into map
 */ 
function loadMap(htmlID) {
	createMap(htmlID);
	addMarkers(); 			// I'm going to lay off from loading markers for now.
								// There might be a better way, but let me do some research.
	addButtons();
}

/*
 *	Adds Google Maps to mapContainer
 *	@param id	id attribute of HTML element
 */
function createMap(id) {
	alert(mapContainer.getElementById(id));
	map = new google.maps.Map(mapContainer.getElementById(id), {
		center: center,
		zoom: 18,
		mapTypeId: 'satellite',
		scaleControl: true,
		streetViewControl: false,
		fullscreenControl: false
	});
	
	map.setTilt(0);	// view map in birds-eye view
}

/*
 *	Add markers to the map along with their listeners
 *	Note: markers are the icons of the vehicles on the map
 */
function addMarkers() {
	let list = ['uav1', 'uav2', 'ugv1', 'ugv2'];
	for (let i = 0; i < list.length; i++) {
		// create image
		let icon = {
			url: '../resources/vehicle-icons/' + list[i] + '.png',
			scaledSize: new google.maps.Size(60, 60),
			anchor: new google.maps.Point(25, 25)
		};
		
		// create marker
		markers[i] = new google.maps.Marker({
	  		position: center,
	  		map: map,
	  		icon: icon,
	  		draggable: true
		});
		markers[i].index = i;
		
		// create marker listener
		markers[i].addListener('click', function() {
			updateVehicleStatus(markers[i]); // this method is on vehicleStatus.js
		});
	}
}

/*
 *	Add buttons to mapContainer
 */
function addButtons() {
	// create 'Center Map' button
	let centerMapButton = mapContainer.createElement('button');
	centerMapButton.id = 'center';
	centerMapButton.innerHTML = 'Center Map';
	centerMapButton.index = 1;
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerMapButton);
	
	// create 'Center Map' button listener
	centerMapButton.addEventListener('click', function() {
			map.panTo(center);
	});
	// create 'Show Vehicle Information' buttons
	// IN PROGRESS
}

/*
 *	Gets user location, pans to that location, and creates markers in that location
 */
function updateCenterToUserLocation() {
	if (navigator.geolocation) { 									// browser supports location services
		navigator.geolocation.getCurrentPosition(function(p) {		// user location is found
			center = {
				lat: p.coords.latitude,
				lng: p.coords.longitude
			};
		});
	}
}

/*
 * 	Update the center location of the map
 *	@param location	the new centerlocation
 */ 
function centerMapToNewLocation(latLng) {
	center = latLng;
	//alert(latLng.lat + " " + latLng.lng);
	map.panTo(center);
}