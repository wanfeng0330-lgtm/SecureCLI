import { IAdapter, AdapterConfig, CliCommandConfig, ActionStep } from './types';

export abstract class BaseAdapter implements IAdapter {
  public name: string;
  protected config: AdapterConfig;

  constructor(name: string, config: AdapterConfig) {
    this.name = name;
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  
  async executeCommand(commandName: string, args?: Record<string, any>): Promise<any> {
    const commandConfig = this.config.commands[commandName];
    if (!commandConfig) {
      throw new Error(`Command '${commandName}' not found in adapter '${this.name}' configuration.`);
    }

    console.log(`[${this.name}] Executing command: ${commandName}`);
    for (const step of commandConfig.steps) {
      await this.executeStep(step, args);
    }
    
    return { success: true, message: `Command '${commandName}' executed successfully.` };
  }

  protected abstract executeStep(step: ActionStep, args?: Record<string, any>): Promise<void>;

  abstract shutdown(): Promise<void>;
}
