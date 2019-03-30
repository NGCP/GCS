/*
 * import { CachedTileLayer as LeafletCachedTileLayer } from '@yaga/leaflet-cached-tile-layer'
 * import { GridLayer, GridLayerProps, withLeaflet } from 'react-leaflet';
 *
 * type LeafletElement = LeafletCachedTileLayer;
 * type Props = { url: string } & GridLayerProps
 *
 * class CachedTileLayer extends GridLayer<LeafletElement, Props> {
 *   public createLeafletElement(props: Props): LeafletElement {
 *     return new CachedTileLayer(props.url, this.getOptions(props));
 *   }
 *
 *   public updateLafletElement(fromProps: Props, toProps: Props): void {
 *     super.updateLeafletElement(fromProps, toProps);
 *
 *     if(toProps.url !== fromProps.url) {
 *       this.leafletElement.setUrl(toProps.url);
 *     }
 *   }
 * }
 *
 * export default withLeaflet(CachedTileLayer);
 */
