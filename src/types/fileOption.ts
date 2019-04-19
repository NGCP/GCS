import { Location } from '../static/index';

/**
 * Data contents for information that is loaded from a configuration file.
 */
export interface FileLoadOptions {
  /**
   * Information related to the map.
   */
  map: Location;
}

/**
 * Object structure for information stored into a configuration file.
 */
export interface FileSaveOptions {
  /**
   * Filepath of the configuration file being saved.
   */
  filePath: string;

  /**
   * Data contents. Will be modified by classes through the "loadConfig" notification.
   */
  data: FileLoadOptions;
}
