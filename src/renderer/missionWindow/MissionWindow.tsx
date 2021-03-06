/* eslint-disable import/no-named-as-default */

import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';
import * as Slider from 'rc-slider';

import { JobType } from '../../static/index';
import { BoundingBoxBounds, ThemeProps } from '../../types/componentStyle';
import * as MissionInformation from '../../types/missionInformation';
import { VehicleObject, VehicleStatus } from '../../types/vehicle';

import ipc from '../../util/ipc';
import { updateVehicles } from '../../util/util';

import ActiveVehicleMapping from './extra/ActiveVehicleMapping';
import MissionOptions from './extra/MissionOptions';
import CreateBoundingBoxButton from './extra/CreateBoundingBoxButton';

import ISRSearch from './parameter/ISRSearch';
import PayloadDrop from './parameter/PayloadDrop';
import UGVRescue from './parameter/UGVRescue';
import UUVRescue from './parameter/UUVRescue';
import VTOLSearch from './parameter/VTOLSearch';

import './mission.css';

const Range = Slider.createSliderWithTooltip(Slider.Range);

interface MissionLayout {
  missionName: MissionInformation.MissionName;
  layout: React.ElementType;
}

const layouts: { [key: string]: MissionLayout[] } = {
  land: [ISRSearch, VTOLSearch, PayloadDrop, UGVRescue],
  underwater: [ISRSearch, VTOLSearch, PayloadDrop, UUVRescue],
};

const initialInformation: {
  [missionName in MissionInformation.MissionName]: MissionInformation.Information;
} = {
  isrSearch: { missionName: 'isrSearch' },
  vtolSearch: { missionName: 'vtolSearch' },
  payloadDrop: { missionName: 'payloadDrop' },
  ugvRescue: { missionName: 'ugvRescue' },
  uuvRescue: { missionName: 'uuvRescue' },
};

const title: { [missionName in MissionInformation.MissionName]: string } = {
  isrSearch: 'ISR Search',
  vtolSearch: 'VTOL Search',
  payloadDrop: 'Payload Drop',
  ugvRescue: 'UGV Rescue',
  uuvRescue: 'UUV Rescue',
};

type GeofenceChecklistType = 'geofenceTop' | 'geofenceLeft' | 'geofenceRight' | 'geofenceBottom';

const checklistCache: { [check in GeofenceChecklistType ]: number | undefined} = {
  geofenceTop: undefined,
  geofenceLeft: undefined,
  geofenceRight: undefined,
  geofenceBottom: undefined,
};

type Locked = {
  geofence: boolean;
};

const lockedCache: Locked = {
  geofence: true,
};


interface State {
  /**
   * Checklist of all required points for bounding box. This is used to generate the
   * parameters for the mission.
   */
  checklist: { [check in GeofenceChecklistType]: number | undefined };

  /**
   * True if the inputs for the waypoint type is disabled. Will become disabled
   * once the create pin is clicked.
   */
  locked: Locked;

  /**
   * Land missionType means we are performing UGV mission.
   * Underwater missionType means we are performing UUV mission.
   */
  missionType: 'land' | 'underwater';

  /**
   * True if user should need to confirm before starting next mission.
   */
  requireConfirmation: boolean;

  /**
   * First mission to perform.
   */
  startMissionIndex: number;

  /**
   * Last mission to perform.
   */
  endMissionIndex: number;

  /**
   * Current status of mission.
   * - ready: no mission running
   * - running: mission running
   * - paused: mission paused
   * - next: current mission has completed, waiting for next one to start
   * - finished: all missions have finished
   *
   * A little different since when the first mission finishes, the status will go
   * to "next" instead of back to ready. From "next", it goes to "running", etc...
   */
  status: VehicleStatus | 'next' | 'finished';

  /**
   * Current vehicles connected.
   */
  vehicles: { [vehicleId: number]: VehicleObject };

  /**
   * Mapping for all missions selected.
   */
  activeVehicleMapping: MissionInformation.ActiveVehicleMapping;

  /**
   * Options for the missions.
   */
  options: MissionInformation.MissionOptions;

  /**
   * Information passed to Orchestrator for Mission to start.
   */
  information: { [missionName in MissionInformation.MissionName]: MissionInformation.Information };
}

/**
 * Mission window component.
 */
