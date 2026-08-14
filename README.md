# Universal AI Vault Sync

Welcome to the **Universal AI Vault Sync** repository! This project enables you to maintain a continuous, shared memory across **all** your favorite AI coding assistants (Claude Code, Google Antigravity, Cursor, Aider, GitHub Copilot, Windsurf, and Cline). 

🌐 **Live Demo & Documentation:** [https://frontend-ten-wine-61.vercel.app](https://frontend-ten-wine-61.vercel.app)

Instead of starting from scratch in every new chat or losing context when you switch tools, this setup automatically writes your AI session summaries and architectural decisions into an **Obsidian** vault using the PARA (Projects, Areas, Resources, Archive) method.

## The Concept

AI agents are ephemeral. When you close a terminal or clear a chat window, they forget the complex architectural decisions they made. 
By forcing all agents to write to a centralized markdown vault:
1. You build a living, breathing documentation of your codebase.
2. If you switch from Claude CLI to Cursor IDE, the new agent can read the vault and instantly understand the context.

## 1. Obsidian & Vault Setup

1. **Download Obsidian**: [obsidian.md](https://obsidian.md/)
2. **Create a Vault**: Create a new folder on your computer (e.g., `C:\Users\you\Desktop\MyAIVault`).
3. **Structure the Vault**: Inside the vault, create the PARA folders:
   - `00_Inbox`
   - `01_Projects` (This is where your AI agents will sync to!)
   - `02_Areas`
   - `03_Resources`
   - `04_Archive`

For every project you work on, create a subfolder in `01_Projects` (e.g., `01_Projects/MyWebsite`). 

## 2. Integrating Your AI Tools

Navigate to the specific folder for your AI tool to find the setup instructions and necessary scripts/rules:

- 🖧 **[Claude Code (CLI)](claude/README.md)**: Uses a built-in `SessionEnd` hook to run a Node script.
- 🚀 **[Google Antigravity IDE](antigravity/README.md)**: Uses a native `/vault-sync` Skill for seamless integration.
- 🖱️ **[Cursor](cursor/README.md)**: Uses a `.cursorrules` injection to force end-of-task syncing.
- 🤖 **[Aider](aider/README.md)**: Uses an architect prompt via `--message`.
- ✈️ **[GitHub Copilot](copilot/instructions.md)**: Uses custom VS Code Chat instructions.
- 🏄 **[Windsurf](windsurf/windsurfrules-example)**: Uses `.windsurfrules`.
- 🛠️ **[Cline / Roo](cline/clinerules-example)**: Uses `.clinerules`.

## 3. Archiving Old Sessions

If you have old chat histories that you want to convert into Obsidian notes, we provide "condense" scripts for CLI and IDE tools that output raw `.jsonl` logs.
- For Claude Code: Check the `claude/condense.mjs` script.
- For Antigravity: Check the `antigravity/condense-agy.mjs` script.

## Contributing

We want to support every AI tool! If your favorite tool isn't listed, please read [CONTRIBUTING.md](CONTRIBUTING.md) and submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
