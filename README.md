# NGCP Ground Control Station

[![Build Status](https://travis-ci.com/NGCP/GCS.svg?branch=dev-2018)](https://travis-ci.com/NGCP/GCS)
[![dependencies Status](https://david-dm.org/NGCP/GCS/status.svg)](https://david-dm.org/NGCP/GCS)
[![devDependencies Status](https://david-dm.org/NGCP/GCS/dev-status.svg)](https://david-dm.org/NGCP/GCS?type=dev)

The [Northrop Grumman Collaboration Project] presents the Ground Control Station. This project's objective is to view and set missions for all autonomous vehicle platforms in the project.

This is based on [Node.js], [React], [Webpack], and [Electron].

## Getting Started
**:pencil2: Setting Things Up**

Install [Node.js]. The program will not be able to run without it.

Open up your command line application and clone this repository:

```sh
git clone https://github.com/NGCP/GCS.git
```

**:scroll: Running the Program**

Create a [Mapbox account] and obtain a public API access token. Create a `.env` file, copy the content of the `.env.example` to it, and replace `your-access-token` with your own access token.

```sh
MAPBOX_TOKEN=your-access-token
```

Install all required third-party libraries and run the program:

```sh
npm install
npm start
```

[Northrop Grumman Collaboration Project]: http://www.ngcpcalpoly.com/about.html
[Node.js]: https://github.com/nodejs/node
[React]: https://github.com/facebook/react
[Webpack]: https://github.com/webpack/webpack
[Electron]: https://github.com/electron/electron
[Mapbox account]: https://www.mapbox.com/account/
