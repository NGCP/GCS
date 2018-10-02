const {ipcRenderer, remote} = require('electron');
const dialog = remote.require('electron').dialog;
const fs = require('fs');
const url = require('url');
const path = require('path');

let context = null;
let self = null;
let popOutWindow = null;

module.exports = {

   /*
    * Initialize the missionSetup
    * Inits the event notifications from main
    * Overrides document to be the given document (default document is top, not this document)
    */
   init: function (thisContext) {
      context = thisContext;
      self = this;

      ipcRenderer.on('logMessage', (event, data) => {
         if(popOutWindow != null) {
            popOutWindow.webContents.send("logMessage", data);
         }
         context.printMessages(data);
      });
   },

   /*
    * Write the log to file in specified location.
    */
   writeLogToFile: function() {
      //query the user for a location to save the file
      var date = new Date();
      var d =  date.toLocaleDateString('en-US').replace(/\//g, '');
      var t = date.toLocaleTimeString('en-US', {hour12: false}).replace(/:/g, '');
      var fname = d + "_" + t;
      //display a save dialog box asynchronously
      dialog.showSaveDialog({title: "Save Log", defaultPath: "./"+fname+".txt"}, (path) => {
         if(path == undefined) return; //user canceled operation

         //obtain all the text from the log & parse it into a text-only friendly format
         var logMessages = context.document.getElementById("displayed").getElementsByTagName('span');
         var outputText = "Mission control log file generated on " + date.toLocaleDateString('en-US') + " " + date.toLocaleTimeString('en-US') + "\n\n";
         for(var i = 0; i < logMessages.length; i++) {
            outputText += "[" + logMessages[i].className + "] " + logMessages[i].innerText + "\n";
         }

         //write to file at specified location
         fs.writeFile(path, outputText, (err) => {
            if(err) {
               dialog.showErrorBox("Error Saving Log File!", err.message)
               throw err;
            }
         });
      });
   },

   /**
    * Creates a pop-out window with the log
    */
   popOut: function() {
      popOutWindow = new remote.BrowserWindow({width:600, height:400, show: false});

      //popOutWindow.setMenu(null);

      popOutWindow.once('closed', () => {
         context.document.getElementById('logContainerViewport').style.display = 'block';
         popOutWindow = null;
      });

      popOutWindow.once('ready-to-show', () => {
         popOutWindow.webContents.executeJavaScript("document.getElementById('logPopoutButton').style.display = 'none';");
         var data = context.document.getElementById('displayed').innerHTML;
         popOutWindow.webContents.executeJavaScript("document.getElementById('displayed').innerHTML = '" + data + "';");
         //context.document.getElementById('logContainerViewport').style.display = 'none';
         popOutWindow.show();
      });

      popOutWindow.loadURL(url.format({
         pathname: path.join(__dirname, 'logContainer.html'),
         protocol: 'file',
         slashes: true
      }));
   },


   printMessage: function() {
      var messages = [
         {
            type: "ERROR",
            content: "Mission start failure"
         },
         {
            type: "COMM",
            content: "Quad A requesting open channel"
         },
         {
            type: "SUCCESS",
            content: "Mission started successfully"
         },
         {
            type: "UI",
            content: "This is the UI"
         }
      ];

      ipcRenderer.send("post", "logMessage", messages[Math.floor(Math.random() * 4)]);
   }

}
