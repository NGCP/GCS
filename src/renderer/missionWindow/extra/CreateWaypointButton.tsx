import React, { PureComponent, ReactNode } from 'react';

import '../mission.css';

import ipc from '../../../util/ipc';

export interface CreateWaypointButtonProps {
  /**
   * Identifier that distinguishes this button from other buttons.
   */
  name: string;

  /**
   * Name of the waypoint itself, when it shows up on the map.
   */
  value: string;
}

/**
 * One of the buttons that creates a waypoint on clicked.
 */
export default class CreateWaypointButton extends PureComponent<CreateWaypointButtonProps> {
  public constructor(props: CreateWaypointButtonProps) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  private onClick(): void {
    const { name, value } = this.props;

    ipc.postUnlockParameterInputs(name);
    ipc.postCreateWaypoints({ name: value });
  }

  public render(): ReactNode {
    return <button type="button" className="waypointButton" onClick={this.onClick}>Create Pin</button>;
  }
}
