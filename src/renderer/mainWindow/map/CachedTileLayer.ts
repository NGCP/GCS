// TODO: Use TileLayer from https://github.com/yagajs/leaflet-cached-tile-layer

/*
 * import { GridLayer, withLeaflet } from 'react-leaflet';
 *
 * class CachedTileLayer extends GridLayer {
 *   public createLeafletElement(props: any): L.GridLayer {
 *     return new TileLayer(props.url, this.getOptions(props));
 *   }
 *
 *   public updateLeafletElement(fromProps: any, toProps: any): void {
 *     super.updateLeafletElement(fromProps, toProps);
 *
 *     if (toProps.url !== fromProps.url) {
 *       (this.leafletElement as any).setUrl(toProps.url);
 *     }
 *   }
 * }
 *
 * export default withLeaflet(CachedTileLayer);
 */
