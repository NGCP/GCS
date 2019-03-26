// Props for React components.
export interface ThemeProps {
  theme: 'light' | 'dark';
}

// Type guards.
export function isThemeProps({ theme }: { theme: string }): boolean {
  return theme === 'light' || theme === 'dark';
}

// Typings for messages.
export type MessageType = 'success' | 'failure' | 'progress' | '';

export default {
};
