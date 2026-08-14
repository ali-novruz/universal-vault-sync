# Antigravity IDE Vault Sync

This folder contains the integration for the **Google Antigravity IDE**.

Antigravity operates as a continuous persistent IDE rather than a CLI tool, which means it doesn't emit "Session End" events. Attempting to use a background hook (like `Stop`) would cause the agent to trigger a vault sync after every single interaction, which is highly inefficient.

Instead, we use a native **Antigravity Skill**.

## Setup

1. Locate your global or workspace customizations folder. For global, it is `~/.gemini/config/`.
2. Create a folder named `skills/vault-sync/`.
3. Copy the `SKILL.md` from this folder into `skills/vault-sync/`.
4. (Optional) Copy `condense-agy.mjs` into the same folder if you want to condense old logs manually.

## Usage

Whenever you finish working on a feature or want to snapshot your progress:
1. Open the Antigravity Chat.
2. Type `/vault-sync`.
3. The Antigravity agent will automatically read its own memory/transcripts, summarize the session, and use its file operations to natively update your vault's `README.md` and `Chats/` directory without spawning a secondary process.

## Archiving Old Sessions
You can condense Antigravity's raw `.jsonl` transcript files into manageable markdown summaries using the provided script:
```bash
node condense-agy.mjs ~/.gemini/antigravity-ide/brain/<conv-id>/.system_generated/logs/transcript.jsonl condensed-output.md
```
