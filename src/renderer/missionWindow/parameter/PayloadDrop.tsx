import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import { missionName } from '../../../common/missions/PayloadDrop';

import { Location } from '../../../static/index';

import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';
import { readyToStart } from '../../../util/parameter';

import CreateWaypointButton from '../extra/CreateWaypointButton';

type PayloadDropChecklistType = 'takeoffLat' | 'takeoffLng' | 'takeoffAlt'
| 'loiterLat' | 'loiterLng' | 'loiterAlt' | 'loiterRadius' | 'loiterDirection'
| 'payloadDropLat1' | 'payloadDropLng1' | 'payloadDropAlt1'
| 'payloadDropLat2' | 'payloadDropLng2' | 'payloadDropAlt2'
| 'landLat1' | 'landLng1' | 'landAlt1'
| 'landLat2' | 'landLng2' | 'landAlt2';

const checklistCache: { [check in PayloadDropChecklistType ]: number | undefined } = {
  takeoffLat: undefined,
  takeoffLng: undefined,
  takeoffAlt: undefined,
  loiterLat: undefined,
  loiterLng: undefined,
  loiterAlt: undefined,
  loiterRadius: undefined,
  loiterDirection: undefined,
  payloadDropAlt1: undefined,
  payloadDropLat1: undefined,
  payloadDropLng1: undefined,
  payloadDropAlt2: undefined,
  payloadDropLat2: undefined,
  payloadDropLng2: undefined,
  landLat1: undefined,
  landLng1: undefined,
  landAlt1: undefined,
  landLat2: undefined,
  landLng2: undefined,
  landAlt2: undefined,
};

type PayloadType = 'takeoff' | 'loiter' | 'payloadDrop1'| 'payloadDrop2' | 'land1' | 'land2';

type Locked = { [type in PayloadType]: boolean} & {
  takeoff: boolean;
  loiter: boolean;
  payloadDrop1: boolean;
  payloadDrop2: boolean;
  land1: boolean;
  land2: boolean;
}

const lockedCache: Locked = {
  takeoff: true,
  loiter: true,
  payloadDrop1: true,
  payloadDrop2: true,
  land1: true,
  land2: true,
};

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface PayloadDropProps {
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
      case 'takeoffLat':
        ipc.postUpdateWaypoints(true, { name: 'Takeoff', location: { lat: value, lng: checklist.takeoffLng as number } });
        break;
      case 'takeoffLng':
        ipc.postUpdateWaypoints(true, { name: 'Takeoff', location: { lat: checklist.takeoffLat as number, lng: value } });
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
    const checks: { [checkName in PayloadDropChecklistType]?: number} = {};

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

        case 'Payload Drop 1':
          checks.payloadDropLat1 = waypoint.location.lat;
          checks.payloadDropLng1 = waypoint.location.lng;
          break;

        case 'Payload Drop 2':
          checks.payloadDropLat2 = waypoint.location.lat;
          checks.payloadDropLng2 = waypoint.location.lng;
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

        <p>Payload Drop Coordinates</p>
        <input type="number" name="payloadDropLat1" value={checklist.payloadDropLat1 || ''} disabled={locked.payloadDrop1} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="payloadDropLng1" value={checklist.payloadDropLng1 || ''} disabled={locked.payloadDrop1} onChange={this.onChange} placeholder="Longitude" />
        <input type="number" name="payloadDropAlt" value={checklist.payloadDropAlt1 || ''} disabled={locked.payloadDrop1} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton name="payloadDrop1" value="Payload Drop 1" />
        <br />
        <input type="number" name="payloadDropLat2" value={checklist.payloadDropLat2 || ''} disabled={locked.payloadDrop2} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="payloadDropLng2" value={checklist.payloadDropLng2 || ''} disabled={locked.payloadDrop2} onChange={this.onChange} placeholder="Longitude" />
        <input type="number" name="payloadDropAlt" value={checklist.payloadDropAlt2 || ''} disabled={locked.payloadDrop2} onChange={this.onChange} placeholder="Altitude" />
        <CreateWaypointButton name="payloadDrop2" value="Payload Drop 2" />

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

/*
 * export function PayloadDrop(): ReactNode {
 *   return (
 *     <div>Payload Drop</div>
 *   );
 * }
 */

export default {
  missionName,
  layout: PayloadDrop as React.ElementType,
};
