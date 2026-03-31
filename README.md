# 🛡️ SecureCLI

**The AI Agent-Native Secure Execution Runtime**

[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/wanfeng0330-lgtm/SecureCLI)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green)](package.json)

SecureCLI is a security-focused execution runtime designed specifically for AI Agents. It enables LLMs (like Claude, OpenClaw, Cursor) to safely interact with websites, web services, and desktop applications through a unified CLI interface.

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔒 **Security Sandbox | Pre-execution code scanning + runtime Node.js Proxy interception. Blocks malicious operations like `rm -rf` even when an Agent is compromised by prompt injection. |
| 🤖 **Agent-Native Interface | Outputs deterministic JSON, strips useless logs and ANSI color codes, reducing Token consumption. |
| 🌐 **Web/Desktop Automation | Reuses your Chrome session to control websites without dealing with CAPTCHAs or login flows. |
| 🖥️ **Local Software Control | Converts GUI applications (GIMP, LibreOffice, Blender) into CLI commands. |

## 🎯 What Problem Does It Solve?

When AI Agents try to accomplish real-world tasks, they face three major pain points:

1. **Limited Capabilities** - Can't interact with GUI applications
2. **High Development Cost** - Need to write custom scrapers for each website
3. **Uncontrolled Risks** - Malicious code injection via prompt attacks

SecureCLI addresses all three by providing a unified, secure, and extensible execution environment.

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/wanfeng0330-lgtm/SecureCLI.git
cd SecureCLI
npm install
npm run build
npm link
```

### Agent Integration

To enable your AI Agent to use SecureCLI, add the contents of [`AGENT.md`](./AGENT.md) to your Agent's system prompt.

### Usage Examples

```bash
# Query website data (reuses Chrome login session)
securecli web zhihu hot --limit 5

# Operate local image processing software
securecli local gimp --export image.png --apply blur

# Execute commands with automatic security scanning
securecli web xiaohongshu search "AI tools" --limit 10
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SecureCLI Core                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Adapter    │  │  Security    │  │  Agent       │     │
│  │   Layer      │  │  Sandbox     │  │  Optimizer   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↓                ↓                  ↓                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ WebDesktop    │  │ HITL        │  │ CLI         │     │
│  │ Adapter       │  │ Approval    │  │ Normalizer  │     │
│  │ (OpenCLI)     │  │ Mechanism   │  │             │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↓                                                       │
│  ┌──────────────────────────────────────────────────┐        │
│  │            External CLI Integrations              │        │
│  │  • OpenCLI (430+ website CLIs)                   │        │
│  │  • CLI-Anything (GIMP, LibreOffice, Blender...) │        │
│  └──────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Security Model

### Risk Levels

| Level | Behavior |
|-------|----------|
| 🟢 **LOW** | Auto-approved, no blocking |
| 🟡 **MEDIUM** | Human approval required (e.g., delete, remove) |
| 🟠 **HIGH** | Human approval required (e.g., payment, transfer) |
| 🔴 **CRITICAL** | Auto-blocked (e.g., `rm -rf /*`, drop database) |

### HITL Approval Flow

```
Agent Instruction → Risk Assessment (LOW/MEDIUM/HIGH/CRITICAL)
                          ↓
                  CRITICAL? → Auto-block → Return 403
                          ↓ No
                  MEDIUM/HIGH? → Pause → Wait for Human Approval
                          ↓ Approved
                    Execute → Return Result
```

## 📡 API Endpoints

When running `npm run start:server`:

```
GET  /api/risk-assessment/:instruction  - Assess instruction risk level
GET  /api/approvals/pending              - List pending approval requests
GET  /api/approval/:requestId            - Get approval request details
POST /api/approval/:requestId           - Submit approval (body: {"approved": true/false})
POST /api/execute                        - Execute command with security checks
POST /api/sandbox                        - Execute code in isolated sandbox
```

## 🛠️ Extending SecureCLI

Add new software support via YAML/JSON configuration in `src/adapters/`:

```json
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

## 📦 Built-in Integrations

### Web Automation (OpenCLI - 430+ CLIs)

| Category | Examples |
|----------|----------|
| Social | Twitter, Reddit, Instagram, LinkedIn |
| Video | YouTube, Bilibili, TikTok |
| Blog | Zhihu, Weibo, Xiaohongshu, Jike |
| E-commerce | JD.com, Taobao |

### Local Software (CLI-Anything)

| Software | Capabilities |
|----------|--------------|
| GIMP | Image editing, filters, layers |
| LibreOffice | Writer, Calc, Impress documents |
| Blender | 3D modeling, animation |
| Audacity | Audio editing |
| Krita | Digital painting |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenCLI](https://github.com/jackwener/opencli) - Web/Desktop automation engine
- [CLI-Anything](https://github.com/HKUDS/CLI-Anything) - Local software CLI framework
