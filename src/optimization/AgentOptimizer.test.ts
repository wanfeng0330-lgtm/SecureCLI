import test from 'node:test';
import assert from 'node:assert';
import { AgentOptimizer } from './AgentOptimizer';

test('AgentOptimizer', async (t) => {
  const optimizer = new AgentOptimizer();

  await t.test('parse() should correctly extract command, args, and options', () => {
    const instruction = 'git log -n 10 --oneline';
    const parsed = optimizer.parse(instruction);

    assert.strictEqual(parsed.command, 'git');
    assert.deepStrictEqual(parsed.args, ['log', '10']);
    assert.deepStrictEqual(parsed.options, {
      n: true,
      oneline: true
    });
  });

  await t.test('parse() should handle quotes correctly', () => {
    const instruction = 'grep "error message" file.txt --color=never';
    const parsed = optimizer.parse(instruction);

    assert.strictEqual(parsed.command, 'grep');
    assert.deepStrictEqual(parsed.args, ['"error message"', 'file.txt']);
    assert.deepStrictEqual(parsed.options, {
      color: 'never'
    });
  });

  await t.test('optimize() should add --no-pager to git commands', () => {
    const instruction = 'git diff';
    const optimized = optimizer.optimize(instruction);

    assert.strictEqual(optimized.optimized, true);
    assert.strictEqual(optimized.options['no-pager'], true);
    
    const reconstructed = optimizer.reconstruct(optimized);
    assert.strictEqual(reconstructed, 'git --no-pager diff');
  });

  await t.test('optimize() should add -n and --oneline to git log', () => {
    const instruction = 'git log';
    const optimized = optimizer.optimize(instruction);

    assert.strictEqual(optimized.optimized, true);
    assert.strictEqual(optimized.options['no-pager'], true);
    assert.strictEqual(optimized.options['n'], '20');
    assert.strictEqual(optimized.options['oneline'], true);

    const reconstructed = optimizer.reconstruct(optimized);
    // order of options might vary based on Object.entries
    assert.match(reconstructed, /git --no-pager log/);
    assert.match(reconstructed, /-n 20/);
    assert.match(reconstructed, /--oneline/);
  });

  await t.test('optimize() should optimize ls command', () => {
    const instruction = 'ls -l src';
    const optimized = optimizer.optimize(instruction);

    assert.strictEqual(optimized.optimized, true);
    assert.strictEqual(optimized.options['a'], true);
    assert.strictEqual(optimized.options['color'], 'never');
    
    const reconstructed = optimizer.reconstruct(optimized);
    assert.match(reconstructed, /ls src/);
    assert.match(reconstructed, /-l/);
    assert.match(reconstructed, /-a/);
    assert.match(reconstructed, /--color=never/);
  });

  await t.test('optimize() should optimize npm install', () => {
    const instruction = 'npm install react';
    const optimized = optimizer.optimize(instruction);

    assert.strictEqual(optimized.optimized, true);
    assert.strictEqual(optimized.options['no-fund'], true);
    assert.strictEqual(optimized.options['no-audit'], true);

    const reconstructed = optimizer.reconstruct(optimized);
    assert.match(reconstructed, /npm install react/);
    assert.match(reconstructed, /--no-fund/);
    assert.match(reconstructed, /--no-audit/);
  });

  await t.test('optimize() should cache results', () => {
    const instruction = 'grep error app.log';
    const optimized1 = optimizer.optimize(instruction);
    const optimized2 = optimizer.optimize(instruction);

    assert.strictEqual(optimized1, optimized2); // Should return the exact same object from cache
  });

  await t.test('clearCache() should empty the cache', () => {
    const instruction = 'grep error app.log';
    const optimized1 = optimizer.optimize(instruction);
    
    optimizer.clearCache();
    
    const optimized2 = optimizer.optimize(instruction);
    assert.notStrictEqual(optimized1, optimized2); // Should be a new object
  });
});
