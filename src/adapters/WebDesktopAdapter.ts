import { BaseAdapter } from './BaseAdapter';
import { ActionStep, AdapterConfig } from './types';

export class WebDesktopAdapter extends BaseAdapter {
  private page: any;

  constructor(config: AdapterConfig) {
    super(`WebDesktopAdapter-${config.appName}`, config);
  }

  async initialize(): Promise<void> {
    console.log(`[${this.name}] Initializing Web/Desktop environment using opencli...`);
    try {
      // Dynamically import opencli's Page to control browser/electron apps
      const opencliBrowser = await import('@jackwener/opencli/dist/browser/index.js');
      this.page = new opencliBrowser.Page(this.config.appName || 'securecli-workspace');
      console.log(`[${this.name}] OpenCLI Page instance created successfully.`);
    } catch (err: any) {
      console.error(`[${this.name}] Failed to initialize OpenCLI browser bridge:`, err.message);
      // Fallback or handle error
    }
  }

  protected async executeStep(step: ActionStep, args?: Record<string, any>): Promise<void> {
    console.log(`[${this.name}] Executing step: ${step.type} on selector: ${step.target || 'none'}`);
    
    if (!this.page) {
      console.warn(`[${this.name}] OpenCLI Page is not initialized!`);
      return;
    }

    try {
      switch (step.type) {
        case 'click':
          if (step.target) {
            console.log(`  -> Clicking DOM element: ${step.target}`);
            await this.page.click(step.target);
          }
          break;
        case 'type':
          if (step.target && step.value) {
            const textToType = step.value.replace(/\{(\w+)\}/g, (_, key) => args?.[key] || '');
            console.log(`  -> Typing "${textToType}" into DOM element: ${step.target}`);
            await this.page.typeText(step.target, textToType);
          }
          break;
        case 'press':
          if (step.value) {
            console.log(`  -> Simulating keypress: ${step.value}`);
            await this.page.pressKey(step.value);
          }
          break;
        case 'wait':
          console.log(`  -> Waiting for ${step.duration} ms...`);
          if (step.duration) {
            await new Promise(resolve => setTimeout(resolve, step.duration));
          }
          break;
        case 'evaluate':
          if (step.value) {
            console.log(`  -> Evaluating script in page context: ${step.value}`);
            const result = await this.page.evaluate(step.value);
            console.log(`  -> Evaluate result:`, result);
          }
          break;
        case 'screenshot':
          console.log(`  -> Taking screenshot.`);
          await this.page.screenshot({ path: `screenshot-${Date.now()}.png` });
          break;
        default:
          console.warn(`  -> Unsupported step type for WebDesktopAdapter: ${step.type}`);
      }
    } catch (err: any) {
      console.error(`[${this.name}] Error executing step ${step.type}:`, err.message);
      throw err;
    }
  }

  async shutdown(): Promise<void> {
    console.log(`[${this.name}] Closing browser/electron instances.`);
    // OpenCLI manages connection lifecycle via extensions, but we can clean up our reference
    this.page = null;
  }
}

