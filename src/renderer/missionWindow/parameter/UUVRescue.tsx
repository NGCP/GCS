import React, { ReactNode } from 'react';

import { missionName } from '../../../common/missions/UUVRescue';

import ipc from '../../../util/ipc';

export function UUVRescue(): ReactNode {
  ipc.postUpdateInformation({ missionName: 'uuvRescue', parameters: { retrieveTarget: {} } });

  return <div />;
}

export default {
  missionName,
  layout: UUVRescue as React.ElementType,
};
