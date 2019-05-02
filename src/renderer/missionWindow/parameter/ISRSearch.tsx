import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import './parameters.css';

import { missionName } from '../../../common/missions/ISRSearch';

import { Location } from '../../../static/index';

import ipc from '../../../util/ipc';
import { readyToStart } from '../../../util/parameter';

import CreateWaypointButton from '../extra/CreateWaypointButton';

type ISRChecklistType = 'isrTakeoffLat' | 'isrTakeoffLng' | 'isrTakeoffAlt'
| 'isrLoiterLat' | 'isrLoiterLng' | 'isrLoiterAlt' | 'isrLoiterRadius' | 'isrLoiterDirection'
| 'isrSearchAlt'
| 'isrSearchLat1' | 'isrSearchLng1'
| 'isrSearchLat2' | 'isrSearchLng2'
| 'isrSearchLat3' | 'isrSearchLng3'
| 'isrLandLat1' | 'isrLandLng1' | 'isrLandAlt1'
| 'isrLandLat2' | 'isrLandLng2' | 'isrLandAlt2';

const checklistCache: { [check in ISRChecklistType]: number | undefined } = {
  isrTakeoffLat: undefined,
  isrTakeoffLng: undefined,
  isrTakeoffAlt: undefined,
  isrLoiterLat: undefined,
  isrLoiterLng: undefined,
  isrLoiterAlt: undefined,
  isrLoiterRadius: undefined,
  isrLoiterDirection: undefined,
  isrSearchAlt: undefined,
  isrSearchLat1: undefined,
  isrSearchLng1: undefined,
  isrSearchLat2: undefined,
  isrSearchLng2: undefined,
  isrSearchLat3: undefined,
  isrSearchLng3: undefined,
  isrLandLat1: undefined,
  isrLandLng1: undefined,
  isrLandAlt1: undefined,
  isrLandLat2: undefined,
  isrLandLng2: undefined,
  isrLandAlt2: undefined,
};

type ISRWaypointType = 'isrTakeoff' | 'isrLoiter' | 'isrSearch1' | 'isrSearch2' | 'isrSearch3' | 'isrLand1' | 'isrLand2';

type Locked = { [waypointType in ISRWaypointType]: boolean } & {
  isrTakeoff: boolean;
  isrLoiter: boolean;
  isrSearch1: boolean;
  isrSearch2: boolean;
  isrSearch3: boolean;
  isrLand1: boolean;
  isrLand2: boolean;
}

const lockedCache: Locked = {
  isrTakeoff: true,
  isrLoiter: true,
  isrSearch1: true,
  isrSearch2: true,
  isrSearch3: true,
  isrLand1: true,
  isrLand2: true,
};

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

