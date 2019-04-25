import React, { ReactNode } from 'react';

import { missionName } from '../../../common/missions/PayloadDrop';

export const name = 'Payload Drop';

export function PayloadDrop(): ReactNode {
  return (
    <div>Payload Drop</div>
  );
}

export default {
  missionName,
  layout: PayloadDrop as React.ElementType,
};
