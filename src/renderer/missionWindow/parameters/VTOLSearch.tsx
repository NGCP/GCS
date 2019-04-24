import React, { ReactNode } from 'react';

import { jobTypes } from '../../../common/missions/VTOLSearch';

export const name = 'VTOL Search';

export function VTOLSearch(): ReactNode {
  return (
    <div>VTOL Search</div>
  );
}

export default {
  name,
  jobTypes,
  layout: VTOLSearch as React.ElementType,
};
