import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import { missionName } from '../../../common/missions/ISRSearch';

import { Location } from '../../../static/index';

import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';
import { readyToStart } from '../../../util/parameter';

import CreateWaypointButton from '../extra/CreateWaypointButton';

type ISRChecklistType = 'takeoffLat' | 'takeoffLng' | 'takeoffAlt'
| 'loiterLat' | 'loiterLng' | 'loiterAlt' | 'loiterRadius' | 'loiterDirection'
| 'isrSearchAlt'
| 'isrSearchLat1' | 'isrSearchLng1'
| 'isrSearchLat2' | 'isrSearchLng2'
| 'isrSearchLat3' | 'isrSearchLng3'
| 'landLat1' | 'landLng1' | 'landAlt1'
| 'landLat2' | 'landLng2' | 'landAlt2';

const checklistCache: { [check in ISRChecklistType]: number | undefined } = {
  takeoffLat: undefined,
  takeoffLng: undefined,
  takeoffAlt: undefined,
  loiterLat: undefined,
  loiterLng: undefined,
  loiterAlt: undefined,
  loiterRadius: undefined,
  loiterDirection: undefined,
  isrSearchAlt: undefined,
  isrSearchLat1: undefined,
  isrSearchLng1: undefined,
  isrSearchLat2: undefined,
  isrSearchLng2: undefined,
  isrSearchLat3: undefined,
  isrSearchLng3: undefined,
  landLat1: undefined,
  landLng1: undefined,
  landAlt1: undefined,
  landLat2: undefined,
  landLng2: undefined,
  landAlt2: undefined,
};

type ISRWaypointType = 'takeoff' | 'loiter' | 'isrSearch1' | 'isrSearch2' | 'isrSearch3' | 'land1' | 'land2';

type Locked = { [waypointType in ISRWaypointType]: boolean } & {
  takeoff: boolean;
  loiter: boolean;
  isrSearch1: boolean;
  isrSearch2: boolean;
  isrSearch3: boolean;
  land1: boolean;
  land2: boolean;
}

const lockedCache: Locked = {
  takeoff: true,
  loiter: true,
  isrSearch1: true,
  isrSearch2: true,
  isrSearch3: true,
  land1: true,
  land2: true,
};

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearchProps {
  vehicles: { [vehicleId: number]: VehicleObject };
}

interface State {
  /**
   * Checklist of all required waypoints/coordinates. This is used to generate the
   * parameters for the mission.
   */
  checklist: { [check in ISRChecklistType]: number | undefined };

  /**
   * True once all checks in checklist are filled in properly.
   */
  ready: boolean;

  /**
   * True if the inputs for the waypoint type is disabled. Will become disabled
   * once the create pin is clicked.
   */
  locked: Locked;
}

export class ISRSearch extends Component<ISRSearchProps, State> {
  public constructor(props: ISRSearchProps) {
    super(props);

    this.state = {
      checklist: checklistCache,
      ready: false,
      locked: lockedCache,
    };

    this.onChange = this.onChange.bind(this);
    this.updateWaypoints = this.updateWaypoints.bind(this);
    this.updateChecklist = this.updateChecklist.bind(this);
    this.unlockParameterInputs = this.unlockParameterInputs.bind(this);
    this.readyToStart = this.readyToStart.bind(this);
  }

  public componentDidMount(): void {
    ipcRenderer.on('updateWaypoints', (__: Event, _: boolean, ...waypoints: { name: string; location: Location }[]): void => this.updateWaypoints(...waypoints));
    ipcRenderer.on('unlockParameterInputs', (_: Event, waypointType: string): void => this.unlockParameterInputs(waypointType));
  }

  private onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { checklist } = this.state;

    if (!(event.target.name in checklist)) return;

    const name = event.target.name as ISRChecklistType;
    const value = parseInt(event.target.value, 10) || 0;

