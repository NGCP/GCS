import React, { ReactNode } from 'react';

import { missionName } from '../../../common/missions/UGVRescue';

export const name = 'UGV Rescue';

export function UGVRescue(): ReactNode {
  return (
    <div>UGV Rescue</div>
  );
}

export default {
  missionName,
  layout: UGVRescue as React.ElementType,
};
