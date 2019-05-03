import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import './parameters.css';

import { ThemeProps } from '../../../types/componentStyle';

import { missionName } from '../../../common/missions/PayloadDrop';

import { Location } from '../../../static/index';

import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';
import { readyToStart } from '../../../util/parameter';

import CreateWaypointButton from '../extra/CreateWaypointButton';

type PayloadDropChecklistType = 'payloadDropTakoffLat' | 'payloadDropTakoffLng' | 'payloadDropTakoffAlt'
| 'payloadDropLoiterLat' | 'payloadDropLoiterLng' | 'payloadDropLoiterAlt' | 'payloadDropLoiterRadius' | 'payloadDropLoiterDirection'
| 'payloadDropLat1' | 'payloadDropLng1' | 'payloadDropAlt1'
| 'payloadDropLat2' | 'payloadDropLng2' | 'payloadDropAlt2'
| 'payloadDropLandLat1' | 'payloadDropLandLng1' | 'payloadDropLandAlt1'
| 'payloadDropLandLat2' | 'payloadDropLandLng2' | 'payloadDropLandAlt2';

const checklistCache: { [check in PayloadDropChecklistType ]: number | undefined } = {
  payloadDropTakoffLat: undefined,
  payloadDropTakoffLng: undefined,
  payloadDropTakoffAlt: undefined,
  payloadDropLoiterLat: undefined,
  payloadDropLoiterLng: undefined,
  payloadDropLoiterAlt: undefined,
  payloadDropLoiterRadius: undefined,
  payloadDropLoiterDirection: undefined,
  payloadDropAlt1: undefined,
  payloadDropLat1: undefined,
  payloadDropLng1: undefined,
  payloadDropAlt2: undefined,
  payloadDropLat2: undefined,
  payloadDropLng2: undefined,
  payloadDropLandLat1: undefined,
  payloadDropLandLng1: undefined,
  payloadDropLandAlt1: undefined,
  payloadDropLandLat2: undefined,
  payloadDropLandLng2: undefined,
  payloadDropLandAlt2: undefined,
};

type PayloadType = 'payloadDropTakoff' | 'payloadDropLoiter' | 'payloadDrop1'| 'payloadDrop2' | 'payloadDropLand1' | 'payloadDropLand2';

type Locked = { [type in PayloadType]: boolean} & {
  payloadDropTakoff: boolean;
  payloadDropLoiter: boolean;
  payloadDrop1: boolean;
  payloadDrop2: boolean;
  payloadDropLand1: boolean;
  payloadDropLand2: boolean;
}

const lockedCache: Locked = {
  payloadDropTakoff: true,
  payloadDropLoiter: true,
  payloadDrop1: true,
  payloadDrop2: true,
  payloadDropLand1: true,
  payloadDropLand2: true,
};

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface PayloadDropProps extends ThemeProps {
  vehicles: { [vehicleId: number]: VehicleObject };
}

interface State {
  /**
   * Checklist of all required waypoints/coordinates. This is used to generate the
   * parameters for the mission.
   */
  checklist: { [check in PayloadDropChecklistType]: number | undefined };

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

export class PayloadDrop extends Component<PayloadDropProps, State> {
  public constructor(props: PayloadDropProps) {
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

    const name = event.target.name as PayloadDropChecklistType;
    const value = parseInt(event.target.value, 10) || 0;
    switch (name) {
      case 'payloadDropTakoffLat':
        ipc.postUpdateWaypoints(true, { name: 'Takeoff', location: { lat: value, lng: checklist.payloadDropTakoffLng as number } });
        break;
      case 'payloadDropTakoffLng':
        ipc.postUpdateWaypoints(true, { name: 'Takeoff', location: { lat: checklist.payloadDropTakoffLat as number, lng: value } });
        break;

      case 'payloadDropLat1':
        ipc.postUpdateWaypoints(true, { name: 'Payload Drop 1', location: { lat: value, lng: checklist.payloadDropLng1 as number } });
        break;

      case 'payloadDropLng1':
        ipc.postUpdateWaypoints(true, { name: 'Payload Drop 1', location: { lat: checklist.payloadDropLat1 as number, lng: value } });
        break;

      case 'payloadDropLat2':
        ipc.postUpdateWaypoints(true, { name: 'Payload Drop 2', location: { lat: value, lng: checklist.payloadDropLng2 as number } });
        break;

      case 'payloadDropLng2':
        ipc.postUpdateWaypoints(true, { name: 'Payload Drop 2', location: { lat: checklist.payloadDropLat2 as number, lng: value } });
        break;

      case 'payloadDropLandLat1':
        ipc.postUpdateWaypoints(true, { name: 'Land 1', location: { lat: value, lng: checklist.payloadDropLandLng1 as number } });
        break;

      case 'payloadDropLandLng1':
        ipc.postUpdateWaypoints(true, { name: 'Land 1', location: { lat: checklist.payloadDropLandLat1 as number, lng: value } });
        break;

      case 'payloadDropLandLat2':
        ipc.postUpdateWaypoints(true, { name: 'Land 2', location: { lat: value, lng: checklist.payloadDropLandLng2 as number } });
        break;

      case 'payloadDropLandLng2':
        ipc.postUpdateWaypoints(true, { name: 'Land 2', location: { lat: checklist.payloadDropLandLat2 as number, lng: value } });
        break;

      default:
        this.updateChecklist({ [name]: value });
        break;
    }
  }

