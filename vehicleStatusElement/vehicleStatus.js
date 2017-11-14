var vehicleStatusContainer;
window.onload = function() {
	let vehicleStatusFrame = document.getElementById('vehicleStatusContainer');
	vehicleStatusContainer = vehicleStatusFrame.contentDocument || vehicleStatusFrame.contentWindow.document;
}

function updateVehicleStatus(marker) {
	alert(innerDoc.getElementById('lat'));
	//document.getElementById('lat').innerHTML = marker.getPosition().lat();
	//document.getElementById('lng').innerHTML = marker.getPosition().lng();
}