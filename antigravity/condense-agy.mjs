#!/usr/bin/env node
import fs from "fs";
import readline from "readline";
import { fileURLToPath } from "url";

export function truncate(s, n) {
  if (typeof s !== "string") return s;
  return s.length > n ? s.slice(0, n) + ` …[${s.length - n} chars truncated]` : s;
}

export function summarizeToolInput(name, args) {
  if (!args) return "";
  try {
    if (name === "run_command") return `\`${truncate(args.CommandLine || "", 200)}\``;
    if (name === "view_file" || name === "write_to_file" || name === "replace_file_content" || name === "multi_replace_file_content") return args.AbsolutePath || args.TargetFile || "";
    return truncate(JSON.stringify(args), 150);
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
      
      const role = obj.source === "MODEL" ? "assistant" : (obj.source === "USER_EXPLICIT" ? "user" : obj.source);
      const content = obj.content;
      
      if (content && typeof content === "string" && content.trim()) {
        out += `\n**${role}** (step ${obj.step_index}): ${truncate(content, 2000)}\n`;
      }
      
      if (obj.tool_calls && Array.isArray(obj.tool_calls)) {
        for (const call of obj.tool_calls) {
          out += `\n- [tool_use] ${call.name}: ${summarizeToolInput(call.name, call.args)}\n`;
        }
      }
    });
    rl.on("close", () => resolve(out));
  });
}

/* c8 ignore start */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const transcriptPath = process.argv[2];
  const outputPath = process.argv[3];
  
  if (!transcriptPath || !outputPath) {
    console.error("Usage: node condense-agy.mjs <input.jsonl> <output.md>");
    process.exit(1);
  }
  
  condense(transcriptPath).then((condensed) => {
    fs.writeFileSync(outputPath, condensed, "utf8");
    console.log(`Saved condensed transcript to ${outputPath}`);
  });
}
/* c8 ignore stop */