export class ISRSearch extends Component<{}, State> {
  public constructor(props: {}) {
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
      case 'isrTakeoffLat':
        ipc.postUpdateWaypoints(true, { name: 'Takeoff', location: { lat: value, lng: checklist.isrTakeoffLng as number } });
        break;

      case 'isrTakeoffLng':
        ipc.postUpdateWaypoints(true, { name: 'Takeoff', location: { lat: checklist.isrTakeoffLat as number, lng: value } });
        break;

      case 'isrLoiterLat':
        ipc.postUpdateWaypoints(true, { name: 'Loiter', location: { lat: value, lng: checklist.isrLoiterLng as number } });
        break;

      case 'isrLoiterLng':
        ipc.postUpdateWaypoints(true, { name: 'Loiter', location: { lat: checklist.isrLoiterLat as number, lng: value } });
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

      case 'isrLandLat1':
        ipc.postUpdateWaypoints(true, { name: 'Land 1', location: { lat: value, lng: checklist.isrLandLng1 as number } });
        break;

      case 'isrLandLng1':
        ipc.postUpdateWaypoints(true, { name: 'Land 1', location: { lat: checklist.isrLandLat1 as number, lng: value } });
        break;

      case 'isrLandLat2':
        ipc.postUpdateWaypoints(true, { name: 'Land 2', location: { lat: value, lng: checklist.isrLandLng2 as number } });
        break;

      case 'isrLandLng2':
        ipc.postUpdateWaypoints(true, { name: 'Land 2', location: { lat: checklist.isrLandLat2 as number, lng: value } });
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
          checks.isrTakeoffLat = waypoint.location.lat;
          checks.isrTakeoffLng = waypoint.location.lng;
          break;

        case 'Loiter':
          checks.isrLoiterLat = waypoint.location.lat;
          checks.isrLoiterLng = waypoint.location.lng;
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
          checks.isrLandLat1 = waypoint.location.lat;
          checks.isrLandLng1 = waypoint.location.lng;
          break;

        case 'Land 2':
          checks.isrLandLat2 = waypoint.location.lat;
          checks.isrLandLng2 = waypoint.location.lng;
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
            lat: newChecklist.isrTakeoffLat as number,
            lng: newChecklist.isrTakeoffLng as number,
            alt: newChecklist.isrTakeoffAlt as number,
            loiter: {
              lat: newChecklist.isrLoiterLat as number,
              lng: newChecklist.isrLoiterLng as number,
              alt: newChecklist.isrLoiterAlt as number,
              radius: newChecklist.isrLoiterRadius as number,
              direction: newChecklist.isrLoiterDirection as number,
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
                lat: newChecklist.isrLandLat1 as number,
                lng: newChecklist.isrLandLng1 as number,
                alt: newChecklist.isrLandAlt1 as number,
              },
              {
                lat: newChecklist.isrLandLat2 as number,
                lng: newChecklist.isrLandLng2 as number,
                alt: newChecklist.isrLandAlt2 as number,
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
        <input className="inputFields" type="number" name="isrTakeoffLat" value={checklist.isrTakeoffLat || ''} disabled={locked.isrTakeoff} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="isrTakeoffLng" value={checklist.isrTakeoffLng || ''} disabled={locked.isrTakeoff} onChange={this.onChange} placeholder="Longitude" />
        <input className="inputFields" type="number" name="isrTakeoffAlt" value={checklist.isrTakeoffAlt || ''} disabled={locked.isrTakeoff} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton name="isrTakeoff" value="Takeoff" />

        <p>Loiter Coordinates</p>
        <input className="inputFields" type="number" name="isrLoiterLat" value={checklist.isrLoiterLat || ''} disabled={locked.isrLoiter} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="isrLoiterLng" value={checklist.isrLoiterLng || ''} disabled={locked.isrLoiter} onChange={this.onChange} placeholder="Longitude" />
        <input className="inputFields" type="number" name="isrLoiterAlt" value={checklist.isrLoiterAlt || ''} disabled={locked.isrLoiter} onChange={this.onChange} placeholder="Altitude" />
        <br />
        <input className="inputFields" type="number" name="isrLoiterRadius" value={checklist.isrLoiterRadius || ''} disabled={locked.isrLoiter} onChange={this.onChange} placeholder="Radius" />
        <input className="inputFields" type="number" name="isrLoiterDirection" value={checklist.isrLoiterDirection || ''} disabled={locked.isrLoiter} onChange={this.onChange} placeholder="Direction" />
        <CreateWaypointButton name="isrLoiter" value="Loiter" />

        <p>ISR Search Waypoints</p>
        <input className="inputFields" type="number" name="isrSearchAlt" value={checklist.isrSearchAlt || ''} disabled={locked.isrSearch1 && locked.isrSearch2 && locked.isrSearch3} onChange={this.onChange} placeholder="Altitude" />
        <br />
        <input className="inputFields" type="number" name="isrSearchLat1" value={checklist.isrSearchLat1 || ''} disabled={locked.isrSearch1} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="isrSearchLng1" value={checklist.isrSearchLng1 || ''} disabled={locked.isrSearch1} onChange={this.onChange} placeholder="Longitude" />
        <CreateWaypointButton name="isrSearch1" value="ISR Search 1" />
        <br />
        <input className="inputFields" type="number" name="isrSearchLat2" value={checklist.isrSearchLat2 || ''} disabled={locked.isrSearch2} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="isrSearchLng2" value={checklist.isrSearchLng2 || ''} disabled={locked.isrSearch2} onChange={this.onChange} placeholder="Longitude" />
        <CreateWaypointButton name="isrSearch2" value="ISR Search 2" />
        <br />
        <input className="inputFields" type="number" name="isrSearchLat3" value={checklist.isrSearchLat3 || ''} disabled={locked.isrSearch3} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="isrSearchLng3" value={checklist.isrSearchLng3 || ''} disabled={locked.isrSearch3} onChange={this.onChange} placeholder="Longitude" />
        <CreateWaypointButton name="isrSearch3" value="ISR Search 3" />

        <p>Land Waypoints</p>
        <input className="inputFields" type="number" name="isrLandLat1" value={checklist.isrLandLat1 || ''} disabled={locked.isrLand1} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="isrLandLng1" value={checklist.isrLandLng1 || ''} disabled={locked.isrLand1} onChange={this.onChange} placeholder="Longitude" />
        <input className="inputFields" type="number" name="isrLandAlt1" value={checklist.isrLandAlt1 || ''} disabled={locked.isrLand1} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton name="isrLand1" value="Land 1" />
        <br />
        <br />
        <input className="inputFields" type="number" name="isrLandLat2" value={checklist.isrLandLat2 || ''} disabled={locked.isrLand2} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="isrLandLng2" value={checklist.isrLandLng2 || ''} disabled={locked.isrLand2} onChange={this.onChange} placeholder="Longitude" />
        <input className="inputFields" type="number" name="isrLandAlt2" value={checklist.isrLandAlt2 || ''} disabled={locked.isrLand2} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton name="isrLand2" value="Land 2" />
        <br />
      </div>
    );
  }
}

export default {
  missionName,
  layout: ISRSearch,
};
