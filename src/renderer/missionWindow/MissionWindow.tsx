/* eslint-disable import/no-named-as-default */

import { ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';
import * as Slider from 'rc-slider';

import { JobType } from '../../static/index';

import { ThemeProps } from '../../types/componentStyle';
import * as MissionInformation from '../../types/missionInformation';
import { VehicleStatus } from '../../types/vehicle';

import ISRSearch from './parameters/ISRSearch';
import PayloadDrop from './parameters/PayloadDrop';
import UGVRescue from './parameters/UGVRescue';
import UUVRescue from './parameters/UUVRescue';
import VTOLSearch from './parameters/VTOLSearch';

import ipc from '../../util/ipc';

import './mission.css';

const Range = Slider.createSliderWithTooltip(Slider.Range);

interface MissionLayout {
  name: string;
  jobTypes: JobType[];
  layout: React.ElementType;
}

const layouts: { [key: string]: MissionLayout[] } = {
  land: [ISRSearch, VTOLSearch, PayloadDrop, UGVRescue],
  underwater: [ISRSearch, VTOLSearch, PayloadDrop, UUVRescue],
};

interface State {
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
   * Current status of mission. All statuses will apply to mission except for
   * "waiting", "error", and "disconnected".
   *
   * A little different since when the first mission finishes, the status will go
   * to "next" instead of back to ready. From "next", it goes to "running", etc...
   */
  status: VehicleStatus | 'next';

  /**
   * Information passed to Orchestrator for Mission to start.
   */
  information: {
    land: MissionInformation.Information[];
    underwater: MissionInformation.Information[];
  };

  /**
   * Information passed from missions as their information gets filled up. This is to
   * prevent old information from being lost when user switches start mission.
   */
  informationCache: {
    land: MissionInformation.Information[];
    underwater: MissionInformation.Information[];
  };
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
      information: {
        land: [],
        underwater: [],
      },
      informationCache: {
        land: [],
        underwater: [],
      },
    };

    this.onSliderChange = this.onSliderChange.bind(this);
    this.postStartMissions = this.postStartMissions.bind(this);
    this.toggleMissionType = this.toggleMissionType.bind(this);
    this.tipFormatter = this.tipFormatter.bind(this);
  }

  public componentDidMount(): void {
    ipcRenderer.on('confirmCompleteMission', (): void => { this.setState({ status: 'next' }); });
    ipcRenderer.on('stopMissions', (): void => { this.setState({ status: 'ready' }); });
  }

  private onSliderChange(value: [number, number]): void {
    this.setState({
      startMissionIndex: value[0],
      endMissionIndex: value[1],
    });
  }

  private postStartMissions(): void {
    const {
      missionType,
      requireConfirmation,
      startMissionIndex,
      endMissionIndex,
      information,
    } = this.state;

    ipc.postStartMissions(
      information[missionType].slice(startMissionIndex, endMissionIndex + 1),
      requireConfirmation,
    );
  }

  private toggleMissionType(): void {
    const { missionType } = this.state;
    this.setState({ missionType: missionType === 'land' ? 'underwater' : 'land' });
  }

  private tipFormatter(value: number): string {
    const { missionType } = this.state;

    return layouts[missionType][value].name;
  }

  public render(): ReactNode {
    const { theme } = this.props;
    const {
      information,
      informationCache,
      missionType,
      status,
      startMissionIndex,
    } = this.state;

    const missionTypeText = missionType === 'land' ? 'Land Missions' : 'Underwater Missions';

    const Layout = layouts[missionType][startMissionIndex].layout;

    /*
     * Start button will not appear unless all mission information is filled out
     * (and no mission is running).
     */
    const readyToStart = information[missionType][startMissionIndex] !== undefined;

    return (
      <div className={`missionWrapper${theme === 'dark' ? '_dark' : ''}`}>
        <div className="selectorContainer">
          <button className="selectorButton" type="button" onClick={this.toggleMissionType}>{missionTypeText}</button>
          <Range
            className={`selectorSlider${theme === 'dark' ? '_dark' : ''}`}
            min={0}
            max={layouts[missionType].length - 1}
            onChange={this.onSliderChange}
            tipFormatter={this.tipFormatter}
          />
        </div>
        <div className="infoContainer">
          <Layout information={informationCache[missionType][startMissionIndex]} />
        </div>
        <div className="buttonContainer">
          {status === 'ready' && <button type="button" disabled={!readyToStart} onClick={this.postStartMissions}>Start Missions</button>}
          {status !== 'ready' && <button type="button" onClick={ipc.postStopMissions}>Stop Missions</button>}
          {status === 'running' && <button type="button" onClick={ipc.postPauseMission}>Pause Mission</button>}
          {status === 'paused' && <button type="button" onClick={ipc.postResumeMission}>Resume Mission</button>}
          {status === 'next' && <button type="button" onClick={ipc.postStartNextMission}>Next Mission</button>}
        </div>
      </div>
    );
  }
}
