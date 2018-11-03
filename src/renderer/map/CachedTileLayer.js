import { ipcRenderer } from 'electron';
import L from 'leaflet';
import PouchDB from 'pouchdb';
import React, { Component, createRef } from 'react';
import { TileLayer } from 'react-leaflet';

const CACHE_FORMAT = 'image/png';
const CACHE_MAX_AGE = 24 * 3600 * 1000;

export default class CachedTileLayer extends Component {
  constructor(props) {
    super(props);

    this.ref = createRef();
    this.db = new PouchDB('cached-tiles');
    this.canvas = document.createElement('canvas');

    this.cacheMapTiles = this.cacheMapTiles.bind(this);

    ipcRenderer.on('cacheMapTiles', this.cacheMapTiles);
  }

  cacheMapTiles() {
    if (!this.ref.current || !this.ref.current.leafletElement) return;

    const tileLayer = this.ref.current.leafletElement;
  }

  render() {
    return <TileLayer ref={this.ref} {...this.props} />;
  }
}
