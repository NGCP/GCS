import { GridLayer, withLeaflet } from 'react-leaflet';

import TileLayer from '../../util/TileLayer.CachedTileLayer.js';

class CachedTileLayer extends GridLayer {
  createLeafletElement(props) {
    const temp = new TileLayer(props.url, this.getOptions(props));
    console.log(temp);
    return temp;
  }

  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);

    if (toProps.url !== fromProps.url) {
      this.leafletElement.setUrl(toProps.url);
    }
  }
}

export default withLeaflet(CachedTileLayer);
