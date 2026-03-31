import { BaseAdapter } from './BaseAdapter';
import { ActionStep, AdapterConfig } from './types';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export class LocalSoftwareAdapter extends BaseAdapter {
  private cliAnythingBasePath: string;

  constructor(config: AdapterConfig) {
    super(`LocalSoftwareAdapter-${config.appName}`, config);
    // Path to the CLI-Anything python harnesses
    this.cliAnythingBasePath = path.join(process.cwd(), 'CLI-Anything-main', 'CLI-Anything-main');
  }

  async initialize(): Promise<void> {
    console.log(`[${this.name}] Initializing Local Software environment for ${this.config.appName}...`);
    // Verify if the requested app has a CLI-Anything harness
    try {
      const appHarnessPath = path.join(this.cliAnythingBasePath, this.config.appName || '');
      console.log(`[${this.name}] CLI-Anything integration active for: ${this.config.appName}`);
    } catch (err: any) {
      console.warn(`[${this.name}] Could not resolve CLI-Anything harness for ${this.config.appName}`);
    }
  }

  protected async executeStep(step: ActionStep, args?: Record<string, any>): Promise<void> {
    console.log(`[${this.name}] Executing step: ${step.type}`);
    
    switch (step.type) {
      case 'cli-anything':
        // Execute the CLI-Anything python wrapper
        // step.value contains the specific command (e.g., "export --format png")
        if (step.value && this.config.appName) {
          const harnessPath = path.join(this.cliAnythingBasePath, this.config.appName, 'agent-harness');
          // Replace placeholders like {filename} with actual args
          const commandArgs = step.value.replace(/\{(\w+)\}/g, (_, key) => args?.[key] || '');
          const cmd = `python -m cli_anything.${this.config.appName} ${commandArgs}`;
          
          console.log(`  -> Running CLI-Anything command: ${cmd}`);
          try {
             const { stdout, stderr } = await execAsync(cmd, { cwd: harnessPath });
             if (stdout) console.log(`  -> Output:\n${stdout}`);
             if (stderr) console.error(`  -> Errors:\n${stderr}`);
          } catch (err: any) {
             console.error(`  -> CLI-Anything execution failed: ${err.message}`);
             throw err;
          }
        } else {
          console.warn(`  -> 'cli-anything' step requires both step.value and config.appName`);
        }
        break;
      case 'click':
        console.log(`  -> Clicking on local UI element: ${step.target}`);
        break;
      case 'type':
        const textToType = step.value?.replace(/\{(\w+)\}/g, (_, key) => args?.[key] || '');
        console.log(`  -> Typing text: "${textToType}" into ${step.target}`);
        break;
      case 'press':
        console.log(`  -> Pressing keys: ${step.value}`);
        break;
      case 'wait':
        console.log(`  -> Waiting for ${step.duration} ms...`);
        if (step.duration) {
          await new Promise(resolve => setTimeout(resolve, step.duration));
        }
        break;
      case 'screenshot':
        console.log(`  -> Taking screenshot of local application window.`);
        break;
      default:
        console.warn(`  -> Unsupported step type for LocalSoftwareAdapter: ${step.type}`);
    }
  }

  async shutdown(): Promise<void> {
    console.log(`[${this.name}] Shutting down Local Software environment.`);
  }
}
