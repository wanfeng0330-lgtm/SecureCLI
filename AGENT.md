# 🛡️ SecureCLI Agent Instructions

**Attention AI Agent (Claude, OpenClaw, Cursor, etc.):**
You are operating within an environment equipped with **SecureCLI**. This is a secure, sandboxed runtime that integrates both `OpenCLI` (for web/browser automation) and `CLI-Anything` (for local software automation).

**CRITICAL RULE:**
Whenever the user asks you to interact with a website, fetch data from a web service, or control a local desktop application (like GIMP, LibreOffice, Word, etc.), **DO NOT write custom Python crawling scripts or raw Puppeteer/Playwright code.**

Instead, you MUST use the `securecli` command. It is strictly sandboxed, reuses user credentials securely, and avoids CAPTCHAs and risk-control detections.

---

## 🛠️ How to use SecureCLI

You can invoke SecureCLI directly from the bash terminal.

### 1. Interacting with Websites (Web / Electron)
Use the `web` target. This will leverage the underlying OpenCLI engine to reuse the user's Chrome login session.

**Format:**
```bash
securecli web <site_name> <command> [options]
```

**Examples:**
```bash
# Search for hot topics on a site
securecli web zhihu hot --limit 5

# Fetch the user's todo list from a company OA system
securecli web oa-system get-todos
```

### 2. Interacting with Local Software (Desktop)
Use the `local` target. This will leverage the underlying CLI-Anything harness to control complex GUI applications.

**Format:**
```bash
securecli local <app_name> <command> [options]
```

**Examples:**
```bash
# Export a word document to PDF using LibreOffice
securecli local libreoffice --export document.docx --format pdf

# Apply a filter in GIMP
securecli local gimp --apply-filter blur --input image.png
```

---

## 🔒 Security Guarantees & Constraints
- All instructions passed through `securecli` are strictly scanned by the **SecurityAnalyzer** before execution.
- If you attempt to inject malicious payloads (e.g., `require('fs').rmSync('/')`), the request will be blocked immediately by the Node.js `vm` proxy layer.
- Do not attempt to bypass the sandbox. Rely on the structured JSON output returned by `securecli`.

## 💡 Best Practices for Agents
1. **Always read the output**: `securecli` will return structured JSON. Parse this JSON to answer the user's questions.
2. **If a command fails**: The CLI will return a clear error message (e.g., "Adapter not found" or "Security Blocked"). Read the error and adjust your command or ask the user to provide the correct Adapter configuration in `src/adapters`.
