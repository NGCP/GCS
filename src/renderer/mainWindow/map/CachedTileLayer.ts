import { GridLayer, withLeaflet } from 'react-leaflet';

// We call with require statements since we do not want to deal with typechecking the JS file.
const TileLayer = require('../../../util/CachedTileLayer'); // eslint-disable-line @typescript-eslint/no-var-requires

/* eslint-disable @typescript-eslint/no-explicit-any */

class CachedTileLayer extends GridLayer {
  public createLeafletElement(props: any): any {
    return new TileLayer(props.url, this.getOptions(props));
  }

  public updateLeafletElement(fromProps: any, toProps: any): void {
    super.updateLeafletElement(fromProps, toProps);

    if (toProps.url !== fromProps.url) {
      (this.leafletElement as any).setUrl(toProps.url);
    }
  }
}

export default withLeaflet(CachedTileLayer);