  private updateWaypoints(...waypoints: { name: string; location: Location }[]): void {
    const checks: { [checkName in PayloadDropChecklistType]?: number} = {};

    waypoints.forEach((waypoint): void => {
      switch (waypoint.name) {
        case 'Takeoff':
          checks.payloadDropTakoffLat = waypoint.location.lat;
          checks.payloadDropTakoffLng = waypoint.location.lng;
          break;

        case 'Loiter':
          checks.payloadDropLoiterLat = waypoint.location.lat;
          checks.payloadDropLoiterLng = waypoint.location.lng;
          break;

        case 'Payload Drop 1':
          checks.payloadDropLat1 = waypoint.location.lat;
          checks.payloadDropLng1 = waypoint.location.lng;
          break;

        case 'Payload Drop 2':
          checks.payloadDropLat2 = waypoint.location.lat;
          checks.payloadDropLng2 = waypoint.location.lng;
          break;

        case 'Land 1':
          checks.payloadDropLandLat1 = waypoint.location.lat;
          checks.payloadDropLandLng1 = waypoint.location.lng;
          break;

        case 'Land 2':
          checks.payloadDropLandLat2 = waypoint.location.lat;
          checks.payloadDropLandLng2 = waypoint.location.lng;
          break;

        default: break;
      }
    });

    this.updateChecklist(checks);
  }

