import React, { PureComponent, ReactNode } from 'react';

import '../mission.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

export default class Checkbox extends PureComponent<CheckboxProps> {
  public render(): ReactNode {
    const { checked, label, onChange } = this.props;

    return (
      <div>
        <label htmlFor="checkbox">
          <input type="checkbox" checked={checked} onChange={onChange} />
          <span>{label}</span>
        </label>
      </div>
    );
  }
}
