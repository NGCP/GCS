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

/**
 * Performs binary search for an element. Will return the index in the array
 * the compareFunction goes through (can be the index of the value).
 */
export function searchIndex<T>(
  array: T[],
  value: T,
  compareFunction: (a: T, b: T) => number,
): number {
  let first = 0;
  let last = array.length - 1;

  while (first <= last) {
    const middle = Math.floor((first + last) / 2);
    const comparison = compareFunction(value, array[middle]);

    if (comparison > 0) {
      first = middle + 1;
    } else if (comparison < 0) {
      last = middle - 1;
    } else {
      return middle;
    }
  }
  return -(first + 1);
}
