import React, { PureComponent, ReactNode } from 'react';

export interface SelectProps {
  defaultOptionValue: { value: string; title?: ReactNode };
  optionValues: { value: string; title?: ReactNode }[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default class Select extends PureComponent<SelectProps> {
  public constructor(props: SelectProps) {
    super(props);
  }

  public render(): ReactNode {
    const { defaultOptionValue, onChange, optionValues } = this.props;

    return (
      <select onChange={onChange}>
        {[
          <option key="default" value={defaultOptionValue.value}>
            {defaultOptionValue.title || defaultOptionValue.value}
          </option>,
          ...optionValues.map((optionValue): ReactNode => (
            <option key={optionValue.value} value={optionValue.value}>
              {optionValue.title || optionValue.value}
            </option>
          )),
        ]}
      </select>
    );
  }
}
