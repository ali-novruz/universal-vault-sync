# Universal AI Vault Sync

Welcome to the **Universal AI Vault Sync** repository! This project enables you to maintain a continuous, shared memory across **all** your favorite AI coding assistants (Claude Code, Google Antigravity, Cursor, Aider, GitHub Copilot, Windsurf, and Cline). 

🌐 **Live Demo & Documentation:** [https://universal-vault-sync.vercel.app](https://universal-vault-sync.vercel.app)

Instead of starting from scratch in every new chat or losing context when you switch tools, this setup automatically writes your AI session summaries and architectural decisions into an **Obsidian** vault using the PARA (Projects, Areas, Resources, Archive) method.

## The Concept

AI agents are ephemeral. When you close a terminal or clear a chat window, they forget the complex architectural decisions they made. 
By forcing all agents to write to a centralized markdown vault:
1. You build a living, breathing documentation of your codebase.
2. If you switch from Claude CLI to Cursor IDE, the new agent can read the vault and instantly understand the context.

## 1. Obsidian & Vault Setup

1. **Download Obsidian**: [obsidian.md](https://obsidian.md/)
2. **Download the Claudesidian PARA Vault**: To get the exact, optimized PARA structure required for these agents, you should clone or download the vault template from [heyitsnoah/claudesidian](https://github.com/heyitsnoah/claudesidian).
3. **Open in Obsidian**: Extract the `claudesidian` repo and open the folder as a Vault in Obsidian.
4. **Create your project**: Inside the vault's `01_Projects` directory, create a subfolder for your new codebase (e.g., `01_Projects/MyWebsite`). This is where your AI agents will sync to! 

## 2. Integrating Your AI Tools

### Setup & Integration
**All supported IDEs and Agents now use a unified "Skill Profile" architecture.** We provide a tailored `SKILL.md` file for each tool in their respective folders.

1. **Claude Code**: Provide `claude/SKILL.md` as custom instructions, or use the built-in `SessionEnd` hook. See `claude/README.md`.
2. **Google Antigravity IDE**: Install `antigravity/SKILL.md` to your `~/.gemini/config/skills/vault-sync/` directory.
3. **Cursor**: Copy `cursor/SKILL.md` into your project's `.cursorrules`.
4. **Windsurf**: Copy `windsurf/SKILL.md` into your project's `.windsurfrules`.
5. **Cline**: Copy `cline/SKILL.md` into your `.clinerules`.
6. **Copilot**: Copy `copilot/SKILL.md` into VS Code Copilot custom instructions.
7. **Aider**: Pass `aider/SKILL.md` using the `--message` flag.
8. **Kimi Code**: Save `kimi/SKILL.md` as `.kimi/rules.md` in your project root or add to your IDE extension settings.
9. **Codex (ChatGPT)**: Paste `codex/SKILL.md` into your ChatGPT Custom Instructions.

## 3. Archiving Old Sessions

If you have old chat histories that you want to convert into Obsidian notes, we provide "condense" scripts for CLI and IDE tools that output raw `.jsonl` logs.
- For Claude Code: Check the `claude/condense.mjs` script.
- For Antigravity: Check the `antigravity/condense-agy.mjs` script.

## Contributing

We want to support every AI tool! If your favorite tool isn't listed, please read [CONTRIBUTING.md](CONTRIBUTING.md) and submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
