---
name: vault-sync
description: >-
  Archives the current Antigravity session into the Obsidian vault.
  Use this when the user asks to sync the vault, archive the session, or types `/vault-sync`.
---

# Vault Sync Procedure

The user wants to archive this current session into their Obsidian vault (`C:\Users\nevin\Desktop\obsiclaude\claude\01_Projects`).

1. **Understand the Session**: Look at your own transcript/memory of this conversation. Summarize what has been accomplished.
2. **Identify Project**: The project name is the basename of the current workspace directory.
3. **Write Chat Log**: Create a short (10-20 line), genuinely useful summary of this session. Write this summary to a new file in `C:\Users\nevin\Desktop\obsiclaude\claude\01_Projects\<project-name>\Chats\YYYY-MM-DD.md`. Append `-2`, `-3` etc. to the filename if one already exists for today.
4. **Update Project Note**: Read the project note at `C:\Users\nevin\Desktop\obsiclaude\claude\01_Projects\<project-name>\README.md` using `view_file`.
    - If it exists, add a NEW dated entry to the "Progress Log" section for this session. Update "Tech Stack", "Key Decisions", "Problems & Solutions", and "Open Questions / TODOs" if new information arose using `replace_file_content` or `multi_replace_file_content`.
    - If it doesn't exist, create it with the following sections using `write_to_file`:
      ```markdown
      # <project-name>
      ## Overview
      ## Tech Stack / Architecture
      ## Key Decisions
      ## Problems & Solutions
      ## Progress Log
      ## Open Questions / TODOs
      ```

**Important**: Do not ask the user for permission to create/edit these files, just execute the file operations directly!
