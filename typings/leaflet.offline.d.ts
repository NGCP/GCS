import * as Leaflet from 'leaflet';
import 'leaflet.offline';

// This is to let the leaflet.offline module to work
declare module 'leaflet' {
  namespace tileLayer {
    function offline(urlTemplate: string, options?: TileLayerOptions): Leaflet.TileLayer;
  }

  namespace control {
    function savetiles(baseLayer: Leaflet.TileLayer, options?: {
      position?: string;
      saveText?: string;
      rmText?: string;
      maxZoom?: number;
      saveWhatYouSee?: boolean;
      confirm?: (controlStatus: object, callback: () => void) => void;
      confirmRemoval?: () => void;
    }): Leaflet.Control;
  }
}
