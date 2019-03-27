// Typings for props for React components.
export interface ThemeProps {
  theme: 'light' | 'dark';
}

// Type guard for ThemeProps.
export function isThemeProps(props: { theme: string }): boolean {
  return props.theme === 'light' || props.theme === 'dark';
}

// Typings for messages.
export type MessageType = '' | 'success' | 'failure' | 'progress';

// Type guard for MessageType.
export function isMessageType(type: string): boolean {
  return type === '' || type === 'success' || type === 'failure' || type === 'progress';
}

// Typings for vehicles.
export type VehicleStatus = 'ready' | 'error' | 'disconnected' | 'waiting' | 'running' | 'paused';

// Type guard for VehicleStatus.
export function isVehicleStatus(status: string): boolean {
  return status === 'ready' || status === 'error' || status === 'disconnected' || status === 'waiting' || status === 'running' || status === 'paused';
}

// Vehicle objects being stored. Probably will move to Orchestrator classes.
export interface Vehicle {
  sid: number;
  lat: number;
  lng: number;
  alt?: number;
  heading?: number;
  battery?: number;
  status: VehicleStatus;
  errorMessage?: string;
}

// Vehicle objects being stored in React components.
export interface VehicleUI {
  sid: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  alt?: number;
  heading?: number;
  battery?: number;
  status: {
    type: MessageType;
    message: string;
  };
  errorMessage?: string;
}

export interface LatLngZoom {
  lat: number;
  lng: number;
  zoom?: number;
}

// Types for save/load configs.
export interface FileSaveOptions {
  filePath: string;
  data: {};
}

export interface FileLoadOptions {
  map: LatLngZoom;
}

// Signatures that are being used in more than one file, makes more sense to have it here to import.
export interface LocationSignature {
  [key: string]: { lat: number; lng: number; zoom: number };
}

export interface VehicleInfoSignature {
  [key: string]: {
    macAddress: string;
    name: string;
    type: string;
  };
}

export interface VehicleStatusSignature {
  [key: string]: {
    type: string;
    message: string;
  };
}