export default class MissionWindow extends Component<ThemeProps, State> {
  public constructor(props: ThemeProps) {
    super(props);

    this.state = {
      missionType: 'land',
      requireConfirmation: true,
      startMissionIndex: 0,
      endMissionIndex: 0,
      status: 'ready',
      vehicles: {},
      activeVehicleMapping: {
        isrSearch: {},
        vtolSearch: {},
        payloadDrop: {},
        ugvRescue: {},
        uuvRescue: {},
      },
      options: {
        isrSearch: {
          noTakeoff: false,
          noLand: false,
        },
        payloadDrop: {
          noTakeoff: false,
          noLand: false,
        },
      },
      information: initialInformation,
      checklist: checklistCache,
      locked: lockedCache,
    };

    this.onSliderChange = this.onSliderChange.bind(this);
    this.updateVehicles = this.updateVehicles.bind(this);
    this.updateInformation = this.updateInformation.bind(this);
    this.updateOptions = this.updateOptions.bind(this);
    this.postStartMissions = this.postStartMissions.bind(this);
    this.postPauseMission = this.postPauseMission.bind(this);
    this.postResumeMission = this.postResumeMission.bind(this);
    this.postStartNextMission = this.postStartNextMission.bind(this);
    this.stopMissions = this.stopMissions.bind(this);
    this.toggleMissionType = this.toggleMissionType.bind(this);
    this.tipFormatter = this.tipFormatter.bind(this);

    this.onChange = this.onChange.bind(this);
    this.updateBoundingBoxes = this.updateBoundingBoxes.bind(this);
    this.updateChecklist = this.updateChecklist.bind(this);
    this.unlockParameterInputs = this.unlockParameterInputs.bind(this);
  }

  public componentDidMount(): void {
    ipcRenderer.on('updateBoundingBoxes', (__: Event, _: boolean, ...boxPoints: { name: string; bounds: BoundingBoxBounds }[]): void => this.updateBoundingBoxes(...boxPoints));
    ipcRenderer.on('unlockParameterInputs', (_: Event, waypointType: string): void => this.unlockParameterInputs(waypointType));

    ipcRenderer.on('updateVehicles', (_: Event, ...vehicles: VehicleObject[]): void => this.updateVehicles(...vehicles));

    ipcRenderer.on('updateInformation', (_: Event, information: MissionInformation.Information): void => this.updateInformation(information));
    ipcRenderer.on('updateOptions', (_: Event, missionName: MissionInformation.MissionName, option: string, value: boolean): void => this.updateOptions(missionName, option, value));
    ipcRenderer.on('updateActiveVehicleMapping', (_: Event, missionName: MissionInformation.MissionName, jobType: JobType, vehicleId: number): void => this.updateActiveVehicleMapping(missionName, jobType, vehicleId));

    ipcRenderer.on('confirmCompleteMission', (): void => this.setState({ status: 'next' }));
    ipcRenderer.on('stopMissions', (): void => this.stopMissions());
    ipcRenderer.on('finishMissions', (): void => this.setState({ status: 'finished' }));
  }

  private onSliderChange(value: [number, number]): void {
    this.setState({
      startMissionIndex: value[0],
      endMissionIndex: value[1],
    });
  }

  private onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { checklist } = this.state;
    if (!(event.target.name in checklist)) return;

