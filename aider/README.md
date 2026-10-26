# Aider Vault Sync

Aider works heavily in the terminal and often completes tasks by committing code to git. To sync your session memory to an Obsidian vault, we use a custom architect prompt or convention.

## Setup

1. Copy the `SKILL.md` file from this folder into your project repository.
2. Replace the `<VAULT_PROJECTS_ROOT>` placeholder in `SKILL.md` with your Obsidian vault projects folder.

## Usage

When you are done with a session in Aider, you can ask Aider to run the architect prompt:
```bash
aider --read SKILL.md --message "Execute the Vault Sync procedure."
```
Or, from within the interactive Aider chat:
```
/read SKILL.md
Please execute the Vault Sync procedure.
```
