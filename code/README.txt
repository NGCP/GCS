About compiling C++ modules to NodeJS/Electron compatible modules:


Have electron 1.8.4, and cmake-js installed
Both can be installed using npm


Run 'npm install'
  - This will compile the source to run on electron, and download boost dependencies

You may then run the program using 'npm start'

NOTE: Ubuntu (unsure about rest of linux distros) requires elevated permissions to open the usb connection; using sudo works,
however electron must be started manually by running the bin file. This can be done by navigating to the project folder, then
executing 'sudo node_modules/electron/dist/electron .'
for mac: 'sudo node_modules/electron/dist/Electron.app/Contents/MacOS/Electron .' 



To add a custom module to your project, the following statement is needed:  require('./build/Release/<YOUR_CUSTOM_ADDON_NAME>');

Where YOUR_CUSTOM_ADDON_NAME is defined by the CMakeLists.txt file by the line: 'project (YOUR_CUSTOM_ADDON_NAME)'
