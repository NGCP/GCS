import React, { ReactNode } from 'react';

import { jobTypes } from '../../../common/missions/ISRSearch';

export const name = 'ISR Search';

export function ISRSearch(): ReactNode {
  return (
    <div>ISR Search</div>
  );
}

export default {
  name,
  jobTypes,
  layout: ISRSearch as React.ElementType,
};
