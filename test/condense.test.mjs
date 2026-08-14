import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";
import { truncate, summarizeToolInput, condense } from "../claude/condense.mjs";

test("truncate", () => {
  assert.strictEqual(truncate("hello", 10), "hello");
  assert.strictEqual(truncate("hello world", 5), "hello …[6 chars truncated]");
  assert.strictEqual(truncate(null, 5), null);
});

test("summarizeToolInput", () => {
  assert.strictEqual(summarizeToolInput("Bash", { command: "echo hi" }), "`echo hi`");
  assert.strictEqual(summarizeToolInput("Read", { file_path: "foo.txt" }), "foo.txt");
  assert.strictEqual(summarizeToolInput("Edit", { file_path: "foo.txt" }), "foo.txt");
  assert.strictEqual(summarizeToolInput("Write", { file_path: "foo.txt" }), "foo.txt");
  assert.strictEqual(summarizeToolInput("Glob", { pattern: "*.js" }), "*.js");
  assert.strictEqual(summarizeToolInput("Grep", { pattern: "const" }), "const");
  assert.strictEqual(summarizeToolInput("TaskCreate", { task: "do it" }), '{"task":"do it"}');
  assert.strictEqual(summarizeToolInput("Unknown", { arg: 1 }), '{"arg":1}');
  assert.strictEqual(summarizeToolInput("Bash", null), "");
  
  // Test error handling (e.g. circular structure)
  const circular = {};
  circular.self = circular;
  assert.strictEqual(summarizeToolInput("Unknown", circular), "");
});

test("condense", async () => {
  const tmpDir = os.tmpdir();
  const inFile = path.join(tmpDir, "test-in.jsonl");
  const outFile = path.join(tmpDir, "test-out.md");

  const lines = [
    '{"type":"summary","summary":"Test session"}',
    'invalid json',
    '{"type":"user","message":{"role":"user","content":"Hello"}}',
    '{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"Hi there"},{"type":"tool_use","name":"Bash","input":{"command":"ls"}},{"type":"tool_result"}]}}',
    '{"type":"other"}',
    '{"type":"user","message":{"role":"user","content":[{"type":"other"}]}}',
    '{"type":"user","message":{"role":"user","content":null}}',
    '{"type":"user"}',
    '{"type":"assistant","message":{"role":"assistant","content":[{"type":"tool_use","name":"TaskCreate","input":{"task":"do"}}]}}',
    '{"type":"user","message":{"role":"user","content":""}}',
    '{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":""}]}}'
  ];

  fs.writeFileSync(inFile, lines.join("\n"));

  await condense(inFile, outFile);

  const outContent = fs.readFileSync(outFile, "utf8");
  assert.ok(outContent.includes("### [SUMMARY] Test session"));
  assert.ok(outContent.includes("**user** (): Hello"));
  assert.ok(outContent.includes("**assistant** (): Hi there"));
  assert.ok(outContent.includes("- [tool_use] Bash: `ls`"));
});

import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

test("CLI execution", () => {
  const tmpDir = os.tmpdir();
  const inFile = path.join(tmpDir, "cli-in.jsonl");
  const outFile = path.join(tmpDir, "cli-out.md");
  fs.writeFileSync(inFile, '{"type":"user","message":{"role":"user","content":"CLI test"}}');
  
  const scriptPath = path.resolve(fileURLToPath(import.meta.url), "../../claude/condense.mjs");
  const res = spawnSync(process.execPath, [scriptPath, inFile, outFile], { encoding: "utf8" });
  assert.strictEqual(res.status, 0);
  assert.ok(fs.readFileSync(outFile, "utf8").includes("CLI test"));

  // Error case: missing args
  const resErr = spawnSync(process.execPath, [scriptPath], { encoding: "utf8" });
  assert.strictEqual(resErr.status, 1);
  assert.ok(resErr.stderr.includes("usage: condense.mjs"));
});
