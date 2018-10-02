const {ipcRenderer} = require('electron');
const fs = require('fs');

let context = null;
let self = null;
let markers = [{
      markerID: 0,
      lat: undefined,
      lng: undefined
   }, {
      markerID: 1,
      lat: undefined,
      lng: undefined
   }
];

module.exports = {

   vehicles: {},
   isReady: false,
   isRunning: false,

   /*
    * Initialize the missionSetup
    * Inits the event notifications from main
    * Overrides document to be the given document (default document is top, not this document)
    */
   init: function (thisContext) {
      context = thisContext;
      self = this;

      //register listeners for possible events from main to this renderer process
      ipcRenderer.on('modifyCurrentMission', self.editMission);
      ipcRenderer.on('startCurrentMission', self.startMission);
      ipcRenderer.on('stopCurrentMission', self.stopMission);
      ipcRenderer.on('saveConfig', self.saveConfig);
      ipcRenderer.on('loadConfig', self.loadConfig);

      // listener for an update on the marker location, update text box
      ipcRenderer.on('boundingMarkerHasChanged', (event, data) => {
         self.updateMarkers(data);
         self.checkReady(); //check that the updates on the marker = ready
      });
   },


   /**
    * STUB FUNCTION
    * Starts the current mission.
    * Responds to 'startCurrentMission' notification
    */
   startMission: function() {
      if(self.isReady) {
         console.log("START MISSION!");

         //prevent editing of bounding box
         ipcRenderer.send('post', 'lockBoundingMarkers', true);

         self.toggleEditScreen(false);
         ipcRenderer.send('missionStart', markers);

         //change state
         self.isRunning = true;
         //update ui
         context.document.getElementById('editMissionButton').disabled = true;
         context.document.getElementById('StartMissionButton').style.display = "none";
         context.document.getElementById('StopMissionButton').style.display = "";

      }
   },

   /**
    * STUB FUNCTION
    * Make the setup viewport visible so that the current mission can be edited
    * Responds to 'modifyCurrentMission' notification
    */
   editMission: function() {
      if(!self.isRunning) {
         self.toggleEditScreen(true);
      }
   },

   /**
    * STUB FUNCTION
    * Starts the current mission.
    * Responds to 'stopCurrentMission' notification
    */
   stopMission: function() {
      if(self.isRunning) {
         console.log("STOP MISSION!");
         ipcRenderer.send('missionStop');

         ipcRenderer.send('post', 'lockBoundingMarkers', false);

         //change state
         self.isRunning = false;
         //update ui
         context.document.getElementById('editMissionButton').disabled = false;
         context.document.getElementById('StartMissionButton').style.display = "";
         context.document.getElementById('StopMissionButton').style.display = "none";
      }
   },

   /*
    * Moves the specified marker to the lat/lng values specified
    * Fired when pressing the arrow button
    */
   moveMarkerToLocation: function(markerID) {
      if(context.document.forms['missionSetupForm']['lat' + markerID].value == "" ||
         context.document.forms['missionSetupForm']['lat' + markerID].value == "") {

         return;
      }

      var data = {
         markerID: markerID,
         lat: parseFloat(context.document.forms['missionSetupForm']['lat' + markerID].value),
         lng: parseFloat(context.document.forms['missionSetupForm']['lng' + markerID].value)
      }

      self.updateMarkers(data);
      // update location to be centered around selected marker
      ipcRenderer.send('post', 'mapSetLocation', markers[markerID]);
      ipcRenderer.send('post', 'moveBoundingMarker', markers[markerID]);
   },

   /*
    * Creates a new marker at the center of the map
    * Fired when pressing the new pin button
    */
   createNewMarker: function(markerID) {
      ipcRenderer.send('post', 'createBoundingMarker', { markerID: markerID });
   },

   /*
    * Function fired when the user is finished entering the data in the mission setup.
    * Updates the markers with the entered information and dismisses the mission setup view
    */
   doneEditing: function() {
      // go through the form (hard coded to 2 because as of now only 2 fields)
      for(var i = 0; i < 2; i++) {
         if(context.document.forms['missionSetupForm']['lat' + i].value == "" ||
            context.document.forms['missionSetupForm']['lng' + i].value == "") {

            continue;
         }

         markers[i].lat = parseFloat(context.document.forms['missionSetupForm']['lat' + i].value);
         markers[i].lng = parseFloat(context.document.forms['missionSetupForm']['lng' + i].value);
         ipcRenderer.send('post', 'moveBoundingMarker', markers[i]);

      }

      self.checkReady();
      self.toggleEditScreen(false);
   },

   /*
    * Function fires when a 'boundingMarkerHasChanged' notification is received.
    * Updates the latitude/longitude text box with the values of the new location of the pin
    * Updates the mission setup info table
    */
   updateMarkers: function(data) {
      markers[data.markerID] = data;

      //update lat/lng text boxes
      context.document.forms['missionSetupForm']['lat' + data.markerID].value = data.lat;
      context.document.forms['missionSetupForm']['lng' + data.markerID].value = data.lng;

      //update table
      var marker = context.document.getElementById('pin' + (data.markerID+1));
      marker.cells[1].innerText = Math.abs(data.lat.toFixed(5)) + ((data.lat >= 0) ? "N" : "S") + "\n" + Math.abs(data.lng.toFixed(5)) + ((data.lng >= 0) ? "E" : "W");
      var table = context.document.getElementById('SetupInfoTable');

      var area = self.findBoxArea();

      var avgSecPerSqMeter = 0.1; //sample data
      var numberOfUAVs = 1; //use number of connected devices

      var estTime = self.findEstimatedTime(area, avgSecPerSqMeter, numberOfUAVs);

      context.document.getElementById('totalSelectedArea').cells[1].innerText = (area/1000.0).toFixed(5) + " sq. km";
      context.document.getElementById('estimatedCompletionTime').cells[1].innerHTML = "<span>" + estTime + "s</span><br><span style='font-size:75%;'>At "+avgSecPerSqMeter+" sec/sq.m  with "+ numberOfUAVs + ((numberOfUAVs > 1) ? " devices" : " device" )+"</span>";
   },

   /**
    * Calculates the area of the bounding box and sets the value into the info table
    */
   findBoxArea: function() {
      const R = 6371008.8; //mean radius of earth
      const x1 = (((markers[0].lng < markers[1].lng) ? markers[0].lng : markers[1].lng) + 180) * (2 * Math.PI) / 360;
      const x2 = (((markers[0].lng < markers[1].lng) ? markers[1].lng : markers[0].lng) + 180) * (2 * Math.PI) / 360;
      const y1 = (((markers[0].lat < markers[1].lat) ? markers[0].lat : markers[1].lat) + 90) * (2 * Math.PI) / 360;
      const y2 = (((markers[0].lat < markers[1].lat) ? markers[1].lat : markers[0].lat) + 90) * (2 * Math.PI) / 360;

      var area = R*R*(-Math.cos(y2) + Math.cos(y1))*(x2-x1);

      return area;
   },

   /**
    * Calculates the estimated time to complete search based on devices & speed.
    */
   findEstimatedTime: function(area, avgSecPerSqMeter, numberOfUAVs) {
      var time = ((area * avgSecPerSqMeter)/numberOfUAVs).toFixed(0);

      return time;
   },

   /*
    * Function fires when a 'saveConfig' notification is received.
    * Saves the information to the text file specified by fileInfo
    */
   saveConfig: function(event, fileInfo) {
      var data = {
         markers: markers
      };

      fileInfo.dataToWrite['missionSetupElement'] = data;
      fs.writeFileSync(fileInfo.fname, JSON.stringify(fileInfo.dataToWrite));
   },

   /*
    * Function fires when a 'loadConfig' notification is received.
    * Loads the data from the data object that is passed.
    */
   loadConfig: function(event, data) {
      for(var i = 0; i < data.missionSetupElement.markers.length; i++) {
         if(isNaN(data.missionSetupElement.markers[i].lat) || isNaN(data.missionSetupElement.markers[i].lng)) {
            continue;
         }
         self.updateMarkers(data.missionSetupElement.markers[i]);
         ipcRenderer.send('post', 'moveBoundingMarker', data.missionSetupElement.markers[i]);
      }
   },

   /*
    * Toggle the current state of the editing elements on/off
    * Or manually set the state of the elements (state must be a boolean value)
    */
   toggleEditScreen: function(state) {
      if(state !== undefined && (state == true || state == false)) {
         self.toggleEditScreen.isOn = !state;
      }

      if(self.toggleEditScreen.isOn === true) {
         var subelements = context.document.getElementsByClassName('input');
         for(var i = 0; i < subelements.length; i++) {
            subelements[i].setAttribute('disabled', true);
         }
         self.showMenu(false);
         self.toggleEditScreen.isOn = false;
      } else {
         var subelements = context.document.getElementsByClassName('input');
         for(var i = 0; i < subelements.length; i++) {
            subelements[i].removeAttribute('disabled');
         }
         self.showMenu(true);
         self.toggleEditScreen.isOn = true;
      }
   },

   /*
    * Toggles the UI to a "ready" state
    */
   checkReady: function() {
      //check that bounding box is set

      var boundingBoxSet = true;
      for(var i = 0; i < 2; i++) {
         if(markers[i].lat == undefined || markers[i].lng == undefined) {
            boundingBoxSet = false;
            break;
         }
      }

      //check that at least 1 vehicle connected
      var count = 0;
      for(var key in self.vehicles) {
         count++;
      }

      if(count < 1 && boundingBoxSet) {
         self.isReady = true;
         context.document.getElementById("StartMissionButton").disabled = false;
      } else {
         self.isReady = false;
         context.document.getElementById("StartMissionButton").disabled = true;
      }
   },

   updateBoundingBoxAngle: function(newAngle) {
      ipcRenderer.send('post', 'setBoundingAngle', newAngle);
   },

   /*
    * Animates the mission setup menu to either show/hide
    */
   showMenu: function(state) {
      var viewport = context.document.querySelector('.modalViewport');
      if(state) {
         viewport.classList.add('modalViewport-visible');
      } else { //state == false
         viewport.classList.remove('modalViewport-visible');
      }
   },


   /*
    * Helper function to abstract getting a global variable.
    * Ensures that the global variable is always up to date
    *
    * globName is the name of the global (String)
    * variableName is the name of the local variable where a reference to the global is being stored locally (String)
    */
   getGlobal: function(globName, variableName) {
      var globVal = ipcRenderer.sendSync("getGlobal", globName);

      //register listener so that global is always up to date.
      ipcRenderer.on("refreshGlobal", (event, updatedVarName, value) => {
         this[updatedVarName] = value;
         console.log(this[updatedVarName]);
      });

      this[variableName] = globVal;
   },

   /*
    * Helper function to abstract the updating of global variables.
    */
   updateGlobal: function(globName, value) {
      ipcRenderer.send("updateGlobal", globName, value);
   }

}
