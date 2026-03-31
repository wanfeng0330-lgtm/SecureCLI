import { SandboxManager } from './src/security/SandboxManager';

const sandbox = new SandboxManager();

console.log("=== Testing Safe Code ===");
try {
  const result = sandbox.execute("const a = 1; const b = 2; a + b;");
  console.log("Safe code result:", result);
} catch (e) {
  console.error("Safe code failed:", e);
}

console.log("\n=== Testing Pre-Execution Detection ===");
try {
  sandbox.execute("require('child_process').execSync('ls');");
} catch (e: any) {
  console.error("Caught expected error:", e.message);
}

console.log("\n=== Testing In-Execution Monitoring ===");
try {
  // Use bracket notation to bypass pre-execution 'process.' detection
  sandbox.execute("myContext['process'].exit(1);", { myContext: { process: { exit: () => {} } } });
} catch (e: any) {
  console.error("Caught expected error:", e.message);
}
