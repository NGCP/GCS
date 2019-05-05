import { JobType } from '../static/index';

/**
 * Status of the vehicle, lets us know of where the vehicle is in its mission.
 */
export type VehicleStatus = 'ready' | 'error' | 'disconnected' | 'waiting' | 'running' | 'paused';

export function isVehicleStatus(status: string): boolean {
  return status === 'ready' || status === 'error' || status === 'disconnected' || status === 'waiting' || status === 'running' || status === 'paused';
}

/**
 * Vehicle object for all classes to use. This is necessary because Vehicle class will
 * be uncasted when being sent through ipcRenderer.
 */
export interface VehicleObject {
  /**
   * ID of the vehicle.
   */
  vehicleId: number;

  /**
   * Current status of the vehicle.
   */
  status: VehicleStatus;

  /**
   * Jobs of the vehicle.
   */
  jobs: JobType[];

  /**
   * Current latitude of the vehicle. Starts at 0.
   */
  lat: number;

  /**
   * Current longitude of the vehicle. Starts at 0.
   */
  lng: number;

  /**
   * Current altitude of the vehicle.
   */
  alt?: number;
  /**
   *
   * Current battery of the vehicle, expressed as a decimal. Will vary from 0 to 1.
   */
  battery?: number;

  /**
   * Current vehicle heading. Value is in degrees.
   */
  heading?: number;
}
