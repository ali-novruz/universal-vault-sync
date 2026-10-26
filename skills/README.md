# Standalone Skills

Self-contained, agent-agnostic skills in the open `SKILL.md` format (YAML
frontmatter + Markdown instructions). Each folder installs on its own — no need to
clone the rest of this repo.

| Skill | What it does |
|---|---|
| [`vault-sync`](vault-sync/SKILL.md) | Writes the current session into your Obsidian vault (chat log + project README). |
| [`vault-recall`](vault-recall/SKILL.md) | Reads the project's vault memory at the start of a session. |

Use them together: `vault-recall` when you start, `vault-sync` when you finish.

## Requirements

- An Obsidian vault with a projects folder, e.g. the PARA layout from
  [heyitsnoah/claudesidian](https://github.com/heyitsnoah/claudesidian) (`01_Projects`).
- Set `VAULT_PROJECTS_ROOT` to that folder (or tell the agent the path once):

```bash
# macOS / Linux
export VAULT_PROJECTS_ROOT="$HOME/Vault/01_Projects"
```

```powershell
# Windows
setx VAULT_PROJECTS_ROOT "C:\Users\you\Vault\01_Projects"
```

## Install

| Agent | Where to put the folder |
|---|---|
| Claude Code | `~/.claude/skills/<skill>/SKILL.md` (or `.claude/skills/` in a project) |
| Codex CLI | `~/.codex/skills/<skill>/SKILL.md` |
| Google Antigravity | `~/.gemini/config/skills/<skill>/SKILL.md` |
| Cursor | `.cursor/rules/<skill>.mdc` (paste the file body) |
| Windsurf / Cline | `.windsurfrules` / `.clinerules` (paste the file body) |
| GitHub Copilot | `.github/copilot-instructions.md` (paste the file body) |
| Any other agent | Paste the file body into its custom instructions / rules |

Then ask the agent to "recall the vault" or "sync the vault", or type
`/vault-recall` / `/vault-sync` where slash commands are supported.

## License

MIT — see [LICENSE](../LICENSE).
