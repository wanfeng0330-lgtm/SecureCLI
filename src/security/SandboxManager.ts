import * as vm from 'vm';
import { SecurityAnalyzer } from './SecurityAnalyzer';

export interface SandboxOptions {
  timeout?: number;
}

export class SandboxManager {
  private analyzer: SecurityAnalyzer;

  constructor() {
    this.analyzer = new SecurityAnalyzer();
  }

  /**
   * Execute code in an isolated sandbox environment
   * @param code The code to execute
   * @param context Variables to expose to the sandbox
   * @param options Sandbox execution options
   * @returns The result of the execution
   */
  public execute(code: string, context: Record<string, any> = {}, options: SandboxOptions = {}): any {
    // 1. Pre-execution analysis
    if (!this.analyzer.analyzePreExecution(code)) {
      throw new Error("Execution blocked: Malicious code detected by SecurityAnalyzer.");
    }

    // 2. Setup isolated context with in-execution monitoring
    const monitoredContext = this.analyzer.monitorExecution(context);
    
    // Create a VM context
    // vm.createContext modifies the context object by adding sandbox-related properties
    const sandboxContext = vm.createContext(monitoredContext);

    // 3. Execute code in the sandbox
    try {
      const script = new vm.Script(code);
      const result = script.runInContext(sandboxContext, {
        timeout: options.timeout || 5000, // Default 5s timeout
        displayErrors: true,
      });
      return result;
    } catch (error: any) {
      console.error(`[SandboxManager] Execution error: ${error.message}`);
      throw error;
    }
  }
}
