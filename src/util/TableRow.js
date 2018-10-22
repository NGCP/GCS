import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Modified table row <tr> to support a callback function when it is clicked
 *
 * See this article for more information
 * https://stackoverflow.com/questions/29810914/react-js-onclick-cant-pass-value-to-method
 */
export default class TableRow extends Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const { onClick, value } = this.props;

    if (onClick && value) onClick(value);
  }

  render() {
    return (
      <tr onClick={this.onClick}>
        {this.props.children}
      </tr>
    );
  }
}

TableRow.propTypes = {
  /** any <td> or <th> nested under this element */
  children: PropTypes.any,
  /** function to run when element is clicked */
  onClick: PropTypes.func,
  /** value to pass to function when element is clicked */
  value: PropTypes.any,
};
