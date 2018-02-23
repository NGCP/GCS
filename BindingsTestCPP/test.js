const cppBinder = require('./build/Release/cppBinder');

module.exports = {

   connect: function() {
      console.log(cppBinder.connect("/dev/tty.usbserial-DA01R50T"));
   },

   testSend: function() {
      console.log(cppBinder.sendData("test data", "0x0013A20040A815D6"));
   },

   initListen: function() {
      cppBinder.initCallback( (arg) => {
         console.log(arg);
      })
   }
}
