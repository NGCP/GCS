import React, { ReactNode } from 'react';

import { jobTypes } from '../../../common/missions/UUVRescue';

export const name = 'UUV Rescue';

export function UUVRescue(): ReactNode {
  return (
    <div>UUV Rescue</div>
  );
}

export default {
  name,
  jobTypes,
  layout: UUVRescue as React.ElementType,
};
