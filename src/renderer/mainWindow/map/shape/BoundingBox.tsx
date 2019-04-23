import Leaflet from 'leaflet';
import React, { PureComponent, ReactNode } from 'react';
import { Marker, Rectangle } from 'react-leaflet';

import { imageConfig, RecursiveImageSignature } from '../../../../static/index';

import { BoundingBoxBounds } from '../../../../types/componentStyle';

import ipc from '../../../../util/ipc';

const selectorIcon = Leaflet.icon({
  iconUrl: (imageConfig.markers as RecursiveImageSignature).draggable_selector as string,
  iconSize: [7, 7],
});

export interface BoundingBoxProps {
  name: string;
  startingBounds: BoundingBoxBounds;
  locked: boolean;
  color?: string;
}

interface State {
  /**
   * Current bounds of the bounding box.
   */
  bounds: BoundingBoxBounds;
}

export default class BoundingBox extends PureComponent<BoundingBoxProps, State> {
  public constructor(props: BoundingBoxProps) {
    super(props);

    this.ref1 = React.createRef();
    this.ref2 = React.createRef();
    this.ref3 = React.createRef();
    this.ref4 = React.createRef();
    this.ref = React.createRef();

    this.ondrag = this.ondrag.bind(this);
    this.ondrag1 = this.ondrag1.bind(this);
    this.ondrag2 = this.ondrag2.bind(this);
    this.ondrag3 = this.ondrag3.bind(this);
    this.ondrag4 = this.ondrag4.bind(this);
  }

  private ondrag(): void {
    const { name } = this.props;

    const marker1 = this.ref1.current;
    const marker2 = this.ref2.current;
    const marker3 = this.ref3.current;
    const marker4 = this.ref4.current;
    const rectangle = this.ref.current;

    if (!marker1 || !marker2 || !marker3 || !marker4 || !rectangle) return;

    const location1 = marker1.leafletElement.getLatLng();
    const location2 = marker2.leafletElement.getLatLng();
    const location3 = marker3.leafletElement.getLatLng();
    const location4 = marker4.leafletElement.getLatLng();

    const bounds = {
      top: Math.max(location1.lat, location2.lat, location3.lat, location4.lat),
      bottom: Math.min(location1.lat, location2.lat, location3.lat, location4.lat),
      left: Math.min(location1.lng, location2.lng, location3.lng, location4.lng),
      right: Math.max(location1.lng, location2.lng, location3.lng, location4.lng),
    };

    rectangle.leafletElement.setBounds([
      [bounds.bottom, bounds.left],
      [bounds.top, bounds.right],
    ]);

    ipc.postUpdateBoundingBoxes(false, { name, bounds });
  }

  /**
   * Triggers when marker 1 moves.
   * Marker 3 will change vertically.
   * Marker 2 will change horizontally.
   */
  private ondrag1(event: Leaflet.LeafletMouseEvent): void {
    const marker3 = this.ref3.current;
    const marker2 = this.ref2.current;

    if (!marker3 || !marker2) return;

    marker3.leafletElement.setLatLng({
      lat: event.latlng.lat,
      lng: marker3.leafletElement.getLatLng().lng,
    });

    marker2.leafletElement.setLatLng({
      lat: marker2.leafletElement.getLatLng().lat,
      lng: event.latlng.lng,
    });

    this.ondrag();
  }

  /**
   * Triggers when marker 2 moves.
   * Marker 4 will change vertically.
   * Marker 1 will change horizontally.
   */
  private ondrag2(event: Leaflet.LeafletMouseEvent): void {
    const marker4 = this.ref4.current;
    const marker1 = this.ref1.current;

    if (!marker4 || !marker1) return;

    marker4.leafletElement.setLatLng({
      lat: event.latlng.lat,
      lng: marker4.leafletElement.getLatLng().lng,
    });

    marker1.leafletElement.setLatLng({
      lat: marker1.leafletElement.getLatLng().lat,
      lng: event.latlng.lng,
    });

    this.ondrag();
  }

  /**
   * Triggers when marker 3 moves.
   * Marker 1 will change vertically.
   * Marker 4 will change horizontally.
   */
  private ondrag3(event: Leaflet.LeafletMouseEvent): void {
    const marker1 = this.ref1.current;
    const marker4 = this.ref4.current;

    if (!marker1 || !marker4) return;

    marker1.leafletElement.setLatLng({
      lat: event.latlng.lat,
      lng: marker1.leafletElement.getLatLng().lng,
    });

    marker4.leafletElement.setLatLng({
      lat: marker4.leafletElement.getLatLng().lat,
      lng: event.latlng.lng,
    });


    this.ondrag();
  }

  /**
   * Triggers when marker 4 moves.
   * Marker 2 will change vertically.
   * Marker 3 will change horizontally.
   */
  private ondrag4(event: Leaflet.LeafletMouseEvent): void {
    const marker2 = this.ref2.current;
    const marker3 = this.ref3.current;

    if (!marker2 || !marker3) return;

    marker2.leafletElement.setLatLng({
      lat: event.latlng.lat,
      lng: marker2.leafletElement.getLatLng().lng,
    });

    marker3.leafletElement.setLatLng({
      lat: marker3.leafletElement.getLatLng().lat,
      lng: event.latlng.lng,
    });


    this.ondrag();
  }

  /**
   * Reference to marker 1 (to access its leaflet element).
   */
  private ref1: React.RefObject<Marker>;

  /**
   * Reference to marker 2 (to access its leaflet element).
   */
  private ref2: React.RefObject<Marker>;

  /**
   * Reference to marker 3 (to access its leaflet element).
   */
  private ref3: React.RefObject<Marker>;

  /**
   * Reference to marker 4 (to access its leaflet element).
   */
  private ref4: React.RefObject<Marker>;

  /**
   * Reference to rectangle (to access its leaflet element).
   */
  private ref: React.RefObject<Rectangle>;

  public render(): ReactNode {
    const { locked, color, startingBounds } = this.props;

    return (
      <>
        <Rectangle
          color={color}
          weight={2}
          opacity={0.4}
          ref={this.ref}
          bounds={[
            [startingBounds.bottom, startingBounds.left],
            [startingBounds.top, startingBounds.right],
          ]}
        />
        <Marker
          draggable={!locked}
          ondrag={this.ondrag1}
          ref={this.ref1}
          position={[startingBounds.top, startingBounds.left]}
          icon={selectorIcon}
        />
        <Marker
          draggable={!locked}
          ondrag={this.ondrag2}
          ref={this.ref2}
          position={[startingBounds.bottom, startingBounds.left]}
          icon={selectorIcon}
        />
        <Marker
          draggable={!locked}
          ondrag={this.ondrag3}
          ref={this.ref3}
          position={[startingBounds.top, startingBounds.right]}
          icon={selectorIcon}
        />
        <Marker
          draggable={!locked}
          ondrag={this.ondrag4}
          ref={this.ref4}
          position={[startingBounds.bottom, startingBounds.right]}
          icon={selectorIcon}
        />
      </>
    );
  }
}
