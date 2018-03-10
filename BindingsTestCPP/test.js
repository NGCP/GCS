const cppBinder = require('./build/Release/cppBinder');

module.exports = {

   connect: function() {
      console.log(cppBinder.connect("/dev/tty.SLAB_USBtoUART"))
   },

   testSend: function() {
      console.log(cppBinder.sendData("HELLO WORLD", "0x0013A2004105C6B4"));
   },

   getData: function() {
      var arr = cppBinder.getData();
      for(var i = 0; i < arr.length; i++) {
         console.log(arr[i]);
      }
   }
}
