import React, { PureComponent, ReactNode } from 'react';

import ipc from '../../../util/ipc';

export interface CreateBoundingBoxButtonProps {
  /**
   * Identifier that distinguishes
   */
  name: string;

  /**
   * Name of the box itself, when it shows up on the map.
   */
  value: string;
}

export default class CreateBoundingBoxButton extends PureComponent<CreateBoundingBoxButtonProps> {
  public constructor(props: CreateBoundingBoxButtonProps) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  private onClick(): void {
    const { name, value } = this.props;
    ipc.postUnlockParameterInputs(name);
    ipc.postCreateBoundingBoxes({ name: value });
  }

  public render(): ReactNode {
    return <button type="button" className="boundingBoxButton" onClick={this.onClick}>Create Box</button>;
  }
}
