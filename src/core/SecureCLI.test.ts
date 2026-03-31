import { SecureCLI } from './SecureCLI';
import { LocalSoftwareAdapter } from '../adapters/LocalSoftwareAdapter';
import { ActionStep } from '../adapters/types';

describe('SecureCLI System-level End-to-End Tests', () => {
  let secureCli: SecureCLI;
  let mockAdapter: LocalSoftwareAdapter;
  let executeStepSpy: jest.SpyInstance;

  beforeEach(async () => {
    secureCli = new SecureCLI();

    // Create a mock adapter with some commands
    mockAdapter = new LocalSoftwareAdapter({
      appName: 'TestApp',
      commands: {
        login: {
          command: 'login',
          steps: [
            { type: 'type', target: '#username', value: '{user}' },
            { type: 'type', target: '#password', value: '{pass}' },
            { type: 'click', target: '#login-btn' },
          ]
        },
        search: {
          command: 'search',
          steps: [
            { type: 'type', target: '#search-box', value: '{query}' },
            { type: 'press', value: 'Enter' }
          ]
        }
      }
    });

    // Mock executeStep to verify execution
    executeStepSpy = jest.spyOn(mockAdapter as any, 'executeStep').mockResolvedValue(undefined);
    
    secureCli.registerAdapter(mockAdapter);
    await secureCli.initialize();
  });

  afterEach(async () => {
    await secureCli.shutdown();
    jest.restoreAllMocks();
  });

  it('should initialize and shutdown correctly', async () => {
    const initSpy = jest.spyOn(mockAdapter, 'initialize');
    const shutdownSpy = jest.spyOn(mockAdapter, 'shutdown');

    await secureCli.initialize();
    expect(initSpy).toHaveBeenCalled();

    await secureCli.shutdown();
    expect(shutdownSpy).toHaveBeenCalled();
  });

  it('should optimize and execute a CLI command via adapter', async () => {
    // We execute an instruction: search --query="test data"
    const result = await secureCli.executeCommand(mockAdapter.name, 'search --query="test data"');
    
    expect(result.success).toBe(true);
    expect(executeStepSpy).toHaveBeenCalledTimes(2); // type and press
    
    // Check that args were passed correctly
    const firstCallArgs = executeStepSpy.mock.calls[0];
    expect(firstCallArgs[0].type).toBe('type');
    expect(firstCallArgs[1].query).toBe('"test data"');
  });

  it('should optimize git command to be agent-friendly before passing to adapter', async () => {
    // We register an adapter that handles 'git' just for testing
    const gitAdapter = new LocalSoftwareAdapter({
      appName: 'GitApp',
      commands: {
        git: {
          command: 'git',
          steps: [
            { type: 'evaluate', value: 'git-execution' }
          ]
        }
      }
    });
    secureCli.registerAdapter(gitAdapter);
    const gitExecuteSpy = jest.spyOn(gitAdapter as any, 'executeStep').mockResolvedValue(undefined);
    
    // Original instruction without safe flags
    await secureCli.executeCommand(gitAdapter.name, 'git log');
    
    // The optimizer should add --no-pager and limit lines for git log
    const args = gitExecuteSpy.mock.calls[0][1] as any;
    expect(args['no-pager']).toBe(true);
    expect(args['n']).toBe('20');
    expect(args['oneline']).toBe(true);
  });

  it('should execute an end-to-end script via Security Sandbox with adapter access', async () => {
    // The script invokes the registered adapter command
    const script = `
      // Using the injected invokeCommand function
      const promise = invokeCommand('${mockAdapter.name}', 'login --user=admin --pass=secret');
      promise; // return promise to be awaited
    `;
    
    const result = await secureCli.executeScript(script);
    
    expect(result.success).toBe(true);
    expect(executeStepSpy).toHaveBeenCalledTimes(3); // 2 types, 1 click
    
    const firstCallArgs = executeStepSpy.mock.calls[0];
    expect(firstCallArgs[0].type).toBe('type');
    expect(firstCallArgs[1].user).toBe('admin');
    
    const secondCallArgs = executeStepSpy.mock.calls[1];
    expect(secondCallArgs[0].type).toBe('type');
    expect(secondCallArgs[1].pass).toBe('secret');
  });

  it('should block malicious script execution in sandbox', async () => {
    const maliciousScript = `
      const fs = require('fs');
      fs.readFileSync('/etc/passwd');
    `;
    
    await expect(secureCli.executeScript(maliciousScript)).rejects.toThrow(/blocked: Malicious code/i);
  });
});
