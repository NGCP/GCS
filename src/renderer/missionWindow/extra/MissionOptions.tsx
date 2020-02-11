import React, { PureComponent, ReactNode } from 'react';

import * as MissionInformation from '../../../types/missionInformation';

import ipc from '../../../util/ipc';

import Checkbox from './Checkbox';

export interface MissionOptionsProps {
  title: { [missionName in MissionInformation.MissionName]: string };
  missionNames: MissionInformation.MissionName[];
  options: MissionInformation.MissionOptions;
}

export default class MissionOptions extends PureComponent<MissionOptionsProps> {
  private static onChangeISRSearchNoTakeoff(event: React.ChangeEvent<HTMLInputElement>): void {
    ipc.postUpdateOptions('isrSearch', 'noTakeoff', event.target.checked);
  }

  private static onChangeISRSearchNoLand(event: React.ChangeEvent<HTMLInputElement>): void {
    ipc.postUpdateOptions('isrSearch', 'noLand', event.target.checked);
  }

  private static onChangePayloadDropNoTakeoff(event: React.ChangeEvent<HTMLInputElement>): void {
    ipc.postUpdateOptions('payloadDrop', 'noTakeoff', event.target.checked);
  }

  private static onChangePayloadDropNoLand(event: React.ChangeEvent<HTMLInputElement>): void {
    ipc.postUpdateOptions('payloadDrop', 'noLand', event.target.checked);
  }

  public render(): ReactNode {
    const { missionNames, options, title } = this.props;

    const optionComponents = missionNames.filter((missionName): boolean => missionName in options)
      .map((missionName): ReactNode => {
        let checkboxes: ReactNode;

        switch (missionName) {
          case 'isrSearch':
            checkboxes = (
              <>
                <Checkbox
                  checked={options.isrSearch.noTakeoff}
                  onChange={MissionOptions.onChangeISRSearchNoTakeoff}
                  label="Do not takeoff"
                />
                <Checkbox
                  checked={options.isrSearch.noLand}
                  onChange={MissionOptions.onChangeISRSearchNoLand}
                  label="Do not land after search"
                />
              </>
            );
            break;

          case 'payloadDrop':
            checkboxes = (
              <>
                <Checkbox
                  checked={options.payloadDrop.noTakeoff}
                  onChange={MissionOptions.onChangePayloadDropNoTakeoff}
                  label="Do not takeoff"
                />
                <Checkbox
                  checked={options.payloadDrop.noLand}
                  onChange={MissionOptions.onChangePayloadDropNoLand}
                  label="Do not land after search"
                />
              </>
            );
            break;

          default:
            throw new RangeError(`Tried to make mission option component for ${missionName}`);
        }

        return (
          <div key={missionName}>
            <h3>{title[missionName]}</h3>
            {checkboxes}
          </div>
        );
      });

    return <>{optionComponents}</>;
  }
}
