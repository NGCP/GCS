import {
  vehicleInfos, vehicleStatuses,
} from '../../resources/index';

export function updateVehicles(component, vehicles) {
  const { vehicles: thisVehicles } = component.state;
  const currentVehicles = thisVehicles;

  vehicles.forEach((vehicle) => {
    currentVehicles[vehicle.sid] = {
      ...vehicle,
      ...vehicleInfos[vehicle.sid],
      status: vehicleStatuses[vehicle.status],
    };
  });

  component.setState({ vehicles: currentVehicles });
}

export default {
  updateVehicles,
};
