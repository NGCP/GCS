import React, { ReactNode } from 'react';

import { missionName, jobTypes } from '../../../common/missions/UGVRescue';

export const name = 'UGV Rescue';

export function UGVRescue(): ReactNode {
  return (
    <div>UGV Rescue</div>
  );
}

export default {
  name,
  missionName,
  jobTypes,
  layout: UGVRescue as React.ElementType,
};
