# Copilot Vault Sync

GitHub Copilot Chat in VS Code supports custom instructions.

## Setup

1. Open your VS Code Settings (JSON).
2. Add the following to your `github.copilot.chat.customInstructions`:

```json
"github.copilot.chat.customInstructions": [
    {
        "text": "When the user asks to 'Sync Vault', write a short summary of our recent chat and save it to <VAULT_PATH>/Chats/YYYY-MM-DD.md. Then, update the Progress Log and other relevant sections in <VAULT_PATH>/README.md.",
    }
]
```
Replace `<VAULT_PATH>` with your Obsidian vault path.

## Usage

Simply ask Copilot: "Sync Vault" and it will read your custom instructions and perform the archive.
