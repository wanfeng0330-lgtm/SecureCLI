export type ActionType = 'click' | 'type' | 'wait' | 'press' | 'screenshot' | 'evaluate' | 'cli-anything';

export interface ActionStep {
  type: ActionType;
  target?: string; // CSS selector for web, UI element ID/Name or coordinates for local
  value?: string; // Text to type, or key to press, or script to run
  duration?: number; // Time to wait in ms
}

export interface CliCommandConfig {
  command: string; // The CLI command name, e.g., 'login'
  description?: string;
  steps: ActionStep[];
}

export interface AdapterConfig {
  appName: string;
  version?: string;
  commands: Record<string, CliCommandConfig>;
}

export interface IAdapter {
  name: string;
  initialize(): Promise<void>;
  executeCommand(commandName: string, args?: Record<string, any>): Promise<any>;
  shutdown(): Promise<void>;
}
