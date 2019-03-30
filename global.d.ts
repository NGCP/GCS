// Allows us to import PNG files.
declare module '*.png' {
  const value: string;
  export = value;
}

// Allows us to use react-leaflet-control
declare module 'react-leaflet-control';
