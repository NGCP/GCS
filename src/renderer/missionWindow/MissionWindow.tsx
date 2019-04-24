import React, { Component, ReactNode } from 'react';
import * as Slider from 'rc-slider';

import { ThemeProps } from '../../types/componentStyle';
import * as MissionInformation from '../../types/missionInformation';

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
  layout: React.ElementType;
}

const layoutsLandMission: MissionLayout[] = [{
  name: 'ISR Search',
  layout: ISRSearch as React.ElementType,
}, {
  name: 'VTOL Search',
  layout: VTOLSearch as React.ElementType,
}, {
  name: 'Payload Drop',
  layout: PayloadDrop as React.ElementType,
}, {
  name: 'UGV Rescue',
  layout: UGVRescue as React.ElementType,
}];

const layoutsUnderwaterMission: MissionLayout[] = [{
  name: 'ISR Search',
  layout: ISRSearch as React.ElementType,
}, {
  name: 'VTOL Search',
  layout: VTOLSearch as React.ElementType,
}, {
  name: 'Payload Drop',
  layout: PayloadDrop as React.ElementType,
}, {
  name: 'UUV Rescue',
  layout: UUVRescue as React.ElementType,
}];

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
    this.tipFormatter = this.tipFormatter.bind(this);
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

  private tipFormatter(value: number): string {
    const { missionType } = this.state;

    return missionType === 'land' ? layoutsLandMission[value].name : layoutsUnderwaterMission[value].name;
  }

  public render(): ReactNode {
    const { theme } = this.props;
    const { missionType, startMissionIndex } = this.state;

    const missionTypeText = missionType === 'land' ? 'Land Missions' : 'Underwater Missions';

    const layouts = missionType === 'land' ? layoutsLandMission : layoutsUnderwaterMission;
    const Layout = layouts[startMissionIndex].layout;

    return (
      <div className={`missionWrapper${theme === 'dark' ? '_dark' : ''}`}>
        <div className="selectorContainer">
          <button className="selectorButton" type="button" onClick={this.toggleMissionType}>{missionTypeText}</button>
          <Range
            className={`selectorSlider${theme === 'dark' ? '_dark' : ''}`}
            min={0}
            max={layouts.length - 1}
            onChange={this.onSliderChange}
            tipFormatter={this.tipFormatter}
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
