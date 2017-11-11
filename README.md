# Mission Control | NGCP GCS Team 2017 - 2018
This year, one of the NGCP's biggest goals is to have a working Ground Control Station/Mission Control.
This ground control station application will be used to view and set missions for all autonomous vehicle platforms in [NGCP](http://www.calpolyngcp.com/about.html)

## Features

- Google Maps integration
- Modular design

## Dependencies
### Make sure you have these installed

- [NodeJS](https://nodejs.org/en/) - a dependecy for electron
- [Electron](https://electron.atom.io) - used to run the desktop application, make sure to install **globally**
- [jQuery](https://jquery.com)

## Getting Started

### Setting Things Up

* Open up your terminal application and clone this repository
~~~~
git clone https://github.com/chocolatecharme/ngcp-gcs.git
~~~~
### Running the Program

* In the terminal, go to the directory you cloned and run the program
~~~~
cd missioncontrol
electron .
~~~~

## Design Goals

* Create a GUI that contains vehicle locations and data.
* Make sure our GUI works with [CommsProtocol](https://github.com/NGCP/CommProtocol "CommsProtocol").

## Contributing

Please read our [wiki](https://github.com/NGCP/missioncontrol/wiki) about how to setup a development environment and contributing code to our project.
