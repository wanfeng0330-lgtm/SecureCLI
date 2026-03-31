export interface ParsedInstruction {
  original: string;
  command: string;
  args: string[];
  options: Record<string, string | boolean>;
}

export interface OptimizedInstruction extends ParsedInstruction {
  optimized: boolean;
  reason?: string;
  // Execution time estimation or priority could be added here
}

export interface IOptimizer {
  parse(instruction: string): ParsedInstruction;
  optimize(instruction: string): OptimizedInstruction;
  clearCache(): void;
}
