import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import { missionName } from '../../../common/missions/VTOLSearch';

import { Location } from '../../../static/index';

import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';
import { readyToStart } from '../../../util/parameter';

import CreateBoundingBoxButton from '../extra/CreateBoundingBox';

type VTOLSearchChecklistType = 'quickScanTopLeftLat' | 'quickScanTopLeftLng' | 'quickScanTopRightLat'
| 'quickScanTopRightLng' | 'quickScanBottomLeftLat' | 'quickScanBottomLeftLng'
| 'quickScanBottomRightLat' | 'quickScanBottomRightLng';

const checklistCache: { [check in VTOLSearchChecklistType ]: number | undefined} = {
  quickScanTopLeftLat: undefined,
  quickScanTopLeftLng: undefined,
  quickScanTopRightLat: undefined,
  quickScanTopRightLng: undefined,
  quickScanBottomLeftLat: undefined,
  quickScanBottomLeftLng: undefined,
  quickScanBottomRightLat: undefined,
  quickScanBottomRightLng: undefined,
};

type VTOLSearchType = 'quickScan';

type Locked = { [type in VTOLSearchType]: boolean} & {
  quickScan: boolean;
}

const lockedCache: Locked = {
  quickScan: false,
};

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface VTOLSearchProps {
  vehicles: { [vehicleId: number]: VehicleObject };
}

interface State {
  /**
   * Checklist of all required waypoints/coordinates. This is used to generate the
   * parameters for the mission.
   */
  checklist: { [check in VTOLSearchChecklistType]: number | undefined };

  /**
   * True once all checks are filled in properly.
   */
  ready: boolean;

  /**
   * True if the inputs for the waypoint type is disabled. Will become disabled
   * once the create pin is clicked.
   */
  locked: Locked;
}

export class VTOLSearch extends Component<VTOLSearchProps, State> {
  public constructor(props: VTOLSearchProps) {
    super(props);

    this.state = {
      checklist: checklistCache,
      ready: false,
      locked: lockedCache,
    };

    this.onChange = this.onChange.bind(this);
    this.updateWaypoints = this.updateWaypoints.bind(this);
    this.updateChecklist = this.updateChecklist.bind(this);
    this.readyToStart = this.readyToStart.bind(this);
    this.unlockParameterInputs = this.unlockParameterInputs.bind(this);
  }

  public componentDidMount(): void {
    ipcRenderer.on('updateWaypoints', (__: Event, _: boolean, ...waypoints: { name: string; location: Location }[]): void => this.updateWaypoints(...waypoints));
    ipcRenderer.on('unlockParameterInputs', (_: Event, waypointType: string): void => this.unlockParameterInputs(waypointType));
  }

  private onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { checklist } = this.state;
    if (!(event.target.name in checklist)) return;

