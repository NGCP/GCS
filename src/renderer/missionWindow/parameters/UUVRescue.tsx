import React, { ReactNode } from 'react';

import { missionName, jobTypes } from '../../../common/missions/UUVRescue';

export const name = 'UUV Rescue';

export function UUVRescue(): ReactNode {
  return (
    <div>UUV Rescue</div>
  );
}

export default {
  name,
  missionName,
  jobTypes,
  layout: UUVRescue as React.ElementType,
};
