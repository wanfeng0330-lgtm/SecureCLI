<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
  <h1>🛡️ SecureCLI</h1>
  <p><strong>面向 AI Agent 的全场景安全 CLI 原生执行平台</strong></p>
  <p>整合 <a href="https://github.com/jackwener/opencli">OpenCLI</a> 与 <a href="https://github.com/HKUDS/CLI-Anything">CLI-Anything</a> 核心技术，实现本地软件、Web 服务、桌面应用的全场景零代码 CLI 化。</p>
</div>

---

## 🌟 核心亮点 (Highlights)

- 🔒 **全链路安全防护 (Account-safe & Sandboxed)**：事前静态分析，事中 Node.js 内核级沙箱拦截，确保 Agent 不会越权访问系统文件或执行危险命令。
- 🌐 **Web/桌面应用一键 CLI 化 (Web & Electron CLI)**：基于 OpenCLI 双引擎架构，无缝复用 Chrome 登录态，无需破解验证码，零成本接入各类网站和系统。
- 🖥️ **本地软件原生控制 (Local Tool Hub)**：集成 CLI-Anything 技术，将复杂的专业软件（如 Photoshop、OA系统等）降维转化为可编程的 CLI 命令。
- 🤖 **Agent 原生优化 (AI-Native)**：专为大模型设计，自动去除冗余日志，输出结构化数据，极大提升 AI Agent 调用的成功率和效率。
- 📊 **可视化态势感知大屏 (Visual Dashboard)**：提供直观的执行流水线与安全拦截展示，小白用户也能轻松掌控 AI 自动化流程。

---

## 🚀 快速开始 (Quick Start)

### 前置要求 (Prerequisites)
- **Node.js**: >= 18.0.0
- **Python**: >= 3.10 (如果需要使用 CLI-Anything 的本地软件适配)
- 推荐使用 Windows/macOS/Linux 主流系统

### 1. 安装与部署

#### 方法一：克隆源码本地运行（推荐给开发者）
```bash
# 1. 克隆仓库
git clone https://github.com/wanfeng0330-lgtm/SecureCLI.git
cd SecureCLI

# 2. 安装后端依赖
npm install

# 3. 安装前端大屏依赖
cd dashboard && npm install && cd ..
```

### 2. 启动平台

我们提供了一键启动的体验。你需要开启两个终端窗口：

**窗口一：启动 SecureCLI 安全调度引擎（后端）**
```bash
npm run start:server
# 默认运行在 http://localhost:4000
```

**窗口二：启动可视化态势感知大屏（前端）**
```bash
cd dashboard
npm run dev
# 默认运行在 http://localhost:5173
```

打开浏览器访问 `http://localhost:5173`，你将看到充满科技感的控制台大屏！

---

## 🎮 怎么使用？(Usage for Everyone)

### 场景 1：小白用户一键运行命令
1. 打开 `http://localhost:5173`。
2. 在左侧的 **“Agent 指令执行”** 框中，输入你想执行的命令（例如：`search --query="AI Agent"`）。
3. 点击 **“通过适配器运行”**。
4. 你可以在中间的**全链路执行追踪**中看到指令是如何被解析、优化、并安全通过沙箱的。右侧的终端会实时打印结果！

### 场景 2：安全拦截演示（模拟黑客攻击）
担心 AI Agent 被恶意提示词注入而破坏你的电脑？
1. 在左下角的 **“沙箱攻击模拟”** 框中，输入恶意代码：
   ```javascript
   require("fs").readFileSync("/etc/passwd");
   ```
2. 点击 **“注入恶意代码”**。
3. 平台会瞬间亮起红灯，并在右侧终端提示 **SECURITY ALERT (安全拦截警报)**，成功阻止恶意操作。

---

## 🛠️ 进阶：如何把一个新网站变成 CLI？

基于 OpenCLI 的架构，你不需要写复杂的爬虫代码。只需要在 `src/adapters/` 中添加一个简单的配置（YAML/JSON 格式即可）：

```json
// 示例：将公司内部 OA 系统的“待办任务”转为命令
{
  "appName": "company-oa",
  "commands": {
    "todo": {
      "steps": [
        { "type": "navigate", "value": "http://oa.company.com" },
        { "type": "evaluate", "value": "return fetch('/api/tasks').then(r => r.json())" }
      ]
    }
  }
}
```
**原理**：系统会自动拉起浏览器，**复用你已经登录的账号状态**，直接抓取数据并返回给 Agent！

---

## 🤝 参与贡献 (Contributing)
如果你对将世界上的所有软件“Agent 化”感兴趣，欢迎提交 Pull Request！
1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 开源协议
本项目基于 [MIT License](LICENSE) 开源。
