import React, { Component } from 'react';

import './vehicle.css';

const WIDTH = {
  id: 0.2,
  name: 0.4,
  battery: 0.4,
};

export default class VehicleContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vehicle: '',
    };
  }


  render() {
    this.setState();
    return (
      <div className='vehicleContainer container'>
        <table className='vehicleData'>
          <tr className='vehicleTableHeader'>
            <th style={{ width: `${100 * WIDTH.id}%` }}>ID</th>
            <th style={{ width: `${100 * WIDTH.name}%` }}>NAME</th>
            <th style={{ width: `${100 * WIDTH.battery}%` }}>BATTERY</th>
          </tr>
        </table>
      </div>
    );
  }
}
