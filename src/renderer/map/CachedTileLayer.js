import { GridLayer, withLeaflet } from 'react-leaflet';

import TileLayer from '../../util/TileLayer.CachedTileLayer';

class CachedTileLayer extends GridLayer {
  createLeafletElement(props) {
    return new TileLayer(props.url, this.getOptions(props));
  }

  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);

    if (toProps.url !== fromProps.url) {
      this.leafletElement.setUrl(toProps.url);
    }
  }
}

export default withLeaflet(CachedTileLayer);
