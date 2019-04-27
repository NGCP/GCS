import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import { missionName } from '../../../common/missions/UUVRescue';

import { Location } from '../../../static/index';

import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';
import { readyToStart } from '../../../util/parameter';

import CreateWaypointButton from '../extra/CreateWaypointButton';

type UUVChecklistType = 'uuvRetrieveTargetLat' | 'uuvRetrieveTargetLng';

const checklistCache: { [check in UUVChecklistType]: number | undefined } = {
  uuvRetrieveTargetLat: undefined,
  uuvRetrieveTargetLng: undefined,
};

type UUVWaypointType = 'retrieveTarget';

type Locked = { [waypointType in UUVWaypointType]: boolean } & {
  retrieveTarget: boolean;
}

const lockedCache: Locked = {
  retrieveTarget: true,
};

export interface UUVRescueProps {
  vehicles: { [vehicleId: number]: VehicleObject };
}

interface State {
  checklist: { [check in UUVChecklistType]: number | undefined };

  ready: boolean;

  locked: Locked;
}

export class UUVRescue extends Component<UUVRescueProps, State> {
  public constructor(props: UUVRescueProps) {
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

    const name = event.target.name as UUVChecklistType;
    const value = parseInt(event.target.value, 10) || 0;

    switch (name) {
      case 'uuvRetrieveTargetLat':
        ipc.postUpdateWaypoints(true, { name: 'Retrieve Target', location: { lat: value, lng: checklist.uuvRetrieveTargetLng as number } });
        break;

      case 'uuvRetrieveTargetLng':
        ipc.postUpdateWaypoints(true, { name: 'Retrieve Target', location: { lat: checklist.uuvRetrieveTargetLat as number, lng: value } });
        break;

      default:
        this.updateChecklist({ [name]: value });
        break;
    }
  }

  private updateWaypoints(...waypoints: { name: string; location: Location }[]): void {
    const checks: { [checkName in UUVChecklistType]?: number } = {};

    waypoints.forEach((waypoint): void => {
      switch (waypoint.name) {
        case 'Retrieve Target':
          checks.uuvRetrieveTargetLat = waypoint.location.lat;
          checks.uuvRetrieveTargetLng = waypoint.location.lng;
          break;

        default: break;
      }
    });

    this.updateChecklist(checks);
  }

  private updateChecklist(checks: { [checklistType in UUVChecklistType]?: number }): void {
    const { checklist: newChecklist, ready } = this.state;

    Object.keys(checks).forEach((checklistTypeString): void => {
      const checklistType = checklistTypeString as UUVChecklistType;
      const value = checks[checklistType];

      newChecklist[checklistType] = value;
    });

    if (ready || readyToStart(this)) {
      ipc.postUpdateInformation({
        missionName: 'uuvRescue',
        parameters: {
          retrieveTarget: {
            lat: newChecklist.uuvRetrieveTargetLat as number,
            lng: newChecklist.uuvRetrieveTargetLng as number,
          },
        },
      });
    }

    this.setState({ checklist: newChecklist });
  }

  private unlockParameterInputs(waypointType: string): void {
    const { locked: newLocked } = this.state;

    if (waypointType in newLocked) {
      newLocked[waypointType as UUVWaypointType] = false;
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
        <p>UUV Retrieve Target</p>
        <input type="number" name="uuvRetrieveTargetLat" value={checklist.uuvRetrieveTargetLat || ''} disabled={locked.retrieveTarget} onChange={this.onChange} placeholder="Latitude" />
        <input type="number" name="uuvRetrieveTargetLng" value={checklist.uuvRetrieveTargetLng || ''} disabled={locked.retrieveTarget} onChange={this.onChange} placeholder="Longitude" />
        <CreateWaypointButton name="uuvRetrieveTarget" value="Retrieve Target" />
      </div>
    );
  }
}

export default {
  missionName,
  layout: UUVRescue as React.ElementType,
};
