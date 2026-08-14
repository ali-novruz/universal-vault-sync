---
name: vault-sync
description: >-
  Native Claude Code Skill to archive the current coding session into the Obsidian vault.
  To install: You can prompt this file when you finish a task, or rely on the automated `SessionEnd` hook.
---

# Vault Sync Procedure

The user wants to archive this current session into their Obsidian vault, whose projects root is set via the `CLAUDE_VAULT_ROOT` environment variable (see `claude/README.md` for setup; e.g. `C:\Users\you\Desktop\Vault\01_Projects`). Substitute that path for `<VAULT_PROJECTS_ROOT>` below.

1. **Understand the Session**: Look at your own transcript/memory of this conversation. Summarize what has been accomplished.
2. **Identify Project**: The project name is the basename of the current workspace directory.
3. **Write Chat Log**: Create a short (10-20 line), genuinely useful summary of this session. Write this summary to a new file in `<VAULT_PROJECTS_ROOT>\<project-name>\Chats\YYYY-MM-DD.md`. Append `-2`, `-3` etc. to the filename if one already exists for today.
4. **Update Project Note**: Read the project note at `<VAULT_PROJECTS_ROOT>\<project-name>\README.md`.
    - If it exists, add a NEW dated entry to the "Progress Log" section for this session. Update "Tech Stack", "Key Decisions", "Problems & Solutions", and "Open Questions / TODOs" if new information arose.
    - If it doesn't exist, create it with the following sections:
      ```markdown
      # <project-name>
      ## Overview
      ## Tech Stack / Architecture
      ## Key Decisions
      ## Problems & Solutions
      ## Progress Log
      ## Open Questions / TODOs
      ```

**Important**: Do not ask the user for permission to create/edit these files, just execute the file operations directly as your final step!