    const name = event.target.name as VTOLSearchChecklistType;
    const value = parseInt(event.target.value, 10) || 0;
    switch (name) {
      case 'quickScanTopLeftLat':
        ipc.postUpdateWaypoints(true, { name: 'Quick Scan 1', location: { lat: value, lng: checklist.quickScanTopLeftLng as number } });
        break;

      case 'quickScanTopLeftLng':
        ipc.postUpdateWaypoints(true, { name: 'Quick Scan 1', location: { lat: checklist.quickScanTopLeftLat as number, lng: value } });
        break;

      case 'quickScanTopRightLat':
        ipc.postUpdateWaypoints(true, { name: 'Quick Scan 2', location: { lat: value, lng: checklist.quickScanTopRightLng as number } });
        break;

      case 'quickScanTopRightLng':
        ipc.postUpdateWaypoints(true, { name: 'Quick Scan 2', location: { lat: checklist.quickScanTopRightLat as number, lng: value } });
        break;

      case 'quickScanBottomLeftLat':
        ipc.postUpdateWaypoints(true, { name: 'Quick Scan 3', location: { lat: value, lng: checklist.quickScanBottomLeftLng as number } });
        break;

      case 'quickScanBottomLeftLng':
        ipc.postUpdateWaypoints(true, { name: 'Quick Scan 3', location: { lat: checklist.quickScanBottomLeftLat as number, lng: value } });
        break;

      case 'quickScanBottomRightLat':
        ipc.postUpdateWaypoints(true, { name: 'Quick Scan 4', location: { lat: value, lng: checklist.quickScanBottomRightLng as number } });
        break;

      case 'quickScanBottomRightLng':
        ipc.postUpdateWaypoints(true, { name: 'Quick Scan 4', location: { lat: checklist.quickScanBottomRightLat as number, lng: value } });
        break;

      default:
        this.updateChecklist({ [name]: value });
        break;
    }
  }

  private updateWaypoints(...boundingBoxes: { name: string; location: Location }[]): void {
    const checks: { [checkName in VTOLSearchChecklistType]?: number} = {};

    boundingBoxes.forEach((waypoint): void => {
      switch (waypoint.name) {
        case 'Quick Scan Top Left':
          checks.quickScanTopLeftLat = waypoint.location.lat;
          checks.quickScanTopLeftLng = waypoint.location.lng;
          break;

        case 'Quick Scan Top Right':
          checks.quickScanTopRightLat = waypoint.location.lat;
          checks.quickScanTopRightLng = waypoint.location.lng;
          break;

        case 'Quick Scan Bottom Left':
          checks.quickScanBottomLeftLat = waypoint.location.lat;
          checks.quickScanBottomLeftLng = waypoint.location.lng;
          break;

        case 'Quick Scan Bottom Right':
          checks.quickScanBottomRightLat = waypoint.location.lat;
          checks.quickScanBottomRightLng = waypoint.location.lng;
          break;

        default: break;
      }
    });

    this.updateChecklist(checks);
  }

  private updateChecklist(checks: { [checklistType in VTOLSearchChecklistType]?: number }): void {
    const { checklist: newChecklist, ready } = this.state;

    Object.keys(checks).forEach((checklistTypeString): void => {
      const checklistType = checklistTypeString as VTOLSearchChecklistType;
      const value = checks[checklistType];

      newChecklist[checklistType] = value;

      if (ready || readyToStart(this)) {
        ipc.postUpdateInformation({
          missionName: 'vtolSearch',
          parameters: {
            quickScan: {
              waypoints: [
                {
                  lat: newChecklist.quickScanTopLeftLat as number,
                  lng: newChecklist.quickScanTopLeftLng as number,
                },
                {
                  lat: newChecklist.quickScanTopRightLat as number,
                  lng: newChecklist.quickScanTopRightLng as number,
                },
                {
                  lat: newChecklist.quickScanBottomLeftLat as number,
                  lng: newChecklist.quickScanBottomLeftLng as number,
                },
                {
                  lat: newChecklist.quickScanBottomRightLat as number,
                  lng: newChecklist.quickScanBottomRightLng as number,
                },
              ],
            },
          },
        });
      }
    });

    this.setState({ checklist: newChecklist });
  }

  private unlockParameterInputs(waypointType: string): void {
    const { locked: newLocked } = this.state;

    if (waypointType in newLocked) {
      newLocked[waypointType as VTOLSearchType] = false;
    }

    this.setState({ locked: newLocked });
  }

  private readyToStart(): boolean {
    const { checklist } = this.state;
    const ready = Object.values(checklist).every((value): boolean => value !== undefined);

    if (ready) this.setState({ ready });
    return ready;
  }

  public render(): ReactNode {
    const { checklist, locked } = this.state;
    return (
      <div>
        <p>Quick Scan</p>
        <input type="number" name="quickScanLat1" value={checklist.quickScanTopLeftLat || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="quickScanLng1" value={checklist.quickScanTopLeftLng || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Longitude" />
        <br />
        <input type="number" name="quickScanLat2" value={checklist.quickScanTopRightLat || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="quickScanLng2" value={checklist.quickScanTopRightLng || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Longitude" />
        <br />
        <input type="number" name="quickScanLat3" value={checklist.quickScanBottomLeftLat || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="quickScanLng3" value={checklist.quickScanBottomLeftLng || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Longitude" />
        <br />
        <input type="number" name="quickScanLat4" value={checklist.quickScanBottomRightLat || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="quickScanLng4" value={checklist.quickScanBottomRightLng || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Longitude" />
        <br />
        <CreateBoundingBoxButton name="boundingBox" value="Bounding Box" />
      </div>
    );
  }
}

export default {
  missionName,
  layout: VTOLSearch as React.ElementType,
};
