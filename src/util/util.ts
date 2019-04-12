import { Component } from 'react';

import { VehicleObject } from '../types/types';

/**
 * Updates vehicles being shown. This is run on map and vehicle containers.
 */
export function updateVehicles(
  component: Component<{}, { vehicles: { [vehicleId: string]: VehicleObject } }>,
  ...vehicles: VehicleObject[]
): void {
  const { vehicles: thisVehicles } = component.state;
  const currentVehicles = thisVehicles;

  vehicles.forEach((vehicle): void => {
    currentVehicles[vehicle.vehicleId] = vehicle;
  });

  component.setState({ vehicles: currentVehicles });
}

/**
 * Checks if the string is a JSON.
 */
export function isJSON(message: string): boolean {
  if (!message) return false;

  try {
    JSON.parse(message);
  } catch (e) {
    return false;
  }
  return true;
}

export default {
  isJSON,
  updateVehicles,
};
