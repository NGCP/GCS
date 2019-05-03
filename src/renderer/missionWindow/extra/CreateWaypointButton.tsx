import React, { PureComponent, ReactNode } from 'react';

import { ThemeProps } from '../../../types/componentStyle';
import '../mission.css';

import ipc from '../../../util/ipc';

export interface CreateWaypointButtonProps extends ThemeProps {
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
    const { theme } = this.props;
    return (
      <button
        className={`waypointButton${theme === 'dark' ? '_dark' : ''}`}
        type="button"
        onClick={this.onClick}
      >
        {'Create Pin'}
      </button>
    );
  }
}
