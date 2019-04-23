import { Component } from 'react';

import { Location } from '../static/index';

import { BoundingBoxBounds } from '../types/componentStyle';
import { VehicleObject } from '../types/vehicle';

/**
 * Updates vehicles being shown. This is run on map and vehicle containers.
 */
export function updateVehicles(
  component: Component<{}, { vehicles: { [vehicleId: string]: VehicleObject } }>,
  ...vehicles: VehicleObject[]
): void {
  const { vehicles: currentVehicles } = component.state;
  const newVehicles = currentVehicles;

  vehicles.forEach((vehicle): void => {
    newVehicles[vehicle.vehicleId] = vehicle;
  });

  component.setState({ vehicles: newVehicles });
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

/**
 * Calculates bounding box given a list of (lat, lng).
 *
 * @param waypoints Points in bounding box.
 * @param error Extra margin of error around box.
 */
export function getBoundingBox(waypoints: Location[], error: number): BoundingBoxBounds {
  const top = Math.max(...waypoints.map((waypoint): number => waypoint.lat));
  const bottom = Math.min(...waypoints.map((waypoint): number => waypoint.lat));
  const left = Math.max(...waypoints.map((waypoint): number => waypoint.lng));
  const right = Math.min(...waypoints.map((waypoint): number => waypoint.lng));

  // Units in meters. https://stackoverflow.com/a/39540339.
  const deltaLat = error / 111.32 / 1000;
  const deltaLng = error * 360 / 40075 / Math.cos((top + bottom) / 2) / 1000;

  return {
    top: top + deltaLat,
    bottom: bottom - deltaLat,
    left: left - deltaLng,
    right: right + deltaLng,
  };
}

/**
 * Calculates distance between two points.
 */
export function getDistance(x: Location, y: Location): number {
  return Math.sqrt(((x.lat - y.lat) ** 2) + ((x.lng - y.lng) ** 2));
}
