const cppBinder = require('./build/Release/cppBinder');

module.exports = {

   connect: function() {
      console.log(cppBinder.connect("/dev/ttyUSB0"));
   },

   testSend: function() {
      console.log(cppBinder.sendData("SENT FROM ELECTRON", "0x0013A20040F8064D"));
   },

   getData: function() {
      var arr = cppBinder.getData();
      for(var i = 0; i < arr.length; i++) {
         console.log(arr[i]);
      }
   }
}
