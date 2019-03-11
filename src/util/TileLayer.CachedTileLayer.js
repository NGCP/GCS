/*
 * Credits:
 *   MazeMap's Leaflet PouchDBCached: https://github.com/MazeMap/Leaflet.TileLayer.PouchDBCached/blob/master/L.TileLayer.PouchDBCached.js
 *   Leaflet's TileLayer:             https://github.com/Leaflet/Leaflet/blob/master/src/layer/tile/TileLayer.js
 *
 * No linting here as code is not written by us.
 */

/* eslint-disable */

import L from 'leaflet';
import PouchDB from 'pouchdb';

export default L.TileLayer.CachedTileLayer = L.TileLayer.extend({
  options: {
    useCache: false,
    saveToCache: true,
    useOnlyCache: false,
    cacheMaxAge: 24 * 3600 * 1000,
  },

  /**
   * Adds custom options to support options with caching to normal TileLayer.
   * @override
   */
  initialize: function initialize(url, options) {
    this._url = url;
    options = L.Util.setOptions(this, { ...this.options, ...options, cacheFormat: 'image/png' });

    if (!options.useCache) {
      this._db = null;
      return;
    }

    this._db = new PouchDB('offline-tiles');

    if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {
      options.tileSize = Math.floor(options.tileSize / 2);
      if (!options.zoomReverse) {
        options.zoomOffset++;
        options.maxZoom--;
      } else {
        options.zoomOffset--;
        options.minZoom++;
      }
    }

    if (typeof options.subdomains === 'string') {
      options.subdomains = options.subdomains.split('');
    }

    if (!L.Browser.android) {
      this.on('tileunload', this._onTileRemove);
    }
  },

  /**
   * Adds support to create cached tiles to a normal TileLayer.
   * @override
   */
  createTile: function createTile(coords, done) {
    const tile = document.createElement('img');

    tile.onerror = L.bind(this._tileOnError, this, done, tile);

    if (this.options.crossOrigin) {
      tile.crossOrigin = '';
    }

    tile.alt = '';

    tile.setAttribute('role', 'presentation');

    const tileUrl = this.getTileUrl(coords);
    if (this.options.useCache) {
      this._db.get(tileUrl, { revs_info: true }, this._onCacheLookup(tile, tileUrl, done));
    } else {
      tile.onload = L.bind(this._tileOnLoad, this, done, tile);
      tile.src = tileUrl;
    }

    return tile;
  },

  /**
   * Returns a callback to be run when the database is finished with a fetch operation.
   * @param {Object} tile tile description
   * @param {string} tileUrl tile url
   * @param {bool} done status
   * @returns {Function}
   */
  _onCacheLookup: function _onCacheLookup(tile, tileUrl, done) {
    return (err, data) => {
      if (err) {} // eslint-disable-line no-empty

      if (data) {
        return this._onCacheHit(tile, tileUrl, data, done);
      }

      return this._onCacheMiss(tile, tileUrl, done);
    };
  },

  _onCacheHit: function _onCacheHit(tile, tileUrl, data, done) {
    this.fire('tilecachehit', {
      tile,
      url: tileUrl,
    });

    this._db.getAttachment(tileUrl, 'tile').then((blob) => {
      const url = URL.createObjectURL(blob);

      if (Date.now() > data.timestamp + this.options.cacheMaxAge && !this.options.useOnlyCache) {
        if (this.options.saveToCache) {
          tile.onload = L.bind(this._saveTile, this, tile, tileUrl, data._revs_info[0].rev, done);
        }

        tile.crossOrigin = 'Anonymous';
        tile.src = tileUrl;
        tile.onerror = () => { this.src = url; };
      } else {
        tile.onload = L.bind(this._tileOnLoad, this, done, tile);
        tile.src = url;
      }
    });
  },

  _onCacheMiss: function _onCacheMiss(tile, tileUrl, done) {
    this.fire('tilecachemiss', {
      tile,
      url: tileUrl,
    });

    if (this.options.useOnlyCache) {
      tile.onload = L.Util.falseFn;
      tile.src = L.Util.emptyImageUrl;
    } else {
      if (this.options.saveToCache) {
        tile.onload = L.bind(this._saveTile, this, tile, tileUrl, undefined, done);
      } else {
        tile.onload = L.bind(this._tileOnLoad, this, done, tile);
      }

      tile.crossOrigin = 'Anonymous';
      tile.src = tileUrl;
    }
  },

  /**
   * Returns an event handler that runs when the tile is ready.
   * The handler will delete the document from PouchDB if an existing revision is found, keeping
   * latest valid copy of the image in the cache.
   * @param {Object} tile tile description
   * @param {string} tileUrl tile url
   * @param {bool} existingRevision check in cache if tile is there
   * @param {bool} done status
   */
  _saveTile: function _saveTile(tile, tileUrl, existingRevision, done) {
    if (!this.options.saveToCache) return;

    const canvas = document.createElement('canvas');
    canvas.width = tile.naturalWidth || tile.width;
    canvas.height = tile.naturalHeight || tile.height;

    const context = canvas.getContext('2d');
    context.drawImage(tile, 0, 0);

    const format = this.options.cacheFormat;

    canvas.toBlob((blob) => {
      this._db.put({
        _id: tileUrl,
        _rev: existingRevision,
        timestamp: Date.now(),
      })
        .then(status => this._db.putAttachment(tileUrl, 'tile', status.rev, blob, format))
        .then(() => {
          if (done) done();
        })
        .catch(() => {
          if (done) done();
        });
    });
  },

  /**
   * Starts seeding the cache given a bounding box and a min/max zoom level.
   * @param {L.LatLngBounds} bbox bounds
   * @param {number} minZoom min zoom level
   * @param {number} maxZoom max zoom level
   */
  seed: function seed(bbox, minZoom, maxZoom) {
    if (!this.options.useCache) return;
    if (minZoom > maxZoom) return;
    if (!this._map) return;

    const queue = [];

    for (let z = minZoom; z <= maxZoom; z++) {
      const northEastPoint = this._map.project(bbox.getNorthEast(), z);
      const southWestPoint = this._map.project(bbox.getSouthWest(), z);

      const tileBounds = this._pxBoundsToTileRange(L.bounds([northEastPoint, southWestPoint]));

      for (let j = tileBounds.min.y; j <= tileBounds.max.y; j++) {
        for (let i = tileBounds.min.x; i <= tileBounds.max.x; i++) {
          const point = new L.point(i, j);
          point.z = z;
          queue.push(this._getTileUrl(point));
        }
      }
    }

    const seedData = {
      bbox,
      minZoom,
      maxZoom,
      queueLength: queue.length,
    };

    this.fire('seedstart', seedData);
    const tile = this._createTile();
    tile._layer = this;
    this._seedOneTile(tile, queue, seedData);
  },

  _createTile: function _createTile() {
    return document.createElement('img');
  },

  /**
   * Custom getTileUrl function that uses coords instead of the maps current zoomlevel
   * @param {Object} coords map coords
   * @returns {string}
   */
  _getTileUrl: function _getTileUrl(coords) {
    let zoom = coords.z;
    if (this.options.zoomReverse) {
      zoom = this.options.maxZoom - zoom;
    }
    zoom += this.options.zoomOffset;

    return L.Util.template(this._url, L.extend({
      r: this.options.detectRetina && L.Browser.retina && this.optiona.maxZoom > 0 ? '@2x' : '',
      s: this._getSubdomain(coords),
      x: coords.x,
      y: this.options.tms ? this._globalTileRange.max.y - coords.y : coords.y,
      z: this.options.maxNativeZoom ? Math.min(zoom, this.options.maxNativeZoom) : zoom,
    }, this.options));
  },

  /**
   * Uses a defined tile to eat through one item in the queue and asynchrounously recursively call
   * itself when the tile has finished loading.
   * @param {Object} tile the tile to load
   * @param {Array} remaining remaining tiles to load
   * @param {Object} seedData data about tile to seed
   */
  _seedOneTile: function _seedOneTile(tile, remaining, seedData) {
    if (!remaining.length) {
      this.fire('seedend', seedData);
      return;
    }
    this.fire('seedprogress', {
      bbox: seedData.bbox,
      minZoom: seedData.minZoom,
      maxZoom: seedData.maxZoom,
      queueLength: seedData.queueLength,
      remainingLength: remaining.length,
    });

    const url = remaining.shift();

    this._db.get(url, (err, data) => {
      if (err) {} // eslint-disable-line no-empty

      if (!data) {
        tile.onload = () => {
          this._saveTile(tile, url, null);
          this._seedOneTile(tile, remaining, seedData);
        };

        tile.crossOrigin = 'Anonymous';
        tile.src = url;
      } else {
        this._seedOneTile(tile, remaining, seedData);
      }
    });
  },
});
