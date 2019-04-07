import { Component } from 'react';

import { VehicleObject } from '../types/types';

/**
 * Updates vehicles being shown. This is run on map and vehicle containers.
 */
export function updateVehicles(
  component: Component<{}, { vehicles: { [key: string]: VehicleObject } }>,
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
 * Checks if the string is a JSON. Should be called before isMessage().
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

/* eslint-disable no-bitwise */

/**
 * Converts a float number to a hex string.
 */
function toHexString(float: number): string {
  const getHex = (index: number): string => `00${index.toString(16)}`.slice(-2);

  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, float);
  return [0, 0, 0, 0].map((_, index): string => getHex(view.getUint8(index))).join('');
}

/**
 * Converts a hex string to a float number.
 */
function toFloat(hexString: string): number {
  const int = parseInt(hexString, 16);
  if (int > 0 || int < 0) {
    const sign = (int >>> 31) ? -1 : 1;
    let exp = ((int >>> 23) & 0xff) - 127;
    const mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
    let float = 0;

    for (let i = 0; i < mantissa.length; i += 1, exp -= 1) {
      if (parseInt(mantissa[i], 10)) {
        float += 2 ** exp;
      }
    }

    return float * sign;
  }

  return 0;
}

/* eslint-enable no-bitwise */

export default {
  isJSON,
  toFloat,
  toHexString,
  updateVehicles,
};
