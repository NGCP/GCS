About compiling C++ modules to NodeJS/Electron compatible modules:


Have electron 1.7.12+, and cmake-js installed
Both can be installed using npm


Run 'npm install'
  - This will compile the source to run on electron, and download boost dependencies

You may then run electron to launch it.



To add a custom module to your project, the following statement is needed:  require('./build/Release/<YOUR_CUSTOM_ADDON_NAME>');

Where YOUR_CUSTOM_ADDON_NAME is defined by the CMakeLists.txt file by the line: 'project (YOUR_CUSTOM_ADDON_NAME)'
