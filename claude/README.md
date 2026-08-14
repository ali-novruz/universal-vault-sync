# Claude Code Vault Sync

This folder contains the integration scripts for [Claude Code](https://claude.com/claude-code). 

Because Claude Code is a CLI tool, it has a built-in `SessionEnd` hook that fires whenever you exit a project session.

## Setup

1. Copy `vault-sync.mjs` and `condense.mjs` to a safe location on your computer (e.g., `~/.claude/vault-sync/`).
2. Set the `CLAUDE_VAULT_ROOT` environment variable in your `~/.claude/settings.json` file. It should point to the exact path where your projects are stored inside your Obsidian vault (e.g., `C:\\Users\\you\\Desktop\\Vault\\01_Projects`).
3. Add the `SessionEnd` hook to your `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_VAULT_ROOT": "C:\\Users\\you\\Desktop\\Vault\\01_Projects"
  },
  "hooks": {
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"/path/to/your/vault-sync.mjs\"",
            "async": true,
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

## Archiving Old Sessions
You can retroactively sync old Claude Code sessions into your vault:
```bash
node condense.mjs ~/.claude/projects/<folder>/<session>.jsonl condensed-output.md
```
Then ask Claude to read `condensed-output.md` and add it to your project README.
