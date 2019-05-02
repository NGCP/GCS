import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import './parameters.css';

import { BoundingBoxBounds } from '../../../types/componentStyle';

import { missionName } from '../../../common/missions/VTOLSearch';

import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';
import { readyToStart } from '../../../util/parameter';

import CreateBoundingBoxButton from '../extra/CreateBoundingBoxButton';

type VTOLSearchChecklistType = 'quickScanTop' | 'quickScanLeft' | 'quickScanRight' | 'quickScanBottom';

const checklistCache: { [check in VTOLSearchChecklistType ]: number | undefined} = {
  quickScanTop: undefined,
  quickScanLeft: undefined,
  quickScanRight: undefined,
  quickScanBottom: undefined,
};

type VTOLSearchType = 'quickScan';

type Locked = { [type in VTOLSearchType]: boolean} & {
  quickScan: boolean;
}

const lockedCache: Locked = {
  quickScan: true,
};

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface VTOLSearchProps {
  vehicles: { [vehicleId: number]: VehicleObject };
}

interface State {
  /**
   * Checklist of all required points for bounding box. This is used to generate the
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
    this.updateBoundingBoxes = this.updateBoundingBoxes.bind(this);
    this.updateChecklist = this.updateChecklist.bind(this);
    this.readyToStart = this.readyToStart.bind(this);
    this.unlockParameterInputs = this.unlockParameterInputs.bind(this);
  }

  public componentDidMount(): void {
    ipcRenderer.on('updateBoundingBoxes', (__: Event, _: boolean, ...boxPoints: { name: string; bounds: BoundingBoxBounds }[]): void => this.updateBoundingBoxes(...boxPoints));
    ipcRenderer.on('unlockParameterInputs', (_: Event, waypointType: string): void => this.unlockParameterInputs(waypointType));
  }

  private onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { checklist } = this.state;
    if (!(event.target.name in checklist)) return;

    const name = event.target.name as VTOLSearchChecklistType;
    const value = parseInt(event.target.value, 10) || 0;
    switch (name) {
      case 'quickScanTop':
        ipc.postUpdateBoundingBoxes(true, {
          name: 'Bounding Box',
          bounds: {
            top: value,
            bottom: checklist.quickScanBottom as number,
            left: checklist.quickScanLeft as number,
            right: checklist.quickScanRight as number,
          },
        });
        break;

      case 'quickScanLeft':
        ipc.postUpdateBoundingBoxes(true, {
          name: 'Bounding Box',
          bounds: {
            top: checklist.quickScanTop as number,
            bottom: checklist.quickScanBottom as number,
            left: value,
            right: checklist.quickScanRight as number,
          },
        });
        break;

      case 'quickScanRight':
        ipc.postUpdateBoundingBoxes(true, {
          name: 'Bounding Box',
          bounds: {
            top: checklist.quickScanTop as number,
            bottom: checklist.quickScanBottom as number,
            left: checklist.quickScanLeft as number,
            right: value,
          },
        });
        break;

      case 'quickScanBottom':
        ipc.postUpdateBoundingBoxes(true, {
          name: 'Bounding Box',
          bounds: {
            top: checklist.quickScanTop as number,
            bottom: value,
            left: checklist.quickScanLeft as number,
            right: checklist.quickScanRight as number,
          },
        });
        break;

      default:
        this.updateChecklist({ [name]: value });
        break;
    }
  }

  private updateBoundingBoxes(
    ...boundingBoxes: { name: string; bounds: BoundingBoxBounds }[]
  ): void {
    const checks: { [checkName in VTOLSearchChecklistType]?: number} = {};

    boundingBoxes.forEach((boxpoint): void => {
      switch (boxpoint.name) {
        case 'Bounding Box':
          checks.quickScanTop = boxpoint.bounds.top;
          checks.quickScanRight = boxpoint.bounds.right;
          checks.quickScanLeft = boxpoint.bounds.left;
          checks.quickScanBottom = boxpoint.bounds.bottom;
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
                  lat: newChecklist.quickScanTop as number,
                  lng: newChecklist.quickScanLeft as number,
                },
                {
                  lat: newChecklist.quickScanTop as number,
                  lng: newChecklist.quickScanRight as number,
                },
                {
                  lat: newChecklist.quickScanBottom as number,
                  lng: newChecklist.quickScanLeft as number,
                },
                {
                  lat: newChecklist.quickScanBottom as number,
                  lng: newChecklist.quickScanRight as number,
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
        <input className="inputFields" type="number" name="quickScanTop" value={checklist.quickScanTop || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Top" />
        <br />
        <input className="inputFields" type="number" name="quickScanBottom" value={checklist.quickScanBottom || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Bottom" />
        <br />
        <input className="inputFields" type="number" name="quickScanLeft" value={checklist.quickScanLeft || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Left" />
        <br />
        <input className="inputFields" type="number" name="quickScanRight" value={checklist.quickScanRight || ''} disabled={locked.quickScan} onChange={this.onChange} placeholder="Right" />
        <CreateBoundingBoxButton name="quickScan" value="Bounding Box" />
      </div>
    );
  }
}

export default {
  missionName,
  layout: VTOLSearch,
};