    const name = event.target.name as GeofenceChecklistType;
    const value = parseInt(event.target.value, 10) || 0;
    switch (name) {
      case 'geofenceTop':
        ipc.postUpdateBoundingBoxes(true, {
          name: 'Geofencing',
          bounds: {
            top: value,
            bottom: checklist.geofenceBottom as number,
            left: checklist.geofenceLeft as number,
            right: checklist.geofenceRight as number,
          },
        });
        break;

      case 'geofenceLeft':
        ipc.postUpdateBoundingBoxes(true, {
          name: 'Geofencing',
          bounds: {
            top: checklist.geofenceTop as number,
            bottom: checklist.geofenceBottom as number,
            left: value,
            right: checklist.geofenceRight as number,
          },
        });
        break;

      case 'geofenceRight':
        ipc.postUpdateBoundingBoxes(true, {
          name: 'Geofencing',
          bounds: {
            top: checklist.geofenceTop as number,
            bottom: checklist.geofenceBottom as number,
            left: checklist.geofenceLeft as number,
            right: value,
          },
        });
        break;

      case 'geofenceBottom':
        ipc.postUpdateBoundingBoxes(true, {
          name: 'Geofencing',
          bounds: {
            top: checklist.geofenceTop as number,
            bottom: value,
            left: checklist.geofenceLeft as number,
            right: checklist.geofenceRight as number,
          },
        });
        break;

      default:
        this.updateChecklist({ [name]: value });
        break;
    }
  }

  private updateVehicles(...vehicles: VehicleObject[]): void {
    updateVehicles(this, ...vehicles);

    const { activeVehicleMapping: newActiveVehicleMapping } = this.state;

    // Check for disconnected vehicles in activeVehicleMapping and remove them.
    vehicles.forEach((vehicle): void => {
      if (vehicle.status === 'disconnected') {
        if (Object.keys(newActiveVehicleMapping.isrSearch).includes(`${vehicle.vehicleId}`)) {
          delete newActiveVehicleMapping.isrSearch[vehicle.vehicleId];
        } else if (Object.keys(newActiveVehicleMapping.vtolSearch).includes(`${vehicle.vehicleId}`)) {
          delete newActiveVehicleMapping.vtolSearch[vehicle.vehicleId];
        } else if (Object.keys(newActiveVehicleMapping.payloadDrop).includes(`${vehicle.vehicleId}`)) {
          delete newActiveVehicleMapping.payloadDrop[vehicle.vehicleId];
        } else if (Object.keys(newActiveVehicleMapping.ugvRescue).includes(`${vehicle.vehicleId}`)) {
          delete newActiveVehicleMapping.ugvRescue[vehicle.vehicleId];
        } else if (Object.keys(newActiveVehicleMapping.uuvRescue).includes(`${vehicle.vehicleId}`)) {
          delete newActiveVehicleMapping.uuvRescue[vehicle.vehicleId];
        }
      }
    });

    this.setState({ activeVehicleMapping: newActiveVehicleMapping });
  }

  private updateInformation(information: MissionInformation.Information): void {
    const { information: currentInformation } = this.state;
    const newInformation = currentInformation;

    newInformation[information.missionName] = information;
    this.setState({ information: newInformation });
  }

  private updateOptions(
    missionName: MissionInformation.MissionName,
    option: string,
    value: boolean,
  ): void {
    const { options: currentOptions } = this.state;
    const newOptions = currentOptions;

    switch (missionName) {
      case 'isrSearch':
        if (option === 'noTakeoff') newOptions.isrSearch.noTakeoff = value;
        if (option === 'noLand') newOptions.isrSearch.noLand = value;
        break;

      case 'payloadDrop':
        if (option === 'noTakeoff') newOptions.payloadDrop.noTakeoff = value;
        if (option === 'noLand') newOptions.payloadDrop.noLand = value;
        break;

      default:
        throw new RangeError(`Tried to change mission option for ${missionName}`);
    }

    this.setState({ options: newOptions });
  }

  private updateActiveVehicleMapping(
    missionName: MissionInformation.MissionName,
    jobType: JobType,
    vehicleId: number,
  ): void {
    const { activeVehicleMapping: currentActiveVehicleMapping } = this.state;
    const newActiveVehicleMapping = currentActiveVehicleMapping;

    if (vehicleId !== 0) {
      newActiveVehicleMapping[missionName][vehicleId] = jobType;
    } else {
      const deleteVehicleIdString = Object.keys(newActiveVehicleMapping)
        .find((vehicleIdString): boolean => {
          const vid = parseInt(vehicleIdString, 10);
          return newActiveVehicleMapping[missionName][vid] === jobType;
        });

      if (deleteVehicleIdString) {
        const deleteVehicleId = parseInt(deleteVehicleIdString, 10);
        delete newActiveVehicleMapping[missionName][deleteVehicleId];
      }
    }
    this.setState({ activeVehicleMapping: newActiveVehicleMapping });
  }

  private updateBoundingBoxes(
    ...boundingBoxes: { name: string; bounds: BoundingBoxBounds }[]
  ): void {
    const checks: { [checkName in GeofenceChecklistType]?: number} = {};

    boundingBoxes.forEach((boxpoint): void => {
      switch (boxpoint.name) {
        case 'Geofencing':
          checks.geofenceTop = boxpoint.bounds.top;
          checks.geofenceRight = boxpoint.bounds.right;
          checks.geofenceLeft = boxpoint.bounds.left;
          checks.geofenceBottom = boxpoint.bounds.bottom;
          break;

        default: break;
      }
    });

    this.updateChecklist(checks);
  }

  private updateChecklist(checks: { [checklistType in GeofenceChecklistType]?: number }): void {
    const { checklist: newChecklist } = this.state;

    Object.keys(checks).forEach((checklistTypeString): void => {
      const checklistType = checklistTypeString as GeofenceChecklistType;
      const value = checks[checklistType];
      newChecklist[checklistType] = value;
    });

    this.setState({ checklist: newChecklist });
  }

  private postStartMissions(): void {
    const {
      activeVehicleMapping,
      endMissionIndex,
      information,
      missionType,
      options,
      requireConfirmation,
      startMissionIndex,
    } = this.state;

    // Gets all relevant mission information for the missions being performed for the mission type.
    const missionInformation = layouts[missionType].slice(startMissionIndex, endMissionIndex + 1)
      .map(({ missionName }): MissionInformation.Information => information[missionName]);

    ipc.postStartMissions(missionInformation, activeVehicleMapping, options, requireConfirmation);
    this.setState({ status: 'running' });
  }

  private postPauseMission(): void {
    ipc.postPauseMission();
    this.setState({ status: 'paused' });
  }

  private postResumeMission(): void {
    ipc.postResumeMission();
    this.setState({ status: 'running' });
  }

  private postStartNextMission(): void {
    ipc.postStartNextMission();
    this.setState({ status: 'running' });
  }

  private stopMissions(): void {
    this.setState({ status: 'ready' });
  }

  private toggleMissionType(): void {
    const { missionType } = this.state;
    this.setState({ missionType: missionType === 'land' ? 'underwater' : 'land' });
  }

  private tipFormatter(value: number): string {
    const { missionType } = this.state;
    const { missionName } = layouts[missionType][value];

    return title[missionName];
  }

  private unlockParameterInputs(waypointType: string): void {
    const { locked: newLocked } = this.state;

    if (waypointType === 'geofence') {
      newLocked.geofence = false;
    }

    this.setState({ locked: newLocked });
  }

  public render(): ReactNode {
    const { checklist, locked } = this.state;
    const { theme } = this.props;
    const {
      information,
      missionType,
      status,
      startMissionIndex,
      endMissionIndex,
      options,
      vehicles,
    } = this.state;

    // Text displayed on toggle button.
    const missionTypeText = missionType === 'land' ? 'Land Missions' : 'Underwater Missions';

    /*
     * Used to render mission UI layout as well as determine which mission layout
     * corresponds to which mission information.
     */
    const { layout: Layout, missionName } = layouts[missionType][startMissionIndex];

    // Used to render all the required jobs and options.
    const missionNames = layouts[missionType].slice(startMissionIndex, endMissionIndex + 1)
      .map((layout): MissionInformation.MissionName => layout.missionName);

    /*
     * Start button will not appear unless all mission information is filled out
     * (and no mission is running).
     */

    const unlockStartMissionButton = information[missionName].parameters !== undefined
      && checklist.geofenceTop !== undefined
      && checklist.geofenceBottom !== undefined
      && checklist.geofenceLeft !== undefined
      && checklist.geofenceRight !== undefined;

    return (
      <div className={`missionWrapper${theme === 'dark' ? '_dark' : ''}`}>
        <div className="selectorContainer">
          <button className={`selectorButton${theme === 'dark' ? '_dark' : ''}`} type="button" onClick={this.toggleMissionType}>{missionTypeText}</button>
          <Range
            className={`selectorSlider${theme === 'dark' ? '_dark' : ''}`}
            min={0}
            max={layouts[missionType].length - 1}
            onChange={this.onSliderChange}
            tipFormatter={this.tipFormatter}
          />
        </div>
        <div className="parameterContainer">
          <h1 className="title" style={{ marginTop: 0 }}>{`${title[missionName]} Mission Parameters`}</h1>
          {status === 'ready' && <Layout theme={theme} />}
          {status !== 'ready' && <p>:)</p>}
        </div>
        <div className={`mappingContainer container${theme === 'dark' ? '_dark' : ''}`}>
          <h1 style={{ marginTop: 0 }}>Vehicle Mapping</h1>
          <ActiveVehicleMapping title={title} vehicles={vehicles} missionNames={missionNames} />
        </div>
        <div className={`optionsContainer container${theme === 'dark' ? '_dark' : ''}`}>
          <h1 style={{ marginTop: 0 }}>Options</h1>
          <MissionOptions title={title} missionNames={missionNames} options={options} />
        </div>
        <div className="geofenceContainer">
          <h1>Geofencing</h1>
          <input className="inputFields" type="number" name="geofenceScanTop" value={checklist.geofenceTop || ''} disabled={locked.geofence} onChange={this.onChange} placeholder="Top" />
          <br />
          <input className="inputFields" type="number" name="geofenceBottom" value={checklist.geofenceBottom || ''} disabled={locked.geofence} onChange={this.onChange} placeholder="Bottom" />
          <br />
          <input className="inputFields" type="number" name="geofenceLeft" value={checklist.geofenceLeft || ''} disabled={locked.geofence} onChange={this.onChange} placeholder="Left" />
          <br />
          <input className="inputFields" type="number" name="geofenceRight" value={checklist.geofenceRight || ''} disabled={locked.geofence} onChange={this.onChange} placeholder="Right" />
          <CreateBoundingBoxButton theme={theme} name="geofence" value="Geofencing" />
        </div>
        <div className="buttonContainer">
          {status === 'ready' && <button type="button" disabled={!unlockStartMissionButton} onClick={this.postStartMissions}>Start Missions</button>}
          {status !== 'ready' && <button type="button" onClick={ipc.postStopMissions}>Stop Missions</button>}
          {status === 'running' && <button type="button" onClick={this.postPauseMission}>Pause Mission</button>}
          {status === 'paused' && <button type="button" onClick={this.postResumeMission}>Resume Mission</button>}
          {status === 'next' && <button type="button" onClick={this.postStartNextMission}>Next Mission</button>}
          {status === 'finished' && <button type="button" onClick={this.stopMissions}>Finish Missions</button>}
        </div>
      </div>
    );
  }
}
