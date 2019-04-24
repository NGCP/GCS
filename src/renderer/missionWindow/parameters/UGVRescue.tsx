import React, { ReactNode } from 'react';

import { jobTypes } from '../../../common/missions/UGVRescue';

export const name = 'UGV Rescue';

export function UGVRescue(): ReactNode {
  return (
    <div>UGV Rescue</div>
  );
}

export default {
  name,
  jobTypes,
  layout: UGVRescue as React.ElementType,
};
