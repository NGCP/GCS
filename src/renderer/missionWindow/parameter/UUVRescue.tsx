import React, { ReactNode } from 'react';

import { missionName } from '../../../common/missions/UUVRescue';

export const name = 'UUV Rescue';

export function UUVRescue(): ReactNode {
  return (
    <div>UUV Rescue</div>
  );
}

export default {
  missionName,
  layout: UUVRescue as React.ElementType,
};
