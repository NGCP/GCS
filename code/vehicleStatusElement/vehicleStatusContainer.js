/*
 * JavaScript file/method definitions for MAPCONTAINER.HTML
 */
const {ipcRenderer, remote} = require('electron');

let self;
let context;

module.exports = {

   vehicles: {},

   init: function(thisContext) {
      context = thisContext;
      self = this;

      //register listeners
      ipcRenderer.on('onVehicleAdd', (event, data) => { self.addVehicle(data); });
      ipcRenderer.on('onVehicleRemove', (event, data) => { self.removeVehicle(data); });
      ipcRenderer.on('onVehicleUpdate', (event, data) => { self.updateVehicle(data); });

      // use the global vehicles object
      this.getGlobal('vehicles', 'vehicles');
   },

   addVehicle: function(data) {
      var table = context.document.getElementById('vehicleDataTable');
      var newRow = table.insertRow();

      console.log(data.mac);

      //Create a new vehicle object with default fields if not specified
      var newVehicle = {
         markerID: (this.vehicles[data.markerID] != undefined) ? (data.markerID + table.rows.length-1) : data.markerID,
         lat: data.lat,
         lng: data.lng,
         vehicleType: (data.vehicleType != undefined) ? data.vehicleType : "uav1",
         status: (data.status != undefined) ? data.status : {type: "INIT", message:"Connecting..."},
         mac: data.mac
      }

      newRow.id = data.markerID;
      newRow.insertCell(0).innerHTML = newVehicle.markerID;
      newRow.insertCell(1).innerHTML = "<span class='"+newVehicle.status.type+"'>"+newVehicle.status.message+"<span>";
      newRow.insertCell(2).innerHTML = "<button class='goTo' onclick='renderer.goToMarker(\""+newVehicle.markerID+"\")'></button>";

      this.vehicles[newVehicle.markerID] = newVehicle;
      this.updateGlobal('vehicles', this.vehicles);


      ipcRenderer.send('post', 'moveMarker', newVehicle);
   },

   goToMarker: function(markerID) {
      ipcRenderer.send('post', 'mapSetLocation', this.vehicles[markerID]);
   },

   removeVehicle: function(data) {
      //no-op
   },

   updateVehicle: function(data) {
      var thisVehicle = this.vehicles[data.markerID];
      if(thisVehicle == undefined) {
         return;
      }
      var markerHasMoved = false;

      if(data.lat != thisVehicle.lat && data.lat != undefined) {
         thisVehicle.lat = data.lat;
         markerHasMoved = true;
      }
      if(data.lng != thisVehicle.lng && data.lng != undefined) {
         thisVehicle.lng = data.lng;
         markerHasMoved = true;
      }
      if(data.vehicleType != thisVehicle.vehicleType && data.vehicleType != undefined) {
         thisVehicle.vehicleType = data.vehicleType;
         markerHasMoved = true;
      }
      if(markerHasMoved) {
         ipcRenderer.send('post', 'moveMarker', thisVehicle);
      }

      if(data.status != thisVehicle.status && data.status != undefined) {
         thisVehicle.status = data.status;
         context.document.getElementById(data.markerID).cells[1].innerHTML = "<span class='"+thisVehicle.status.type+"'>"+thisVehicle.status.message+"<span>";
      }

      this.updateGlobal('vehicles', this.vehicles);

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
      });

      this[variableName] = globVal;
   },

   /*
    * Helper function to abstract the updating of global variables.
    */
   updateGlobal: function(globName, value) {
      ipcRenderer.send("updateGlobal", globName, value);
   }

};
