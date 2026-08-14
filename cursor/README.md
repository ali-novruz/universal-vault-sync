# Cursor Vault Sync

Cursor relies on the `.cursorrules` file or project-specific instructions to guide its behavior. By embedding a prompt into your `.cursorrules`, you can enforce the agent to summarize its work and write to your vault before it finishes a task.

## Setup

1. Open your project in Cursor.
2. Create or edit the `.cursorrules` file in the root of your project.
3. Append the contents of `cursorrules-example` to your file.
4. Modify the `<VAULT_PATH>` placeholder to point to your actual Obsidian vault project folder.

## Usage

When you use Composer or Cursor Chat and ask it to complete a task, the system rule will ensure that as its final step, Cursor reads the project note, appends a new progress log entry, and writes a daily chat summary.