  private updateChecklist(checks: { [checklistType in PayloadDropChecklistType]?: number }): void {
    const { checklist: newChecklist, ready } = this.state;

    Object.keys(checks).forEach((checklistTypeString): void => {
      const checklistType = checklistTypeString as PayloadDropChecklistType;
      const value = checks[checklistType];

      newChecklist[checklistType] = value;
    });

    if (ready || readyToStart(this)) {
      ipc.postUpdateInformation({
        missionName: 'payloadDrop',
        parameters: {
          takeoff: {
            lat: newChecklist.payloadDropTakoffLat as number,
            lng: newChecklist.payloadDropTakoffLng as number,
            alt: newChecklist.payloadDropTakoffAlt as number,
            loiter: {
              lat: newChecklist.payloadDropLoiterLat as number,
              lng: newChecklist.payloadDropLoiterLng as number,
              alt: newChecklist.payloadDropLoiterAlt as number,
              radius: newChecklist.payloadDropLoiterRadius as number,
              direction: newChecklist.payloadDropLoiterDirection as number,
            },
          },
          payloadDrop: {
            waypoints: [
              {
                lat: newChecklist.payloadDropLat1 as number,
                lng: newChecklist.payloadDropLng1 as number,
                alt: newChecklist.payloadDropAlt1 as number,
              },
              {
                lat: newChecklist.payloadDropLat2 as number,
                lng: newChecklist.payloadDropLng2 as number,
                alt: newChecklist.payloadDropAlt2 as number,
              },
            ],
          },
          land: {
            waypoints: [
              {
                lat: newChecklist.payloadDropLandLat1 as number,
                lng: newChecklist.payloadDropLandLng1 as number,
                alt: newChecklist.payloadDropLandAlt1 as number,
              },
              {
                lat: newChecklist.payloadDropLandLat2 as number,
                lng: newChecklist.payloadDropLandLng2 as number,
                alt: newChecklist.payloadDropLandAlt2 as number,
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
      newLocked[waypointType as PayloadType] = false;
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
    const { theme } = this.props;
    return (
      <div>
        <p>Takeoff Coordinates</p>
        <input className="inputFields" type="number" name="payloadDropTakoffLat" value={checklist.payloadDropTakoffLat || ''} disabled={locked.payloadDropTakoff} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="payloadDropTakoffLng" value={checklist.payloadDropTakoffLng || ''} disabled={locked.payloadDropTakoff} onChange={this.onChange} placeholder="Longitude" />
        <input className="inputFields" type="number" name="payloadDropTakoffAlt" value={checklist.payloadDropTakoffAlt || ''} disabled={locked.payloadDropTakoff} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton theme={theme} name="payloadDropTakoff" value="Takeoff" />

        <p>Loiter Coordinates</p>
        <input className="inputFields" type="number" name="payloadDropLoiterLat" value={checklist.payloadDropLoiterLat || ''} disabled={locked.payloadDropLoiter} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="payloadDropLoiterLng" value={checklist.payloadDropLoiterLng || ''} disabled={locked.payloadDropLoiter} onChange={this.onChange} placeholder="Longitude" />
        <input className="inputFields" type="number" name="payloadDropLoiterAlt" value={checklist.payloadDropLoiterAlt || ''} disabled={locked.payloadDropLoiter} onChange={this.onChange} placeholder="Altitude" />
        <br />
        <input className="inputFields" type="number" name="payloadDropLoiterRadius" value={checklist.payloadDropLoiterRadius || ''} disabled={locked.payloadDropLoiter} onChange={this.onChange} placeholder="Radius" />
        <input className="inputFields" type="number" name="payloadDropLoiterDirection" value={checklist.payloadDropLoiterDirection || ''} disabled={locked.payloadDropLoiter} onChange={this.onChange} placeholder="Direction" />
        <CreateWaypointButton theme={theme} name="payloadDropLoiter" value="Loiter" />

        <p>Payload Drop Coordinates</p>
        <input className="inputFields" type="number" name="payloadDropLat1" value={checklist.payloadDropLat1 || ''} disabled={locked.payloadDrop1} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="payloadDropLng1" value={checklist.payloadDropLng1 || ''} disabled={locked.payloadDrop1} onChange={this.onChange} placeholder="Longitude" />
        <input className="inputFields" type="number" name="payloadDropAlt" value={checklist.payloadDropAlt1 || ''} disabled={locked.payloadDrop1} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton theme={theme} name="payloadDrop1" value="Payload Drop 1" />
        <br />
        <input className="inputFields" type="number" name="payloadDropLat2" value={checklist.payloadDropLat2 || ''} disabled={locked.payloadDrop2} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="payloadDropLng2" value={checklist.payloadDropLng2 || ''} disabled={locked.payloadDrop2} onChange={this.onChange} placeholder="Longitude" />
        <input className="inputFields" type="number" name="payloadDropAlt" value={checklist.payloadDropAlt2 || ''} disabled={locked.payloadDrop2} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton theme={theme} name="payloadDrop2" value="Payload Drop 2" />

        <p>Land Waypoints</p>
        <input className="inputFields" type="number" name="payloadDropLandLat1" value={checklist.payloadDropLandLat1 || ''} disabled={locked.payloadDropLand1} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="payloadDropLandLng1" value={checklist.payloadDropLandLng1 || ''} disabled={locked.payloadDropLand1} onChange={this.onChange} placeholder="Longitude" />
        <input className="inputFields" type="number" name="payloadDropLandAlt1" value={checklist.payloadDropLandAlt1 || ''} disabled={locked.payloadDropLand1} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton theme={theme} name="payloadDropLand1" value="Land 1" />
        <br />
        <br />
        <input className="inputFields" type="number" name="payloadDropLandLat2" value={checklist.payloadDropLandLat2 || ''} disabled={locked.payloadDropLand2} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="payloadDropLandLng2" value={checklist.payloadDropLandLng2 || ''} disabled={locked.payloadDropLand2} onChange={this.onChange} placeholder="Longitude" />
        <input className="inputFields" type="number" name="payloadDropLandAlt2" value={checklist.payloadDropLandAlt2 || ''} disabled={locked.payloadDropLand2} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton theme={theme} name="payloadDropLand2" value="Land 2" />
        <br />
      </div>
    );
  }
}

export default {
  missionName,
  layout: PayloadDrop,
};
