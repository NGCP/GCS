import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import './parameters.css';

import { ThemeProps } from '../../../types/componentStyle';

import { missionName } from '../../../common/missions/UGVRescue';

import { Location } from '../../../static/index';

import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';
import { readyToStart } from '../../../util/parameter';

import CreateWaypointButton from '../extra/CreateWaypointButton';

type UGVChecklistType = 'ugvRetrieveTargetLat' | 'ugvRetrieveTargetLng' | 'ugvDeliverTargetLat' | 'ugvDeliverTargetLng';

const checklistCache: { [check in UGVChecklistType]: number | undefined } = {
  ugvRetrieveTargetLat: undefined,
  ugvRetrieveTargetLng: undefined,
  ugvDeliverTargetLat: undefined,
  ugvDeliverTargetLng: undefined,
};

type UGVWaypointType = 'retrieveTarget' | 'deliverTarget';

type Locked = { [waypointType in UGVWaypointType]: boolean } & {
  retrieveTarget: boolean;
  deliverTarget: boolean;
};

const lockedCache: Locked = {
  retrieveTarget: true,
  deliverTarget: true,
};

export interface UGVRescueProps extends ThemeProps {
  vehicles: { [vehicleId: number]: VehicleObject };
}

interface State {
  /**
   * Checklist of all required waypoints/coordinates. This is used to generate the
   * parameters for the mission.
   */
  checklist: { [check in UGVChecklistType]: number | undefined };

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

export class UGVRescue extends Component<UGVRescueProps, State> {
  public constructor(props: UGVRescueProps) {
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

    const name = event.target.name as UGVChecklistType;
    const value = parseInt(event.target.value, 10) || 0;

    switch (name) {
      case 'ugvRetrieveTargetLat':
        ipc.postUpdateWaypoints(true, { name: 'Retrieve Target', location: { lat: value, lng: checklist.ugvRetrieveTargetLng as number } });
        break;

      case 'ugvRetrieveTargetLng':
        ipc.postUpdateWaypoints(true, { name: 'Retrieve Target', location: { lat: checklist.ugvRetrieveTargetLat as number, lng: value } });
        break;

      case 'ugvDeliverTargetLat':
        ipc.postUpdateWaypoints(true, { name: 'Deliver Target', location: { lat: value, lng: checklist.ugvDeliverTargetLng as number } });
        break;

      case 'ugvDeliverTargetLng':
        ipc.postUpdateWaypoints(true, { name: 'Deliver Target', location: { lat: checklist.ugvDeliverTargetLat as number, lng: value } });
        break;

      default:
        this.updateChecklist({ [name]: value });
        break;
    }
  }

  private updateWaypoints(...waypoints: { name: string; location: Location }[]): void {
    const checks: { [checkName in UGVChecklistType]?: number } = {};

    waypoints.forEach((waypoint): void => {
      switch (waypoint.name) {
        case 'Retrieve Target':
          checks.ugvRetrieveTargetLat = waypoint.location.lat;
          checks.ugvRetrieveTargetLng = waypoint.location.lng;
          break;

        case 'Deliver Target':
          checks.ugvDeliverTargetLat = waypoint.location.lat;
          checks.ugvDeliverTargetLng = waypoint.location.lng;
          break;

        default: break;
      }
    });

    this.updateChecklist(checks);
  }

  private updateChecklist(checks: { [checklistType in UGVChecklistType]?: number }): void {
    const { checklist: newChecklist, ready } = this.state;

    Object.keys(checks).forEach((checklistTypeString): void => {
      const checklistType = checklistTypeString as UGVChecklistType;
      const value = checks[checklistType];

      newChecklist[checklistType] = value;
    });

    if (ready || readyToStart(this)) {
      ipc.postUpdateInformation({
        missionName: 'ugvRescue',
        parameters: {
          retrieveTarget: {
            lat: newChecklist.ugvRetrieveTargetLat as number,
            lng: newChecklist.ugvRetrieveTargetLng as number,
          },
          deliverTarget: {
            lat: newChecklist.ugvDeliverTargetLat as number,
            lng: newChecklist.ugvDeliverTargetLng as number,
          },
        },
      });
    }

    this.setState({ checklist: newChecklist });
  }

  private unlockParameterInputs(waypointType: string): void {
    const { locked: newLocked } = this.state;

    if (waypointType in newLocked) {
      newLocked[waypointType as UGVWaypointType] = false;
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
        <p>UGV Retrieve Target</p>
        <input className="inputFields" type="number" name="ugvRetrieveTargetLat" value={checklist.ugvRetrieveTargetLat || ''} disabled={locked.retrieveTarget} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="ugvRetrieveTargetLng" value={checklist.ugvRetrieveTargetLng || ''} disabled={locked.retrieveTarget} onChange={this.onChange} placeholder="Longitude" />
        <CreateWaypointButton theme={theme} name="ugvRetrieveTarget" value="Retrieve Target" />

        <p>UGV Deliver Target</p>
        <input className="inputFields" type="number" name="ugvDeliverTargetLat" value={checklist.ugvDeliverTargetLat || ''} disabled={locked.deliverTarget} onChange={this.onChange} placeholder="Latitude" />
        <input className="inputFields" type="number" name="ugvDeliverTargetLng" value={checklist.ugvDeliverTargetLng || ''} disabled={locked.deliverTarget} onChange={this.onChange} placeholder="Longitude" />
        <CreateWaypointButton theme={theme} name="ugvDeliverTarget" value="Deliver Target" />
      </div>
    );
  }
}

export default {
  missionName,
  layout: UGVRescue,
};
