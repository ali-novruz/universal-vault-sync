---
name: vault-sync
description: >-
  Archives the current coding session into an Obsidian (PARA) vault so every AI
  agent you use shares the same long-term project memory. Writes a dated chat
  summary and updates the project's living README (decisions, problems/solutions,
  progress log, TODOs). Use when the user says "sync the vault", "archive this
  session", "save this to Obsidian", "/vault-sync", or when finishing a task.
license: MIT
metadata:
  version: "1.0.0"
  author: Ali Novruz
  homepage: https://universal-vault-sync.vercel.app
  repository: https://github.com/ali-novruz/universal-vault-sync
  companion: vault-recall
---

# Vault Sync

Persist what happened in this session into the user's Obsidian vault, so any agent
(Claude Code, Cursor, Copilot, Windsurf, Cline, Codex, Kimi, Antigravity, Aider…)
can pick up where this one left off. The `vault-recall` skill reads it back.

## 1. Resolve the vault projects root

Use the first one that is set:

1. The environment variable `VAULT_PROJECTS_ROOT`. Read it with
   `printenv VAULT_PROJECTS_ROOT` (in PowerShell: `$env:VAULT_PROJECTS_ROOT`). Don't use
   `echo $VAULT_PROJECTS_ROOT`: agents often block commands that expand variables.
2. The environment variable `CLAUDE_VAULT_ROOT`, read the same way.
3. A path the user already gave you in this conversation or in project rules.

This is the vault's projects folder, e.g. `~/Vault/01_Projects` or
`C:\Users\you\Vault\01_Projects`. If none is set, ask the user **once** for the path,
then continue. Never guess the path, and never fall back to another folder (such as the vault's top
level or a directory you happen to have access to). If you can't ask, stop and say the
vault path is missing. Never write outside this root.

## 2. Identify the project

The project name is the basename of the current workspace directory
(e.g. `/code/my-website` → `my-website`). Below, `<root>` is the vault projects
root and `<project>` is the project name. Use the OS path separator.

## 3. Write the chat log

Create `<root>/<project>/Chats/YYYY-MM-DD.md` (today's date). If the file already
exists, use `YYYY-MM-DD-2.md`, `-3.md`, and so on — never overwrite. Create missing
folders.

Write a short (10–20 lines), genuinely useful summary of this session:

```markdown
# <project> — YYYY-MM-DD

**Goal:** <what the user wanted>

## Done
- <concrete change, with key file paths>

## Decisions
- <decision> — <why>

## Problems & fixes
- <problem> → <fix>

## Next
- <open follow-ups>
```

Omit empty sections. Prefer facts (files, commands, reasons) over narration. Never
include secrets, tokens, API keys, or `.env` contents.

## 4. Update the project note

Read `<root>/<project>/README.md`.

- **If it exists:** add a new dated entry at the top of `## Progress Log` linking the
  chat log (`[[Chats/YYYY-MM-DD]]`). Update `## Tech Stack / Architecture`,
  `## Key Decisions`, `## Problems & Solutions`, and `## Open Questions / TODOs` only
  where this session produced new information. Keep existing content; tick off TODOs
  that were completed instead of deleting them.
- **If it doesn't exist:** create it with this skeleton and fill what you know:

```markdown
# <project>
## Overview
## Tech Stack / Architecture
## Key Decisions
## Problems & Solutions
## Progress Log
## Open Questions / TODOs
```

## 5. Finish

Do the file operations directly as your final step — the user asked for the sync, so
don't ask for confirmation again. Reply with one line naming the two files you wrote.
