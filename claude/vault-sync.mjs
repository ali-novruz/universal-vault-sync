#!/usr/bin/env node
// SessionEnd hook: condenses the just-finished Claude Code session transcript
// and spawns a headless `claude -p` to update/create the matching project
// note in an Obsidian (or any markdown/PARA-style) vault.
//
// Configure via environment variable (set in the "env" block of the hook
// entry, or in your shell profile):
//   CLAUDE_VAULT_ROOT   Absolute path to the vault's project folder root,
//                        e.g. "C:\\Users\\you\\vault\\01_Projects" or
//                        "/home/you/vault/01_Projects".
//
// See README.md for setup instructions.
import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

export function log(msg, logFile) {
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {}
}

export async function main(inputStr, vaultRoot, logFile, processEnv) {
  let payload = {};
  try {
    payload = JSON.parse(inputStr || "{}");
  } catch {
    log("Could not parse stdin JSON, exiting.", logFile);
    return;
  }

  const cwd = payload.cwd || process.cwd();
  const normCwd = path.normalize(cwd);
  const normVault = path.normalize(vaultRoot);

  const cwdLower = normCwd.toLowerCase();
  const vaultLower = normVault.toLowerCase();
  const isInsideVault = cwdLower === vaultLower || cwdLower.startsWith(vaultLower + path.sep);
  if (isInsideVault) {
    log(`Skip: session cwd is inside the vault itself (${cwd})`, logFile);
    return;
  }

  const projectName = path.basename(normCwd) || "misc";

  let transcriptPath = payload.transcript_path;
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    const encoded = normCwd.replace(/[:\\/]/g, "-");
    const dir = path.join(os.homedir(), ".claude", "projects", encoded);
    if (!fs.existsSync(dir)) {
      log(`Skip: no transcript_path given and no projects dir at ${dir}`, logFile);
      return;
    }
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => ({ f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    if (!files.length) {
      log(`Skip: no .jsonl files in ${dir}`, logFile);
      return;
    }
    transcriptPath = path.join(dir, files[0].f);
  }

  const condensed = await condense(transcriptPath);
  if (condensed.trim().length < 150) {
    log(`Skip: session too trivial (${condensed.length} chars condensed) for ${projectName}`, logFile);
    return;
  }

  const tmpFile = path.join(os.tmpdir(), `vault-sync-${payload.session_id || Date.now()}.md`);
  fs.writeFileSync(tmpFile, condensed, "utf8");

  const vaultProjectDir = path.join(vaultRoot, projectName);

  const prompt = `A Claude Code session just ended. Your job is to archive it into the project note in an Obsidian-style vault.\n\n1. Read this file: ${tmpFile}\n2. Update the project note: ${path.join(vaultProjectDir, "README.md")}\n3. REQUIRED — do not skip: write a short (10-20 line), genuinely useful summary of this session to ${path.join(vaultProjectDir, "Chats")} named with today's date (YYYY-MM-DD.md, append -2, -3 if another session already exists for today).\n\n4. Only use the Read, Write, and Edit tools. Do not run any commands.\n\nDo not finish until BOTH file operations (step 2 and step 3) are done.`;

  const child = spawn(
    "claude",
    [
      "-p",
      prompt,
      "--add-dir",
      vaultRoot,
      "--allowedTools",
      "Read Write Edit",
      "--permission-mode",
      "acceptEdits",
    ],
    {
      cwd: vaultRoot,
      env: { ...processEnv, VAULT_SYNC_RUNNING: "1" },
      detached: true,
      stdio: ["ignore", fs.openSync(logFile, "a"), fs.openSync(logFile, "a")],
      windowsHide: true,
    }
  );
  child.on("error", () => {});
  child.unref();
  log(`Spawned vault sync for project "${projectName}" (cwd=${cwd}, transcript=${transcriptPath})`, logFile);
}

export function truncate(s, n) {
  if (typeof s !== "string") return s;
  if (s.length <= n) return s;
  // Don't split a UTF-16 surrogate pair (e.g. emoji): back the cut up by
  // one if it would land between a high and low surrogate.
  let cut = n;
  const code = s.charCodeAt(cut - 1);
  if (code >= 0xd800 && code <= 0xdbff) cut -= 1;
  return s.slice(0, cut) + ` …[${s.length - cut} chars truncated]`;
}

export function summarizeToolInput(name, inp) {
  if (!inp) return "";
  try {
    if (name === "Bash") return `\`${truncate(inp.command || "", 200)}\``;
    if (name === "Read" || name === "Edit" || name === "Write") return inp.file_path || "";
    if (name === "Glob") return inp.pattern || "";
    if (name === "Grep") return inp.pattern || "";
    return truncate(JSON.stringify(inp), 150);
  } catch {
    return "";
  }
}

export function condense(file) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(file, { encoding: "utf8" }),
      crlfDelay: Infinity,
    });
    let out = "";
    rl.on("line", (line) => {
      if (!line.trim()) return;
      let obj;
      try {
        obj = JSON.parse(line);
      } catch {
        return;
      }
      // JSON.parse succeeds for any valid JSON value, not just objects —
      // a bare `null`, number, string, or array parses fine, then any
      // property access on it throws (or, for null, always throws). An
      // uncaught throw here escapes this Promise (it's inside a sync
      // event-listener callback, not the executor), crashing the whole
      // SessionEnd hook process instead of just skipping the bad line.
      if (!obj || typeof obj !== "object") return;
      if (obj.type === "summary") {
        out += `\n### [SUMMARY] ${obj.summary || ""}\n`;
        return;
      }
      if (obj.type !== "user" && obj.type !== "assistant") return;
      const msg = obj.message;
      if (!msg) return;
      const role = msg.role || obj.type;
      const content = msg.content;
      const ts = obj.timestamp || "";
      if (typeof content === "string") {
        if (content.trim()) out += `\n**${role}** (${ts}): ${truncate(content, 2000)}\n`;
        return;
      }
      if (!Array.isArray(content)) return;
      for (const block of content) {
        if (!block || typeof block !== "object") continue;
        if (block.type === "text" && block.text && block.text.trim()) {
          out += `\n**${role}** (${ts}): ${truncate(block.text, 2000)}\n`;
        } else if (block.type === "tool_use") {
          out += `\n- [tool_use] ${block.name}: ${summarizeToolInput(block.name, block.input)}\n`;
        }
      }
    });
    rl.on("close", () => resolve(out));
  });
}

/* c8 ignore start */
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const VAULT_ROOT = process.env.CLAUDE_VAULT_ROOT;
  if (!VAULT_ROOT) {
    process.exit(0);
  }
  const LOG_FILE = path.join(os.homedir(), ".claude", "hooks", "vault-sync.log");
  if (process.env.VAULT_SYNC_RUNNING === "1") {
    process.exit(0);
  }
  let input = "";
  process.stdin.on("data", (d) => (input += d));
  process.stdin.on("end", () => {
    main(input, VAULT_ROOT, LOG_FILE, process.env).catch((e) => {
      log(`ERROR: ${e.stack || e}`, LOG_FILE);
      process.exit(0);
    });
  });
}
/* c8 ignore stop */
