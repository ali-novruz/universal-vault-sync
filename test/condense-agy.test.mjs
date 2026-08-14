import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";
import { truncate, summarizeToolInput, condense } from "../antigravity/condense-agy.mjs";

test("truncate", () => {
  assert.strictEqual(truncate("hello", 10), "hello");
  assert.strictEqual(truncate("hello world", 5), "hello …[6 chars truncated]");
  assert.strictEqual(truncate(null, 5), null);
});

test("summarizeToolInput", () => {
  assert.strictEqual(summarizeToolInput("run_command", { CommandLine: "echo hi" }), "`echo hi`");
  assert.strictEqual(summarizeToolInput("view_file", { AbsolutePath: "foo.txt" }), "foo.txt");
  assert.strictEqual(summarizeToolInput("write_to_file", { TargetFile: "foo.txt" }), "foo.txt");
  assert.strictEqual(summarizeToolInput("replace_file_content", { TargetFile: "foo.txt" }), "foo.txt");
  assert.strictEqual(summarizeToolInput("multi_replace_file_content", { TargetFile: "foo.txt" }), "foo.txt");
  assert.strictEqual(summarizeToolInput("Unknown", { arg: 1 }), '{"arg":1}');
  assert.strictEqual(summarizeToolInput("run_command", null), "");
  
  // Test error handling
  const circular = {};
  circular.self = circular;
  assert.strictEqual(summarizeToolInput("Unknown", circular), "");
});

test("condense", async () => {
  const tmpDir = os.tmpdir();
  const inFile = path.join(tmpDir, "test-agy-in.jsonl");

  const lines = [
    'invalid json',
    '{"source":"USER_EXPLICIT","step_index":1,"content":"Hello"}',
    '{"source":"MODEL","step_index":2,"content":"Hi there","tool_calls":[{"name":"run_command","args":{"CommandLine":"ls"}}]}',
    '{"source":"SYSTEM","step_index":3,"content":"System message"}',
    '{"source":"USER_EXPLICIT","step_index":4}'
  ];

  fs.writeFileSync(inFile, lines.join("\n"));

  const outContent = await condense(inFile);
  assert.ok(outContent.includes("**user** (step 1): Hello"));
  assert.ok(outContent.includes("**assistant** (step 2): Hi there"));
  assert.ok(outContent.includes("- [tool_use] run_command: `ls`"));
  assert.ok(outContent.includes("**SYSTEM** (step 3): System message"));
});

import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

test("CLI execution", () => {
  const tmpDir = os.tmpdir();
  const inFile = path.join(tmpDir, "cli-in-agy.jsonl");
  const outFile = path.join(tmpDir, "cli-out-agy.md");
  fs.writeFileSync(inFile, '{"source":"USER_EXPLICIT","step_index":1,"content":"CLI test"}');
  
  const scriptPath = path.resolve(fileURLToPath(import.meta.url), "../../antigravity/condense-agy.mjs");
  const res = spawnSync(process.execPath, [scriptPath, inFile, outFile], { encoding: "utf8" });
  assert.strictEqual(res.status, 0);
  assert.ok(fs.readFileSync(outFile, "utf8").includes("CLI test"));

  // Error case: missing args
  const resErr = spawnSync(process.execPath, [scriptPath], { encoding: "utf8" });
  assert.strictEqual(resErr.status, 1);
  assert.ok(resErr.stderr.includes("Usage: node condense-agy.mjs"));
});
