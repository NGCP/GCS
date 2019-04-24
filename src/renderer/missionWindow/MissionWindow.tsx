import React, { Component, ReactNode } from 'react';
import { Range } from 'rc-slider';

import { ThemeProps } from '../../types/componentStyle';
import * as MissionInformation from '../../types/missionInformation';

import ISRSearch from './parameters/ISRSearch';
import PayloadDrop from './parameters/PayloadDrop';
import UGVRescue from './parameters/UGVRescue';
import UUVRescue from './parameters/UUVRescue';
import VTOLSearch from './parameters/VTOLSearch';

import ipc from '../../util/ipc';

import './mission.css';

const layoutsLandMission = [ISRSearch, VTOLSearch, PayloadDrop, UGVRescue];
const layoutsUnderwaterMission = [ISRSearch, VTOLSearch, PayloadDrop, UUVRescue];

interface State {
  missionType: 'land' | 'underwater';
  requireConfirmation: boolean;
  startMissionIndex: number;
  endMissionIndex: number;
  information: {
    landMission: MissionInformation.Information[];
    underwaterMission: MissionInformation.Information[];
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
      information: {
        landMission: [],
        underwaterMission: [],
      },
    };

    this.onSliderChange = this.onSliderChange.bind(this);
    this.postStartMissions = this.postStartMissions.bind(this);
    this.toggleMissionType = this.toggleMissionType.bind(this);
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

    const missionInformation = missionType === 'land' ? information.landMission : information.underwaterMission;

    ipc.postStartMissions(
      missionInformation.slice(startMissionIndex, endMissionIndex + 1),
      requireConfirmation,
    );
  }

  private toggleMissionType(): void {
    const { missionType } = this.state;

    this.setState({ missionType: missionType === 'land' ? 'underwater' : 'land' });
  }

  public render(): ReactNode {
    const { theme } = this.props;
    const { missionType, startMissionIndex } = this.state;

    const missionTypeText = missionType === 'land' ? 'Land Missions' : 'Underwater Missions';

    const layouts = missionType === 'land' ? layoutsLandMission : layoutsUnderwaterMission;

    if (startMissionIndex >= layouts.length) {
      throw new RangeError('Layout chosen is out of range');
    }

    const Layout = layouts[startMissionIndex] as React.ElementType;


    return (
      <div className={`missionWrapper${theme === 'dark' ? '_dark' : ''}`}>
        <div className="selectorContainer">
          <button className="selectorButton" type="button" onClick={this.toggleMissionType}>{missionTypeText}</button>
          <Range
            className={`selectorSlider${theme === 'dark' ? '_dark' : ''}`}
            min={0}
            max={layouts.length - 1}
            onChange={this.onSliderChange}
          />
        </div>
        <div className="infoContainer">
          <Layout />
        </div>
        <div className="buttonContainer">
          <button type="button" onClick={this.postStartMissions}>Start Mission</button>
        </div>
      </div>
    );
  }
}