    switch (name) {
      case 'takeoffLat':
        ipc.postUpdateWaypoints(true, { name: 'Takeoff', location: { lat: value, lng: checklist.takeoffLng as number } });
        break;

      case 'takeoffLng':
        ipc.postUpdateWaypoints(true, { name: 'Takeoff', location: { lat: checklist.takeoffLat as number, lng: value } });
        break;

      case 'loiterLat':
        ipc.postUpdateWaypoints(true, { name: 'Loiter', location: { lat: value, lng: checklist.loiterLng as number } });
        break;

      case 'loiterLng':
        ipc.postUpdateWaypoints(true, { name: 'Loiter', location: { lat: checklist.loiterLat as number, lng: value } });
        break;

      case 'isrSearchLat1':
        ipc.postUpdateWaypoints(true, { name: 'ISR Search 1', location: { lat: value, lng: checklist.isrSearchLng1 as number } });
        break;

      case 'isrSearchLng1':
        ipc.postUpdateWaypoints(true, { name: 'ISR Search 1', location: { lat: checklist.isrSearchLat1 as number, lng: value } });
        break;

      case 'isrSearchLat2':
        ipc.postUpdateWaypoints(true, { name: 'ISR Search 2', location: { lat: value, lng: checklist.isrSearchLng2 as number } });
        break;

      case 'isrSearchLng2':
        ipc.postUpdateWaypoints(true, { name: 'ISR Search 2', location: { lat: checklist.isrSearchLat2 as number, lng: value } });
        break;

      case 'isrSearchLat3':
        ipc.postUpdateWaypoints(true, { name: 'ISR Search 3', location: { lat: value, lng: checklist.isrSearchLng3 as number } });
        break;

      case 'isrSearchLng3':
        ipc.postUpdateWaypoints(true, { name: 'ISR Search 3', location: { lat: checklist.isrSearchLat3 as number, lng: value } });
        break;

      case 'landLat1':
        ipc.postUpdateWaypoints(true, { name: 'Land 1', location: { lat: value, lng: checklist.landLng1 as number } });
        break;

      case 'landLng1':
        ipc.postUpdateWaypoints(true, { name: 'Land 1', location: { lat: checklist.landLat1 as number, lng: value } });
        break;

      case 'landLat2':
        ipc.postUpdateWaypoints(true, { name: 'Land 2', location: { lat: value, lng: checklist.landLng2 as number } });
        break;

      case 'landLng2':
        ipc.postUpdateWaypoints(true, { name: 'Land 2', location: { lat: checklist.landLat2 as number, lng: value } });
        break;

      default:
        this.updateChecklist({ [name]: value });
        break;
    }
  }

  private updateWaypoints(...waypoints: { name: string; location: Location }[]): void {
    const checks: { [checkName in ISRChecklistType]?: number } = {};

    waypoints.forEach((waypoint): void => {
      switch (waypoint.name) {
        case 'Takeoff':
          checks.takeoffLat = waypoint.location.lat;
          checks.takeoffLng = waypoint.location.lng;
          break;

        case 'Loiter':
          checks.loiterLat = waypoint.location.lat;
          checks.loiterLng = waypoint.location.lng;
          break;

        case 'ISR Search 1':
          checks.isrSearchLat1 = waypoint.location.lat;
          checks.isrSearchLng1 = waypoint.location.lng;
          break;

        case 'ISR Search 2':
          checks.isrSearchLat2 = waypoint.location.lat;
          checks.isrSearchLng2 = waypoint.location.lng;
          break;

        case 'ISR Search 3':
          checks.isrSearchLat3 = waypoint.location.lat;
          checks.isrSearchLng3 = waypoint.location.lng;
          break;

        case 'Land 1':
          checks.landLat1 = waypoint.location.lat;
          checks.landLng1 = waypoint.location.lng;
          break;

        case 'Land 2':
          checks.landLat2 = waypoint.location.lat;
          checks.landLng2 = waypoint.location.lng;
          break;

        default: break;
      }
    });

    this.updateChecklist(checks);
  }

  private updateChecklist(checks: { [checklistType in ISRChecklistType]?: number }): void {
    const { checklist: newChecklist, ready } = this.state;

    Object.keys(checks).forEach((checklistTypeString): void => {
      const checklistType = checklistTypeString as ISRChecklistType;
      const value = checks[checklistType];

      newChecklist[checklistType] = value;
    });

    if (ready || readyToStart(this)) {
      ipc.postUpdateInformation({
        missionName: 'isrSearch',
        parameters: {
          takeoff: {
            lat: newChecklist.takeoffLat as number,
            lng: newChecklist.takeoffLng as number,
            alt: newChecklist.takeoffAlt as number,
            loiter: {
              lat: newChecklist.loiterLat as number,
              lng: newChecklist.loiterLng as number,
              alt: newChecklist.loiterAlt as number,
              radius: newChecklist.loiterRadius as number,
              direction: newChecklist.loiterDirection as number,
            },
          },
          isrSearch: {
            alt: newChecklist.isrSearchAlt as number,
            waypoints: [
              {
                lat: newChecklist.isrSearchLat1 as number,
                lng: newChecklist.isrSearchLng1 as number,
              },
              {
                lat: newChecklist.isrSearchLat2 as number,
                lng: newChecklist.isrSearchLng2 as number,
              },
              {
                lat: newChecklist.isrSearchLat3 as number,
                lng: newChecklist.isrSearchLng3 as number,
              },
            ],
          },
          land: {
            waypoints: [
              {
                lat: newChecklist.landLat1 as number,
                lng: newChecklist.landLng1 as number,
                alt: newChecklist.landAlt1 as number,
              },
              {
                lat: newChecklist.landLat2 as number,
                lng: newChecklist.landLng2 as number,
                alt: newChecklist.landAlt2 as number,
              },
            ],
          },
        },
      });
    }

    this.setState({ checklist: newChecklist });
  }

  private unlockParameterInputs(waypointType: string): void {
    const { locked: newLocked } = this.state;

    if (waypointType in newLocked) {
      newLocked[waypointType as ISRWaypointType] = false;
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
        <p>Takeoff Coordinates</p>
        <input type="number" name="takeoffLat" value={checklist.takeoffLat || ''} disabled={locked.takeoff} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="takeoffLng" value={checklist.takeoffLng || ''} disabled={locked.takeoff} onChange={this.onChange} placeholder="Longitude" />
        <input type="number" name="takeoffAlt" value={checklist.takeoffAlt || ''} disabled={locked.takeoff} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton name="takeoff" value="Takeoff" />

        <p>Loiter Coordinates</p>
        <input type="number" name="loiterLat" value={checklist.loiterLat || ''} disabled={locked.loiter} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="loiterLng" value={checklist.loiterLng || ''} disabled={locked.loiter} onChange={this.onChange} placeholder="Longitude" />
        <input type="number" name="loiterAlt" value={checklist.loiterAlt || ''} disabled={locked.loiter} onChange={this.onChange} placeholder="Altitude" />
        <input type="number" name="loiterRadius" value={checklist.loiterRadius || ''} disabled={locked.loiter} onChange={this.onChange} placeholder="Radius" />
        <input type="number" name="loiterDirection" value={checklist.loiterDirection || ''} disabled={locked.loiter} onChange={this.onChange} placeholder="Direction" />
        <CreateWaypointButton name="loiter" value="Loiter" />

        <p>ISR Search Waypoints</p>
        <input type="number" name="isrSearchAlt" value={checklist.isrSearchAlt || ''} disabled={locked.isrSearch1 && locked.isrSearch2 && locked.isrSearch3} onChange={this.onChange} placeholder="Altitude" />
        <br />
        <input type="number" name="isrSearchLat1" value={checklist.isrSearchLat1 || ''} disabled={locked.isrSearch1} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="isrSearchLng1" value={checklist.isrSearchLng1 || ''} disabled={locked.isrSearch1} onChange={this.onChange} placeholder="Longitude" />
        <CreateWaypointButton name="isrSearch1" value="ISR Search 1" />
        <br />
        <input type="number" name="isrSearchLat2" value={checklist.isrSearchLat2 || ''} disabled={locked.isrSearch2} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="isrSearchLng2" value={checklist.isrSearchLng2 || ''} disabled={locked.isrSearch2} onChange={this.onChange} placeholder="Longitude" />
        <CreateWaypointButton name="isrSearch2" value="ISR Search 2" />
        <br />
        <input type="number" name="isrSearchLat3" value={checklist.isrSearchLat3 || ''} disabled={locked.isrSearch3} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="isrSearchLng3" value={checklist.isrSearchLng3 || ''} disabled={locked.isrSearch3} onChange={this.onChange} placeholder="Longitude" />
        <CreateWaypointButton name="isrSearch3" value="ISR Search 3" />

        <p>Land Waypoints</p>
        <input type="number" name="landLat1" value={checklist.landLat1 || ''} disabled={locked.land1} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="landLng1" value={checklist.landLng1 || ''} disabled={locked.land1} onChange={this.onChange} placeholder="Longitude" />
        <input type="number" name="landAlt1" value={checklist.landAlt1 || ''} disabled={locked.land1} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton name="land1" value="Land 1" />
        <br />
        <br />
        <input type="number" name="landLat2" value={checklist.landLat2 || ''} disabled={locked.land2} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="landLng2" value={checklist.landLng2 || ''} disabled={locked.land2} onChange={this.onChange} placeholder="Longitude" />
        <input type="number" name="landAlt2" value={checklist.landAlt2 || ''} disabled={locked.land2} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton name="land2" value="Land 2" />
        <br />
      </div>
    );
  }
}

export default {
  missionName,
  layout: ISRSearch as React.ElementType,
};
