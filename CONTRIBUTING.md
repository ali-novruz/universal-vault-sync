# Contributing to Universal Vault Sync

First of all, thank you for your interest in contributing! This project aims to bring universal memory (via Obsidian and the PARA method) to every AI coding assistant on the market.

## How to Contribute

1. **Add Support for a New AI Tool**: If your favorite IDE agent or CLI agent isn't supported, figure out how to write a hook, prompt, skill, or `.rule` file to automatically force it to summarize its session to the vault. Submit a PR with a new folder!
2. **Improve Prompts**: Our condenser scripts and rule files rely on prompts. If you have a better prompt that extracts architectural decisions more reliably, we want it.
3. **Enhance Obsidian Setup**: If you have amazing Obsidian plugin recommendations that pair perfectly with AI vaults, submit a documentation update to the root `README.md`.

## Submitting Pull Requests
- Keep your changes focused.
- Ensure any Node.js scripts do not introduce heavy dependencies (we prefer zero-dependency `mjs` scripts).
- Update the relevant `README.md` in the tool's subfolder and the root `README.md`.
