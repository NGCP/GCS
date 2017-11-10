/*
 * 	JavaScript file/method definitions for MAPCONTAINER.HTML
 *	Please keep map, locations, and markers outside of functions to allow functions to access them
 */

var map, infoWindow;

var markers = [];

const calpoly = {
  lat: 35.306205,
  lng: -120.662227
};
const cpp = {
  lat: 34.0575651,
  lng: -117.8229297
};
var center = cpp;

/*
 * 	Load the map into mapContainer with all the markers and buttons
 *	@param htmlID	id of html element in MAPCONTAINER.HTML to be turned into map
 */
function loadMap(htmlID) {
  createMap(htmlID);
  addMarkers();
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

  map.setTilt(0); // view map in birds-eye view
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
