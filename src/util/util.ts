import { Component } from 'react';

import { VehicleObject } from '../types/vehicle';

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
 * Performs binary search for an element. The index that will be returned will either be:
 *  - index of value provided.
 *  - index where the value would fit in the array, if it were spliced in.
 *      ex: searchIndex([1, 2, 4, 5], 3, (a, b) => a - b) will return index = 2.
 */
export function searchIndex<T>(
  array: T[],
  value: T,
  compareFunction: (a: T, b: T) => number,
): number {
  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const comparison = compareFunction(value, array[middle]);

    if (comparison === 0) {
      return middle;
    }

    if (comparison < 0) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  return left;
}
