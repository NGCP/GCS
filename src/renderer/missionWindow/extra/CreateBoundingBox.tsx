import React, { PureComponent, ReactNode } from 'react';

import ipc from '../../../util/ipc';

export interface CreateBoundingBoxProps {
  /**
   * Identifier that distinguishes
   */
  name: string;

  /**
   * Name of the box itself, when it shows up on the map.
   */
  value: string;
}

export default class CreateBoundingBoxButton extends PureComponent<CreateBoundingBoxProps> {
  public constructor(props: CreateBoundingBoxProps) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  private onClick(): void {
    const { name, value } = this.props;

    ipc.postUnlockParameterInputs(name);
    ipc.postCreateBoundingBoxes({ name: value });
  }

  public render(): ReactNode {
    return <button type="button" onClick={this.onClick}>Create Box</button>;
  }
}
