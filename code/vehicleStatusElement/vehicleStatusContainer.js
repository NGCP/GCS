/*
 * JavaScript file/method definitions for MAPCONTAINER.HTML
 */
const {ipcRenderer} = require('electron');

let self;
let context;

var vehicles;

module.exports = {

   init: function(thisContext) {
      context = thisContext;
      self = this;

      //register listeners
      ipcRenderer.on('onVehicleAdd', self.addVehicle);
      ipcRenderer.on('onVehicleRemove', self.removeVehicle);
      ipcRenderer.on('onVehicleUpdate', self.updateVehicle);

      // use the global vehicles object

   },

   addVehicle: function(event, data) {
      var table = context.document.getElementById('vehicleDataTable');
      var newRow = table.insertRow();

      var newVehicle = {
         markerID: (vehicles[data.markerID] != undefined) ? (data.markerID + table.rows.length-1) : data.markerID,
         lat: data.lat,
         lng: data.lng,
         vehicleType: (data.vehicleType != undefined) ? data.vehicleType : "uav1",
         status: (data.status != undefined) ? data.status : {type: "INIT", message:"Connecting..."},
         row: newRow
      }

      newRow.insertCell(0).innerHTML = newVehicle.markerID;
      newRow.insertCell(1).innerHTML = "<span class='"+newVehicle.status.type+"'>"+newVehicle.status.message+"<span>";
      newRow.insertCell(2).innerHTML = "<button class='goTo' onclick='renderer.goToMarker(\""+newVehicle.markerID+"\")'></button>";

      vehicles[newVehicle.markerID] = newVehicle;

      ipcRenderer.send('post', 'moveMarker', newVehicle);
   },

   goToMarker: function(markerID) {
      ipcRenderer.send('post', 'mapSetLocation', vehicles[markerID]);
   },

   removeVehicle: function(event, data) {
      //no-op
   },

   updateVehicle: function(event, data) {
      var thisVehicle = vehicles[data.markerID];
      if(thisVehicle == undefined) {
         return;
      }

      if(data.lat != thisVehicle.lat ||
         data.lng != thisVehicle.lng ||
         data.vehicleType != thisVehicle.vehicleType) {

         thisVehicle.lat = data.lat;
         thisVehicle.lng = data.lng;
         thisVehicle.vehicleType = data.vehicleType;
         ipcRenderer.send('post', 'moveMarker', thisVehicle);
      }

      if(data.status != thisVehicle.status) {
         thisVehicle.status = data.status;
         thisVehicle.row.cells[1].innerHTML = "<span class='"+thisVehicle.status.type+"'>"+thisVehicle.status.message+"<span>";
      }

   }

};
