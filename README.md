<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
  <h1>🛡️ SecureCLI: The AI Agent-Native Runtime</h1>
  <p><strong>国内首个专为 AI Agent（智能体）打造的全场景安全原生执行底座</strong></p>
  <p>整合 <a href="https://github.com/jackwener/opencli">OpenCLI</a> 与 <a href="https://github.com/HKUDS/CLI-Anything">CLI-Anything</a> 核心技术，赋予 LLM (如 Claude, OpenClaw, Cursor) 安全操作本地软件、Web 服务、桌面应用的“手脚”。</p>
</div>

---

## 🌟 核心价值：为什么 AI Agent 需要 SecureCLI？

目前，当 AI Agent 尝试执行现实世界任务时，面临三大痛点：**能力受限（无法操作 GUI）、开发成本高（需手写爬虫）、风险不可控（恶意代码注入）**。

SecureCLI 专为解决这些问题而生：
- 🔒 **内核级安全沙箱**：内置事前扫描与事中 Node.js Proxy 拦截机制。即使 Agent 产生幻觉或被提示词注入（Prompt Injection）企图执行 `rm -rf` 等危险操作，也会被瞬间阻断，保障宿主机绝对安全。
- 🤖 **纯正的 Agent-Native 接口**：输出确定性的、结构化的 JSON 结果，自动去除对 LLM 无用的长篇日志和色彩代码，极大降低 Token 消耗并提升 Agent 执行成功率。
- 🌐 **Web/桌面应用免登录接管**：Agent 无需处理复杂的风控和验证码，SecureCLI 可直接复用用户本机的 Chrome 登录态接管目标网站。
- 🖥️ **本地专业软件赋能**：将 GIMP、LibreOffice、Photoshop 等重度 GUI 软件降维转化为标准的 CLI 指令，让 Agent 拥有操作专业工具的能力。

---

## 🚀 部署指南：如何为你的 AI Agent 装备 SecureCLI？

如果你是一名开发者或正在构建自己的 Agent 系统，只需几步即可为你的 Agent 接入 SecureCLI：

### 1. 全局安装
请在宿主机（你希望 Agent 运行的机器）上执行：
```bash
# 克隆并全局链接本项目
git clone https://github.com/wanfeng0330-lgtm/SecureCLI.git
cd SecureCLI
npm install
npm run build
npm link
```
安装完成后，终端将提供全局命令 `securecli`。

### 2. 授权 Agent 认知本工具 (极度重要)
为了让你的 AI Agent（如 Claude Code, OpenClaw）知道如何使用本工具，你**必须**将本项目的系统指令提供给它。
*   将根目录下的 [`AGENT.md`](./AGENT.md) 内容复制并追加到你的 Agent 系统提示词（System Prompt）中。
*   或者在你的项目目录中创建一个 `.cursorrules` 文件，指向该文档。

### 3. Agent 调用示例
当 Agent 认知了该工具后，它会在需要时自动在终端执行如下命令：

```bash
# Agent 想要查询某个网站的数据（复用宿主机登录态）
securecli web zhihu hot --limit 5

# Agent 想要操作本地的图像处理软件
securecli local gimp --export image.png --apply blur
```

---

## 📊 开发者/评委观测大屏 (态势感知)

虽然 SecureCLI 是在后台默默为 AI Agent 服务的，但为了方便**人类开发者调试**或在**比赛答辩中向评委展示安全拦截效果**，我们附带了一个可视化大屏。

**启动大屏：**
```bash
# 终端 1：启动安全调度服务
npm run start:server

# 终端 2：启动前端可视化大屏
cd dashboard && npm run dev
```
打开 `http://localhost:5173`，您可以直观地看到 Agent 发出的每一条指令是如何经过“解析 -> 优化 -> 沙箱安全检查 -> 底层适配器执行”的全过程。

---

## 🛠️ 进阶：教 Agent 掌控新软件 (零代码适配)

基于 OpenCLI 的架构，你可以轻松地将公司内部系统或新网站教给 Agent，**无需手写爬虫**。只需在 `src/adapters/` 中添加一个配置文件（YAML/JSON）：

```json
// 示例：让 Agent 学会操作公司内部 OA 系统
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
配置完成后，Agent 即可直接调用 `securecli web company-oa todo` 获取结构化数据！

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
