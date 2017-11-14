/*
 * 	JavaScript file for VEHICLESTATUSCONTAINER.HTML
 */

var vehicleStatusDocument;
var vehicleStatusFrame = document.getElementById('vehicleStatusFrame');
var vehicleStatusWindow = vehicleStatusFrame.contentWindow;

vehicleStatusWindow.addEventListener('load', function() {
	console.log("vehicleStatus.js loaded");
	vehicleStatusDocument = vehicleStatusFrame.contentDocument || vehicleStatusFrame.contentWindow.document;
});

function updateVehicleStatus(marker) {
	vehicleStatusDocument.getElementById('lat').innerHTML = marker.getPosition().lat();
	vehicleStatusDocument.getElementById('lng').innerHTML = marker.getPosition().lng();
}