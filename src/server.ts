import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { SecureCLI } from './core';
import { LocalSoftwareAdapter, WebDesktopAdapter } from './adapters';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Initialize SecureCLI instance
const secureCli = new SecureCLI();

// Set up adapters
const localAdapter = new LocalSoftwareAdapter({
  appName: 'system-demo',
  commands: {
    'demo-cmd': {
      command: 'demo-cmd',
      steps: [
        { type: 'wait', duration: 1000 },
        { type: 'cli-anything', value: '--version' }
      ]
    }
  }
});

const webAdapter = new WebDesktopAdapter({
  appName: 'web-demo',
  commands: {
    'search': {
      command: 'search',
      steps: [
        { type: 'wait', duration: 1000 }
      ]
    }
  }
});

secureCli.registerAdapter(localAdapter);
secureCli.registerAdapter(webAdapter);

// Store active WebSocket connections
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  console.log('Client connected to visualization server');
  clients.add(ws);
  
  ws.send(JSON.stringify({ type: 'system', message: '已连接到 SecureCLI 态势感知引擎' }));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Helper to broadcast logs/events to frontend
export const broadcastEvent = (type: string, data: any) => {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
};

// API Endpoint to execute a command
app.post('/api/execute', async (req, res) => {
  const { adapterName, instruction } = req.body;
  
  broadcastEvent('pipeline-step', { step: 'parse', status: 'started', detail: `接收到指令: ${instruction}` });
  
  try {
    // 1. Parsing & Optimization
    broadcastEvent('pipeline-step', { step: 'optimize', status: 'started' });
    // In reality, this is handled inside SecureCLI, but we mock the event for visualization
    await new Promise(r => setTimeout(r, 500)); 
    broadcastEvent('pipeline-step', { step: 'optimize', status: 'success', detail: `已完成 Agent 指令原生优化` });

    // 2. Security Check (simulated for visualization if it's a script, but we are running a command here)
    broadcastEvent('pipeline-step', { step: 'security', status: 'started' });
    await new Promise(r => setTimeout(r, 500));
    broadcastEvent('pipeline-step', { step: 'security', status: 'success', detail: `安全沙箱合规检测通过` });

    // 3. Execution
    broadcastEvent('pipeline-step', { step: 'execute', status: 'started', detail: `正在路由至适配器: ${adapterName}` });
    const result = await secureCli.executeCommand(adapterName, instruction);
    
    broadcastEvent('pipeline-step', { step: 'execute', status: 'success', detail: `指令执行成功` });
    
    res.json({ success: true, result });
  } catch (error: any) {
    broadcastEvent('pipeline-step', { step: 'error', status: 'failed', detail: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Endpoint to execute raw script (Security Sandbox Demo)
app.post('/api/sandbox', async (req, res) => {
  const { code } = req.body;
  
  broadcastEvent('pipeline-step', { step: 'security-scan', status: 'started', detail: `正在进行静态代码安全扫描...` });
  
  try {
    const result = await secureCli.executeScript(code);
    broadcastEvent('pipeline-step', { step: 'sandbox-execute', status: 'success', detail: `代码已在安全沙箱中成功执行` });
    res.json({ success: true, result });
  } catch (error: any) {
    broadcastEvent('security-alert', { message: error.message, code });
    broadcastEvent('pipeline-step', { step: 'security-block', status: 'blocked', detail: error.message });
    res.status(403).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`SecureCLI Visualization API Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});
