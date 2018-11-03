import L from 'leaflet';
import PouchDB from 'pouchdb';

const CACHE_FORMAT = 'image/png';

/**
 * Credit to Leaflet.TileLayer.PouchDBCached, Leaflet, and Leaflet-React for example code to work with.
 */
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
    options = L.Util.setOptions(this, { ...this.options, ...options, cacheFormat: CACHE_FORMAT });

    if (!options.useCache) {
      this._db = null;
      this._canvas = null;
    } else {
      this._db = new PouchDB('cached_tiles');
      this._canvas = document.createElement('canvas');

      if (!this._canvas.getContext || !this._canvas.getContext('2d')) {
        this._canvas = null;
      }
    }

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

    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }

    tile.alt = '';

    tile.setAttribute('role', 'presentation');

    const tileUrl = this.getTileUrl(coords);
    if (this.options.useCache && this._canvas) {
      this._db.get(tileUrl, this._onCacheLookup(tile, tileUrl, done));
    } else {
      tile.onload = L.bind(this._tileOnLoad, this, done, tile);
    }

    tile.src = tileUrl;

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
    return function onCacheLookupCallback(e, data) {
      if (data) {
        this.fire('tilecachehit', {
          tile: tile,
          url: tileUrl,
        });

        if (Date.now() > data.timestamp + this.options.cacheMaxAge && !this.options.useOnlyCache) {
          if (this.options.saveToCache) {
            tile.onload = L.bind(this._saveTile, this, tile, tileUrl, data._revs_info[0].rev, done);
          }

          tile.crossOrigin = 'Anonymous';
          tile.src = tileUrl;
          tile.onerror = () => { this.src = data.dataUrl; };
        } else {
          tile.onload = L.bind(this._tileOnLoad, this, done, tile);
          tile.src = data.dataUrl;
        }
      } else {
        this.fire('tilecachemiss', {
          tile: tile,
          url: tileUrl,
        });

        if (this.options.useOnlyCache) {
          this.onload = L.Util.falseFn;
          tile.src = L.Util.emptyImageUrl;
        } else {
          if (this.options.saveToCache) {
            tile.onload = L.bind(this._saveTile, this, tile, tileUrl, null, done);
          } else {
            tile.onload = L.bind(this._tileOnLoad, this, done, tile);
          }

          tile.crossOrigin = 'Anonymous';
          tile.src = tileUrl;
        }
      }
    }.bind(this);
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
    if (this._canvas === null) return;
    this._canvas.width = tile.naturalWidth || tile.width;
    this._canvas.height = tile.naturalHeight || tile.height;

    const context = this._canvas.getContext('2d');
    context.drawImage(tile, 0, 0);

    let dataUrl;
    try {
      dataUrl = this._canvas.toDataURL(this.options.cacheFormat);
    } catch (e) {
      this.fire('tilecacheerror', { tile: tile, error: e });
      done();
      return;
    }


    const doc = { _id: tileUrl, dataUrl: dataUrl, timestamp: Date.now() };

    this._db.put(doc);

    if (done) done();
  },
});
