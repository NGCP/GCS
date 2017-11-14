/*
 * 	JavaScript file for MISSIONSETUPCONTAINER.HTML
 */

var missionSetupDocument;
var missionSetupFrame = document.getElementById('missionSetupFrame');
var missionSetupWindow = missionSetupFrame.contentWindow;

missionSetupWindow.addEventListener('load', function() {
	console.log("missionSetup.js loaded");
	missionSetupDocument = missionSetupFrame.contentDocument || missionSetupFrame.contentWindow.document;
});

/*
$(document).ready(function() {
	$('#ch').click(function() {
		if ($('.input').attr('disabled')) {
			$('.input').removeAttr('disabled');
		}
		else {
			$('.input').attr('disabled', true);
		}
	});
});
*/