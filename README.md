# NGCP Ground Control Station

[![Build Status](https://travis-ci.com/NGCP/GCS.svg?branch=master)](https://travis-ci.com/NGCP/GCS)
[![Documentation Status](https://readthedocs.org/projects/ground-control-station/badge/?version=latest)](https://readthedocs.org/projects/ground-control-station/builds/)
[![Coverage Status](https://coveralls.io/repos/github/NGCP/GCS/badge.svg?branch=master)](https://coveralls.io/github/NGCP/GCS?branch=master)
[![dependencies Status](https://david-dm.org/NGCP/GCS/status.svg)](https://david-dm.org/NGCP/GCS)
[![devDependencies Status](https://david-dm.org/NGCP/GCS/dev-status.svg)](https://david-dm.org/NGCP/GCS?type=dev)

## Introduction

The [Northrop Grumman Collaboration Project][] presents the Ground Control Station (GCS). This
project's objective is to view and set missions for all autonomous vehicle platforms in the project.

Documentation for the GCS can be found [here](https://ground-control-station.readthedocs.io/).

## Quick start

### Setting things up

You will need the LTS version of [Node.js][].

Open up your command line application and clone this repository

```bash
git clone https://github.com/NGCP/GCS.git
```

### Running the program

Create a [Mapbox][] account and obtain a public API access token. Create a `.env` file, copy the
content of the `.env.example` to it, and replace `your-access-token` with your own access token.

```bash
MAPBOX_TOKEN=your-access-token
```

Install all required third-party libraries and run the program:

```bash
npm install
npm start
```

## License

[MIT][]

[Northrop Grumman Collaboration Project]: http://www.ngcpcalpoly.com/about.html
[Node.js]: https://nodejs.org/
[Mapbox]: https://www.mapbox.com/
[MIT]: https://github.com/NGCP/GCS/blob/master/LICENSE
