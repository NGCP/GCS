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

      //Create a new vehicle object with default fields if not specified
      var newVehicle = {
         markerID: (data.markerID != undefined) ? data.markerID : "Quad " + (table.rows.length-2),
         lat: (data.lat != undefined) ? data.lat : 0,
         lng: (data.lng != undefined) ? data.lng : 0,
         iconType: (data.iconType != undefined) ? data.iconType : "uav1",
         status: (data.status != undefined) ? data.status : {type: "INIT", message:"Awaiting connection..."},
         role: data.role,
         mac: data.mac
      }

      newRow.id = newVehicle.markerID;
      newRow.insertCell(0).innerHTML = "<a href='#' onclick='renderer.goToMarker(\""+newVehicle.markerID+"\")'>" + newVehicle.markerID + "</a>";
      newRow.insertCell(1).innerHTML = "<span class='"+newVehicle.status.type+"'>"+newVehicle.status.message+"<span>";

      newRow.insertCell(2).innerHTML = "<select name='role' id='"+newRow.id+"RoleSelector' onchange='renderer.changeRole(this);'><option value='0'" + ((newVehicle.role == 0) ? "selected" : "" ) + ">Quick</option><option value='1'" + ((newVehicle.role == 1) ? "selected" : "" ) + ">Detail</option></select>";


      this.vehicles[newVehicle.markerID] = newVehicle;
      this.updateGlobal('vehicles', this.vehicles);


      //notify other renderers about the moving of a vehicle marker
      ipcRenderer.send('post', 'moveMarker', newVehicle);

      //notify main process & attempt to connect to newly added vehicle
      ipcRenderer.send('connectWithNewVehicle', newVehicle);
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
      if(data.iconType != thisVehicle.iconType && data.iconType != undefined) {
         thisVehicle.iconType = data.iconType;
         markerHasMoved = true;
      }
      if(markerHasMoved) {
         ipcRenderer.send('post', 'moveMarker', thisVehicle);
      }

      if(data.status != thisVehicle.status && data.status != undefined) {
         thisVehicle.status = data.status;
         context.document.getElementById(data.markerID).cells[1].innerHTML = "<span class='"+thisVehicle.status.type+"'>"+thisVehicle.status.message+"<span>";
      }

      if(data.role != thisVehicle.role && data.role != undefined) {
         thisVehicle.role = data.role;

         var row = context.document.getElementById(data.markerID);

         row.cells[2].innerHTML = "<select name='role' id='"+data.markerID+"RoleSelector'><option value='0'" + ((data.role == 0) ? "selected" : "" ) + ">Quick</option><option value='1'" + ((data.role == 1) ? "selected" : "" ) + ">Detail</option></select>";

      }

      this.updateGlobal('vehicles', this.vehicles);

   },

   /*
    * Function that changes the role of a vehicle according to the selection
    */
   changeRole: function(data) {
      console.log(data.id.slice(0,-12));

      var thisVehicle = this.vehicles[data.id.slice(0,-12)];
      thisVehicle.role = data.value;

      ipcRenderer.send('connectWithNewVehicle', thisVehicle);
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
