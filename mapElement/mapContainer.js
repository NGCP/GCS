/*
 * JavaScript file/method definitions for MAPCONTAINER.HTML
 */

let theMap;

// Load the map into the document element specified by mapContainerElement
function loadMap(mapContainerElement) {
   theMap = new google.maps.Map(document.getElementById(mapContainerElement), {
      center: {lat: 35.306205, lng: -120.662227},
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: true,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullScreenControl: false
   });
}

// Update the center location of the map to the given latitude and longitude values
function updateMapLocation(lat, lng) {
   theMap.setCenter(new google.maps.LatLng(lat, lng));
}
