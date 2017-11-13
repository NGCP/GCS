/*
 * 	JavaScript file/method definitions for MAPCONTAINER.HTML
 *	Please keep map, locations, and markers outside of functions to allow functions to access them
 */

const calpoly = {lat: 35.306205, lng: -120.662227}, cpp = {lat: 34.0575651, lng: -117.8229297};
var center = calpoly; // This is the location if the user location will not be found (in time), see below for big comment block

/* 
 *	Methods that will be run immediate when GUI opens
 */
window.onload = function() {
	updateCenterToUserLocation();
	setTimeout(function() {			// 5000 ms delay to give Google Maps 5 seconds to retrieve user location.
		loadMap('map');				
	}, 5000);	
	
	// Reason for setTimeout(function(), 5000):					
	// When setCenterToUserLocation() will be called, webpage reads next line
	// already, but Google Maps did not update 'var center' to user location yet.
	// Without the delay, the markers will not be placed in the user location
	// except if the user is in the location 'var center' is initialized to.
	// The delay only adds time for Google Maps to update 'var center' before
	// the map is loaded. However, if the map loads before Google Maps updates,
	// then the markers are going to be in the wrong location.
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

var map, infoWindow;

var markers = [];

/*
 * 	Load the map into mapContainer with all the markers and buttons
 *	@param htmlID	id of html element in MAPCONTAINER.HTML to be turned into map
 */ 
function loadMap(htmlID) {
	createMap(htmlID);
	// addMarkers(); 			// I'm going to lay off from loading markers for now.
								// There might be a better way, but let me do some research.
	addButtons();
}

/*
 *	Adds Google Maps to mapContainer
 *	@param id	id attribute of HTML element
 */
function createMap(id) {
	map = new google.maps.Map(document.getElementById(id), {
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
	let list = ['uav1', 'uav2', 'ugv1', 'ugv2']; // list of image files w/o .png
	for (let i = 0; i < list.length; i++) {
		let icon = {
			url: 'markers/' + list[i] + '.png',
			scaledSize: new google.maps.Size(60, 60),
			anchor: new google.maps.Point(25, 25)
		};
		
		markers[i] = new google.maps.Marker({
	  		position: center,
	  		map: map,
	  		icon: icon
		});
		markers[i].index = i;
	}
}

/*
 *	Add buttons to mapContainer
 */
function addButtons() {
	// create 'Center Map' button
	let centerMapButton = document.createElement('button');
	centerMapButton.id = 'center';
	centerMapButton.innerHTML = 'Center Map';
	centerMapButton.index = 1;
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerMapButton);
	
	centerMapButton.addEventListener('click', function() {
			map.panTo(center);
	});
	// create 'Show Vehicle Information' buttons
	// IN PROGRESS
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