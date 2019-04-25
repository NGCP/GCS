import React, { PureComponent, Fragment, ReactNode } from 'react';

import missionObject from '../../../common/missions/index';

import { vehicleConfig, VehicleInfo } from '../../../static/index';

import * as MissionInformation from '../../../types/missionInformation';
import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';

import Select from '../../form/Select';

export interface ActiveVehicleMappingProps {
  title: { [missionName in MissionInformation.MissionName]: string };
  missionNames: MissionInformation.MissionName[];
  vehicles: { [vehicleId: number]: VehicleObject };
}

export default class ActiveVehicleMapping extends PureComponent<ActiveVehicleMappingProps> {
  public render(): ReactNode {
    const { missionNames, title, vehicles } = this.props;

    const mappingComponents = missionNames.map((missionName): ReactNode => {
      const jobMappingComponents = missionObject[missionName].jobTypes.map((jobType): ReactNode => {
        const eligibleVehicles = Object.keys(vehicles)
          .sort((a, b): number => parseInt(a, 10) - parseInt(b, 10))
          .filter((vehicleIdString): boolean => {
            const vehicleId = parseInt(vehicleIdString, 10);
            return vehicles[vehicleId].jobs.includes(jobType);
          });

        const optionValues = eligibleVehicles
          .map((vehicleIdString): { value: string; title?: string } => {
            const vehicleId = parseInt(vehicleIdString, 10);
            const vehicleName = (vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name;

            return {
              title: `${vehicleId}: ${vehicleName}`,
              value: `${vehicleId}`,
            };
          });

        return (
          <div key={jobType}>
            <span>{`${jobType}: `}</span>
            <Select
              defaultOptionValue={{
                title: 'No vehicle selected',
                value: '0',
              }}
              optionValues={optionValues}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
                ipc.postUpdateActiveVehicleMapping(
                  missionName,
                  jobType,
                  parseInt(event.target.value, 10),
                );
              }}
            />
          </div>
        );
      });

      return (
        <div key={missionName}>
          <h3>{title[missionName]}</h3>
          <Fragment>{jobMappingComponents}</Fragment>
        </div>
      );
    });

    return <Fragment>{mappingComponents}</Fragment>;
  }
}
