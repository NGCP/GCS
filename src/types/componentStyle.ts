import { Moment } from 'moment';

/**
 * Props with theme as its child. Feel free to extend this prop.
 */
export interface ThemeProps {
  /**
   * "Light" for light theme, "dark" for dark theme.
   */
  theme: 'light' | 'dark';
}

/**
 * Type guard for ThemeProps.
 */
export function isThemeProps(props: { theme: string }): boolean {
  return props.theme === 'light' || props.theme === 'dark';
}

/**
 * Types for all messages. Consists of "success", "failure", "progress", or "".
 */
export type MessageType = '' | 'success' | 'failure' | 'progress';

/**
 * Type guard for MessageType.
 */
export function isMessageType(type: string): boolean {
  return type === '' || type === 'success' || type === 'failure' || type === 'progress';
}

/**
 * Structure for a message displayed in log container.
 */
export interface LogMessage {
  /**
   * The type of the message. Defines the color the message will be printed in.
   */
  type?: MessageType;

  /**
   * The content of the message.
   */
  message: string;

  /**
   * The time was received and logged.
   */
  time?: Moment;
}
