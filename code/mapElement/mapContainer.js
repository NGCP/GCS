/*
 * JavaScript file/method definitions for MAPCONTAINER.HTML
 */
const {ipcRenderer, remote} = require('electron');
const fs = require('fs');
const path = require('path');

let theMap;
let context;
let self;
let boundingMarkers = {};
let boundingBox = null;
let markers = {};

module.exports = {

   init: function(thisContext) {
      context = thisContext;
      self = this;


      ipcRenderer.on('saveConfig', self.saveConfig);
      ipcRenderer.on('loadConfig', self.loadConfig);

      ipcRenderer.on('createBoundingMarker', (event, data) => {
         if(boundingMarkers[data.markerID] != null) {
            boundingMarkers[data.markerID].setMap(null);
         }
         data['lat'] = theMap.getCenter().lat();
         data['lng'] = theMap.getCenter().lng();
         self.createBoundingMarker(data);
         ipcRenderer.send('post', 'boundingMarkerHasChanged', data);
      });

      ipcRenderer.on('moveBoundingMarker', (event, data) => {
         self.moveBoundingMarker(data);
      });

      ipcRenderer.on('mapSetLocation', (event, data) => {
         self.updateMapLocation(data);
      });

      ipcRenderer.on('moveToMyLocation', () => {
         self.setMapToMyLocation();
      });

      ipcRenderer.on('moveMarker', (event, data) => {
         self.moveMarker(data);
      });

      ipcRenderer.on('lockBoundingMarkers', (event, data) => {
         self.lockBoundingMarkers(data);
      })
   },

   /*
    * Load the map into the document element specified by mapContainerElement
    */
   loadMap: function(mapContainerElement) {

      theMap = new context.google.maps.Map(context.document.getElementById(mapContainerElement), {
         center: {lat: 35.306205, lng: -120.662227},
         zoom: 18,
         disableDefaultUI: true,
         zoomControl: true,
         mapTypeControl: true,
         mapTypeId: context.google.maps.MapTypeId.HYBRID,
         scaleControl: true,
         streetViewControl: false,
         rotateControl: false,
         fullScreenControl: false
      });
      theMap.setTilt(0);

      var startingLocation = remote.getGlobal('defaultLocation');
      if(startingLocation == null) { //use my current location
         self.setMapToMyLocation();
      } else {
         self.updateMapLocation(startingLocation);
      }

   },

   /**
    * Finds the device location and sets it as the map center
    */
   setMapToMyLocation: function() {
      //check that geolocation is supported
      if (navigator.geolocation) {
         //get current position
         navigator.geolocation.getCurrentPosition((position) => {
            //found position
            self.updateMapLocation({lat: position.coords.latitude, lng: position.coords.longitude});
         }, () => {
            //failed to find position
         });
      }
   },

   /*
    *  Update the center location of the map to the given latitude and longitude values
    */
   updateMapLocation: function(data) {
      theMap.setCenter(new context.google.maps.LatLng(data.lat, data.lng));
      if(data.zoom != undefined) {
         theMap.setZoom(data.zoom);
      }
   },

   /**
    * Moves specified marker and updates the icon and label if necessary.
    * If specified marker is undefined, then a new marker is created.
    */
   moveMarker: function(data) {

      if(markers[data.markerID] == undefined) {

         var icon = {
            url: path.join( __dirname, '..', '..', 'resources', 'images','markers', data.vehicleType+".png"),
            scaledSize: new context.google.maps.Size(50, 50),
            anchor: new context.google.maps.Point(25, 25),
            labelOrigin: new context.google.maps.Point(25, 55)
         };

         markers[data.markerID] = new context.google.maps.Marker({
            position: {lat: data.lat, lng: data.lng},
            map: theMap,
            draggable: false,
            icon: icon,
            label: data.markerID
         });

      } else {
         markers[data.markerID].setPosition({lat: data.lat, lng: data.lng});
         if(path.basename(markers[data.markerID].getIcon().url, ".png") != data.vehicleType) {

            var icon = {
               url: path.join( __dirname, '..', '..', 'resources', 'images','markers', data.vehicleType+".png"),
               scaledSize: new context.google.maps.Size(50, 50),
               anchor: new context.google.maps.Point(25, 25),
               labelOrigin: new context.google.maps.Point(25, 55)
            };
            markers[data.markerID].setIcon(icon);
         }
      }

   },

   /*
    * Creates a bounding marker at the given location.
    */
   createBoundingMarker: function(data) {

      boundingMarkers[data.markerID] = new context.google.maps.Marker({
         position: {lat: data.lat, lng: data.lng},
         map: theMap,
         draggable: true,
         animation: context.google.maps.Animation.DROP
      });

      // create listener for dragging the markers
      boundingMarkers[data.markerID].addListener('drag', function(event) {
         self.updateBoundingBox();
         ipcRenderer.send('post', 'boundingMarkerHasChanged', { markerID: data.markerID, lat: event.latLng.lat(), lng: event.latLng.lng() });
      });

      self.updateBoundingBox();

   },

   /*
    * Moves an existing bounding marker to the given location. Calls createBoundingMaker if
    * specified bounding marker does not exist.
    */
   moveBoundingMarker: function(data) {
      ipcRenderer.send('post', 'boundingMarkerHasChanged', data);
      if(boundingMarkers[data.markerID] != null) {
         boundingMarkers[data.markerID].setPosition({ lat: data.lat, lng: data.lng });
         self.updateBoundingBox();
      } else {
         self.createBoundingMarker(data);
      }
   },

   /*
    * Creates and sets the bounding box on the map based on the defined points
    * Box is created with the first two points in the markers; if they
    * are not defined, then no operation is taken. If more than two points are
    * defined, they are ingored.
    */
   updateBoundingBox: function() {
      if(boundingMarkers[0] != null && boundingMarkers[1] != null) {

         if(boundingBox == null) {
            boundingBox = new context.google.maps.Rectangle({
               strokeColor: '#FF0000',
               strokeOpacity: 0.5,
               strokeWeight: 2,
               fillColor: '#FF0000',
               fillOpacity: 0.10,
               map: theMap,
               bounds: {
                  north: Math.max(boundingMarkers[0].position.lat(), boundingMarkers[1].position.lat()),
                  south: Math.min(boundingMarkers[0].position.lat(), boundingMarkers[1].position.lat()),
                  east: Math.max(boundingMarkers[0].position.lng(), boundingMarkers[1].position.lng()),
                  west: Math.min(boundingMarkers[0].position.lng(), boundingMarkers[1].position.lng())
              }
            });

            var centerMapButton = context.document.createElement('button');
            centerMapButton.innerHTML = 'Recenter Map';
            centerMapButton.index = 1;

            //button css styling
            centerMapButton.style.margin = "10px";
            centerMapButton.style.color = "#565656";
            centerMapButton.style.backgroundColor = "#FFFFFF";
            centerMapButton.style.padding = "8px";
            centerMapButton.style.paddingBottom = "21px";
            centerMapButton.style.fontFamily = "Roboto, Arial, sans-serif";
            centerMapButton.style.fontSize = "11px";
            centerMapButton.style.border = "0px";
            centerMapButton.style.borderRadius = "2px";

            theMap.controls[context.google.maps.ControlPosition.TOP_LEFT].push(centerMapButton);

            centerMapButton.addEventListener('click', function() {
               theMap.fitBounds(boundingBox.getBounds());
            });

           theMap.fitBounds(boundingBox.getBounds());

         } else {
            boundingBox.setBounds({
               north: Math.max(boundingMarkers[0].position.lat(), boundingMarkers[1].position.lat()),
               south: Math.min(boundingMarkers[0].position.lat(), boundingMarkers[1].position.lat()),
               east: Math.max(boundingMarkers[0].position.lng(), boundingMarkers[1].position.lng()),
               west: Math.min(boundingMarkers[0].position.lng(), boundingMarkers[1].position.lng())
            });
         }

      }
   },

   /*
    * Prevent changes to the bounding markers.
    * Locks when state = true, unlock on false
    */
   lockBoundingMarkers: function(state) {
      for(var markerID in boundingMarkers) {
         boundingMarkers[markerID].setDraggable(!state);
         boundingMarkers[markerID].setVisible(!state);
      }
   },


   /*
    * Function fires when a 'saveConfig' notification is received.
    */
   saveConfig: function(event, fileInfo) {

      var data = {
         centerLat: parseFloat(theMap.getCenter().lat()),
         centerLng: parseFloat(theMap.getCenter().lng()),
         zoomLevel: parseFloat(theMap.getZoom()),
         mapTypeID: theMap.getMapTypeId()
      };

      fileInfo.dataToWrite['mapContainerElement'] = data;

      fs.writeFileSync(fileInfo.fname, JSON.stringify(fileInfo.dataToWrite));
   },

   /*
    * Function fires when a 'saveConfig' notification is received.
    */
   loadConfig: function(event, data) {

      theMap.setMapTypeId(data.mapContainerElement.mapTypeID);

      //only set map position if no bounding box
      if(boundingBox == null) {
         theMap.setCenter({lat: data.mapContainerElement.centerLat, lng: data.mapContainerElement.centerLng});
         theMap.setZoom(data.mapContainerElement.zoomLevel);
      }

   }

};
