import { SecureCLI } from './core';
import { LocalSoftwareAdapter, WebDesktopAdapter } from './adapters';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log("==========================================");
    console.log("🛡️  SecureCLI - AI Agent Native Runtime");
    console.log("==========================================");
    console.log("Usage: securecli <target_type> <app_name> <instruction>");
    console.log("  <target_type> : 'web' or 'local'");
    console.log("  <app_name>    : The name of the target application (e.g., 'bilibili', 'photoshop')");
    console.log("  <instruction> : The natural language or command for the Agent to execute");
    console.log("\nExample:");
    console.log("  securecli web demo-site search --query='AI Agent'");
    console.log("  securecli local gimp --export image.png");
    process.exit(1);
  }

  const [targetType, appName, ...instructionParts] = args;
  const instruction = instructionParts.join(' ');

  const secureCli = new SecureCLI();
  let adapterName = '';

  try {
    if (targetType === 'web') {
      const adapter = new WebDesktopAdapter({ appName, commands: {} });
      secureCli.registerAdapter(adapter);
      adapterName = `WebDesktopAdapter-${appName}`;
    } else if (targetType === 'local') {
      const adapter = new LocalSoftwareAdapter({ appName, commands: {} });
      secureCli.registerAdapter(adapter);
      adapterName = `LocalSoftwareAdapter-${appName}`;
    } else {
      throw new Error(`Unknown target_type: ${targetType}. Must be 'web' or 'local'.`);
    }

    console.log(`[SecureCLI] Analyzing & Optimizing Agent Instruction: "${instruction}"...`);
    // Note: SecureCLI core handles the Sandbox checking and Optimization internally
    const result = await secureCli.executeCommand(adapterName, instruction);
    
    console.log(`\n[SecureCLI] ✅ Execution Completed Successfully.`);
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error: any) {
    console.error(`\n[SecureCLI] ❌ Execution Blocked or Failed:`);
    console.error(error.message);
    process.exit(1);
  }
}

main();