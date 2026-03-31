import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Play, Loader, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

type LogMessage = {
  id: string;
  type: 'system' | 'pipeline-step' | 'security-alert';
  timestamp: number;
  data: any;
};

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [command, setCommand] = useState('search --query="secure cli"');
  const [sandboxCode, setSandboxCode] = useState('require("fs").readFileSync("/etc/passwd");');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...message }]);
      
      if (message.type === 'pipeline-step') {
        setActiveStep(message.data.step);
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const executeCommand = async () => {
    setLogs([]);
    setActiveStep(null);
    try {
      await fetch('http://localhost:4000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adapterName: 'WebDesktopAdapter-web-demo', instruction: command })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const executeSandbox = async () => {
    setLogs([]);
    setActiveStep(null);
    try {
      await fetch('http://localhost:4000/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sandboxCode })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const steps = [
    { id: 'parse', label: '指令解析' },
    { id: 'optimize', label: 'Agent 优化' },
    { id: 'security', label: '沙箱 / 安全检测' },
    { id: 'execute', label: '适配器执行' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col font-sans">
      <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="text-emerald-400 w-8 h-8" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            SecureCLI 态势感知大屏
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-sm text-slate-400">{connected ? '系统已连接' : '连接中...'}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Controls */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              Agent 指令执行
            </h2>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-slate-400 mb-1">
                输入自然语言或系统指令，例如查询热门内容：
              </div>
              <input 
                type="text" 
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="例如: search --query='AI Agent'"
                className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
              <button 
                onClick={executeCommand}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
              >
                <Play className="w-4 h-4" /> 开始自动执行
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl border-l-4 border-l-red-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded-bl-lg font-bold">防护演示区</div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              沙箱攻击拦截模拟
            </h2>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-slate-400 mb-1">
                模拟大模型被提示词注入后尝试读取系统密码文件：
              </div>
              <textarea 
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                rows={3}
                className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 font-mono text-red-300"
              />
              <button 
                onClick={executeSandbox}
                className="bg-red-900/50 hover:bg-red-800/80 text-red-200 border border-red-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/20"
              >
                <Play className="w-4 h-4" /> 注入恶意代码测试
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Pipeline Visualization */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl flex flex-col">
          <h2 className="text-lg font-semibold mb-8 flex items-center gap-2">
            <Loader className="w-5 h-5 text-cyan-400" />
            全链路执行追踪
          </h2>
          
          <div className="flex-1 flex flex-col justify-center gap-8 relative px-4">
            {/* Connecting line */}
            <div className="absolute left-11 top-10 bottom-10 w-0.5 bg-slate-800 z-0"></div>

            {steps.map((step, idx) => {
              const isActive = activeStep === step.id;
              const isPast = steps.findIndex(s => s.id === activeStep) > idx || activeStep === null;
              
              return (
                <div key={step.id} className="relative z-10 flex items-center gap-6 group">
                  <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-500
                    ${isActive ? 'bg-cyan-900 border-cyan-400 shadow-cyan-500/50 scale-110' : 
                      isPast && logs.length > 0 ? 'bg-emerald-900 border-emerald-500' : 'bg-slate-950 border-slate-700'}
                  `}>
                    {isActive ? <Loader className="w-6 h-6 text-cyan-400 animate-spin" /> :
                     isPast && logs.length > 0 ? <CheckCircle className="w-6 h-6 text-emerald-400" /> :
                     <div className="w-3 h-3 rounded-full bg-slate-600" />}
                  </div>
                  
                  <div className={`
                    flex-1 p-4 rounded-lg border transition-all duration-300
                    ${isActive ? 'bg-cyan-950/30 border-cyan-800' : 'bg-slate-950/50 border-slate-800/50'}
                  `}>
                    <h3 className={`font-medium ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>{step.label}</h3>
                    {isActive && (
                      <p className="text-xs text-slate-500 mt-1 animate-pulse">处理中...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Terminal Logs */}
        <div className="bg-[#0c0c0c] rounded-xl border border-slate-800 shadow-xl flex flex-col overflow-hidden font-mono">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-xs text-slate-500 font-sans">SecureCLI 虚拟终端</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2 text-sm">
            {logs.length === 0 && (
              <div className="text-slate-600 italic">等待执行...</div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 leading-relaxed">
                <span className="text-slate-600 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                
                {log.type === 'system' && log.data && (
                  <span className="text-emerald-400">[{log.data.message || '系统通知'}]</span>
                )}
                
                {log.type === 'pipeline-step' && log.data && (
                  <span className={`${log.data.status === 'blocked' || log.data.status === 'failed' ? 'text-red-400' : 'text-slate-300'}`}>
                    <span className="text-cyan-600 mr-2">❯</span> 
                    [{log.data.step?.toUpperCase()}] {log.data.detail}
                  </span>
                )}

                {log.type === 'security-alert' && log.data && (
                  <span className="text-red-500 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/50 w-full">
                    <span className="font-bold">安全拦截警报:</span> {log.data.message}
                  </span>
                )}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
