import React, { ReactNode } from 'react';

import { missionName, jobTypes } from '../../../common/missions/PayloadDrop';

export const name = 'Payload Drop';

export function PayloadDrop(): ReactNode {
  return (
    <div>Payload Drop</div>
  );
}

export default {
  name,
  missionName,
  jobTypes,
  layout: PayloadDrop as React.ElementType,
};
