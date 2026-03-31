import { ParsedInstruction, OptimizedInstruction, IOptimizer } from './types';

/**
 * AgentOptimizer specifically designed for AI Agent execution flows.
 * It parses raw CLI instructions, optimizes them for machine reading
 * (e.g., adding line numbers, disabling colors, shortening logs), and caches the results
 * to improve execution efficiency.
 */
export class AgentOptimizer implements IOptimizer {
  private cache: Map<string, OptimizedInstruction>;

  constructor() {
    this.cache = new Map<string, OptimizedInstruction>();
  }

  /**
   * Parses a raw CLI instruction into its command, arguments, and options.
   */
  public parse(instruction: string): ParsedInstruction {
    // Basic regex to tokenize keeping quotes intact
    const tokens = instruction.trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    
    if (tokens.length === 0) {
      return { original: instruction, command: '', args: [], options: {} };
    }

    const command = tokens[0] as string;
    const args: string[] = [];
    const options: Record<string, string | boolean> = {};

    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.startsWith('--')) {
        const parts = token.slice(2).split('=');
        options[parts[0]] = parts.length > 1 ? parts.slice(1).join('=') : true;
      } else if (token.startsWith('-')) {
        // Handle short flags like -la
        const flags = token.slice(1).split('');
        for (const flag of flags) {
          options[flag] = true;
        }
      } else {
        args.push(token);
      }
    }

    return {
      original: instruction,
      command,
      args,
      options
    };
  }

  /**
   * Optimizes the instruction for an AI Agent execution flow.
   * Modifies flags to ensure deterministic, machine-readable output.
   */
  public optimize(instruction: string): OptimizedInstruction {
    const trimmed = instruction.trim();
    if (!trimmed) {
      return {
        original: instruction,
        command: '',
        args: [],
        options: {},
        optimized: false
      };
    }

    if (this.cache.has(trimmed)) {
      return this.cache.get(trimmed)!;
    }

    const parsed = this.parse(trimmed);
    const optimizedOpts = { ...parsed.options };
    const optimizedArgs = [...parsed.args];
    const reasons: string[] = [];
    let isOptimized = false;

    // Command-specific optimizations for AI Agents

    switch (parsed.command) {
      case 'git':
        // Prevent git from using a pager (less), which blocks the agent
        if (!optimizedOpts['no-pager']) {
          optimizedOpts['no-pager'] = true;
          isOptimized = true;
          reasons.push('Added --no-pager to prevent blocking');
        }
        // Limit git log output length
        if (optimizedArgs.includes('log') && !optimizedOpts['n'] && !optimizedOpts['max-count']) {
          optimizedOpts['n'] = '20';
          optimizedOpts['oneline'] = true;
          isOptimized = true;
          reasons.push('Limited git log to 20 oneline commits');
        }
        break;

      case 'ls':
        // AI agents read lists better without formatting quirks, and they often need hidden files
        if (!optimizedOpts['a'] && !optimizedOpts['all'] && !optimizedOpts['A']) {
          optimizedOpts['a'] = true;
          isOptimized = true;
          reasons.push('Added -a to show hidden files');
        }
        // Remove color to prevent ANSI escape code parsing issues
        if (optimizedOpts['color'] !== 'never') {
          optimizedOpts['color'] = 'never';
          isOptimized = true;
          reasons.push('Disabled color output');
        }
        break;

      case 'grep':
        // Agents need line numbers to know where to edit
        if (!optimizedOpts['n'] && !optimizedOpts['line-number']) {
          optimizedOpts['n'] = true;
          isOptimized = true;
          reasons.push('Added -n to show line numbers');
        }
        // Exclude colors
        if (optimizedOpts['color'] !== 'never') {
          optimizedOpts['color'] = 'never';
          isOptimized = true;
          reasons.push('Disabled color output');
        }
        break;

      case 'cat':
        // Show line numbers for better context mapping
        if (!optimizedOpts['n'] && !optimizedOpts['number']) {
          optimizedOpts['n'] = true;
          isOptimized = true;
          reasons.push('Added -n to show line numbers for easier editing');
        }
        break;

      case 'npm':
      case 'yarn':
      case 'pnpm':
        // Silence warnings/fund messages that add noise
        if (optimizedArgs.includes('install') || optimizedArgs.includes('i') || optimizedArgs.includes('add')) {
          if (!optimizedOpts['no-fund']) {
            optimizedOpts['no-fund'] = true;
            isOptimized = true;
          }
          if (!optimizedOpts['no-audit']) {
            optimizedOpts['no-audit'] = true;
            isOptimized = true;
          }
          reasons.push('Disabled audit/fund logs for cleaner output');
        }
        break;

      case 'aws':
        // Prefer JSON output for easier machine parsing
        if (!optimizedOpts['output']) {
          optimizedOpts['output'] = 'json';
          isOptimized = true;
          reasons.push('Set AWS output format to json');
        }
        break;

      case 'python':
      case 'python3':
      case 'node':
        // Usually we don't change script execution, but could disable warnings
        break;
    }

    const result: OptimizedInstruction = {
      ...parsed,
      options: optimizedOpts,
      args: optimizedArgs,
      optimized: isOptimized,
      reason: isOptimized ? reasons.join('. ') : undefined
    };

    this.cache.set(trimmed, result);
    return result;
  }

  /**
   * Clears the optimization cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reconstructs the optimized instruction into a runnable command string.
   */
  public reconstruct(optimized: OptimizedInstruction): string {
    let result = optimized.command;

    // Handle global flags like git --no-pager
    // In git, --no-pager goes before the subcommand
    let preArgsOptions = '';
    let postArgsOptions = '';

    for (const [key, value] of Object.entries(optimized.options)) {
      if (value === false) continue; // Skip explicit false flags unless they are like --no-xyz

      let formattedFlag = '';
      if (key.length === 1) {
        formattedFlag = value === true ? ` -${key}` : ` -${key} ${value}`;
      } else {
        formattedFlag = value === true ? ` --${key}` : ` --${key}=${value}`;
      }

      // Hack for git global options
      if (optimized.command === 'git' && key === 'no-pager') {
        preArgsOptions += formattedFlag;
      } else {
        postArgsOptions += formattedFlag;
      }
    }

    if (preArgsOptions) {
      result += preArgsOptions;
    }

    // Add arguments
    if (optimized.args.length > 0) {
      result += ' ' + optimized.args.join(' ');
    }

    if (postArgsOptions) {
      result += postArgsOptions;
    }

    return result.trim();
  }
}
