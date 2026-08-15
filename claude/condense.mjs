#!/usr/bin/env node
// Condenses a Claude Code session JSONL transcript into a compact, readable
// markdown log. Strips large tool_result payloads, base64 blobs, and file
// dumps, keeping user prompts, assistant text, and short tool_use summaries.
//
// Usage: node condense.mjs <input.jsonl> <output.md>
//
// This is the same condensation logic vault-sync.mjs uses internally, split
// out standalone so you can run it yourself over old session files —
// see README.md "Archiving old sessions" for the full workflow.
import fs from "fs";
import readline from "readline";
import { fileURLToPath } from "url";

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

export function summarizeToolInput(name, input) {
  if (!input) return "";
  try {
    if (name === "Bash") return `\`${truncate(input.command || "", 200)}\``;
    if (name === "Read") return input.file_path || "";
    if (name === "Edit") return input.file_path || "";
    if (name === "Write") return input.file_path || "";
    if (name === "Glob") return input.pattern || "";
    if (name === "Grep") return input.pattern || "";
    if (name === "TaskCreate" || name === "TaskUpdate") return truncate(JSON.stringify(input), 200);
    return truncate(JSON.stringify(input), 150);
  } catch {
    return "";
  }
}

export function condense(inFile, outFile) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(inFile, { encoding: "utf8" }),
      crlfDelay: Infinity,
    });

    const out = fs.createWriteStream(outFile, { encoding: "utf8" });
    out.on('error', reject);

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
      // property access on it throws (or, for null, always throws).
      if (!obj || typeof obj !== "object") return;

      const type = obj.type;
      const ts = obj.timestamp || "";

      if (type === "summary") {
        out.write(`\n### [SUMMARY] ${obj.summary || ""}\n`);
        return;
      }

      if (type === "user" || type === "assistant") {
        const msg = obj.message;
        if (!msg) return;
        const role = msg.role || type;
        const content = msg.content;
        if (typeof content === "string") {
          if (content.trim()) out.write(`\n**${role}** (${ts}): ${truncate(content, 2000)}\n`);
          return;
        }
        if (!Array.isArray(content)) return;
        for (const block of content) {
          if (!block || typeof block !== "object") continue;
          if (block.type === "text" && block.text && block.text.trim()) {
            out.write(`\n**${role}** (${ts}): ${truncate(block.text, 2000)}\n`);
          } else if (block.type === "tool_use") {
            out.write(`\n- [tool_use] ${block.name}: ${summarizeToolInput(block.name, block.input)}\n`);
          } else if (block.type === "tool_result") {
            // skip bulky raw results entirely; they're derivable from the tool_use above
          }
        }
      }
    });

    rl.on("close", () => {
      out.end();
      out.on('finish', resolve);
    });
  });
}

/* c8 ignore start */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const inFile = process.argv[2];
  const outFile = process.argv[3];

  if (!inFile || !outFile) {
    console.error("usage: condense.mjs <in.jsonl> <out.md>");
    process.exit(1);
  }

  condense(inFile, outFile).catch(console.error);
}
/* c8 ignore stop */
