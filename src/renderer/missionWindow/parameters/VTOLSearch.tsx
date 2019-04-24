import React, { ReactNode } from 'react';

import { missionName, jobTypes } from '../../../common/missions/VTOLSearch';

export const name = 'VTOL Search';

export function VTOLSearch(): ReactNode {
  return (
    <div>VTOL Search</div>
  );
}

export default {
  name,
  missionName,
  jobTypes,
  layout: VTOLSearch as React.ElementType,
};
