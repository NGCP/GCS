import React, { ReactNode } from 'react';

import { missionName } from '../../../common/missions/VTOLSearch';

export const name = 'VTOL Search';

export function VTOLSearch(): ReactNode {
  return (
    <div>VTOL Search</div>
  );
}

export default {
  missionName,
  layout: VTOLSearch as React.ElementType,
};
