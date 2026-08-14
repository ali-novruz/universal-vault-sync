# Aider Vault Sync

Aider works heavily in the terminal and often completes tasks by committing code to git. To sync your session memory to an Obsidian vault, we use a custom architect prompt or convention.

## Setup

1. Copy the `architect-prompt.md` file into your project repository.
2. Edit `architect-prompt.md` to point to your specific Obsidian vault path.

## Usage

When you are done with a session in Aider, you can ask Aider to run the architect prompt:
```bash
aider --message "Read architect-prompt.md and execute the Vault Sync procedure."
```
Or, from within the interactive Aider chat:
```
/read architect-prompt.md
Please execute the Vault Sync procedure.
```
