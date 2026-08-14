import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";
import { log, truncate, summarizeToolInput, condense, main } from "../claude/vault-sync.mjs";

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
  assert.strictEqual(summarizeToolInput("Unknown", { arg: 1 }), '{"arg":1}');
  assert.strictEqual(summarizeToolInput("Bash", null), "");
  
  const circular = {};
  circular.self = circular;
  assert.strictEqual(summarizeToolInput("Unknown", circular), "");
});

test("log", () => {
  const tmpFile = path.join(os.tmpdir(), `test-log-${Date.now()}.log`);
  log("test message", tmpFile);
  const content = fs.readFileSync(tmpFile, "utf8");
  assert.ok(content.includes("test message"));
});

test("condense", async () => {
  const tmpDir = os.tmpdir();
  const inFile = path.join(tmpDir, "test-vault-in.jsonl");

  const lines = [
    '{"type":"summary","summary":"Test session"}',
    'invalid json',
    '{"type":"user","message":{"role":"user","content":"Hello"}}',
    '{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"Hi there"},{"type":"tool_use","name":"Bash","input":{"command":"ls"}}]}}',
  ];

  fs.writeFileSync(inFile, lines.join("\n"));

  const outContent = await condense(inFile);
  assert.ok(outContent.includes("### [SUMMARY] Test session"));
  assert.ok(outContent.includes("**user** (): Hello"));
  assert.ok(outContent.includes("**assistant** (): Hi there"));
  assert.ok(outContent.includes("- [tool_use] Bash: `ls`"));
});

test("main - missing JSON payload", async () => {
  const logFile = path.join(os.tmpdir(), "test-main-log.log");
  await main("invalid json", "/tmp/vault", logFile, {});
  const logContent = fs.readFileSync(logFile, "utf8");
  assert.ok(logContent.includes("Could not parse stdin JSON"));
});

test("main - cwd inside vault", async () => {
  const logFile = path.join(os.tmpdir(), "test-main-log2.log");
  // If cwd is inside vaultRoot, it should skip
  await main('{"cwd": "/tmp/vault/project"}', "/tmp/vault", logFile, {});
  const logContent = fs.readFileSync(logFile, "utf8");
  assert.ok(logContent.includes("Skip: session cwd is inside the vault itself"));
});

test("main - no transcript", async () => {
  const logFile = path.join(os.tmpdir(), "test-main-log3.log");
  await main('{"cwd": "/tmp/outside"}', "/tmp/vault", logFile, {});
  const logContent = fs.readFileSync(logFile, "utf8");
  assert.ok(logContent.includes("Skip: no transcript_path given"));
});

test("main - full execution", async () => {
  const logFile = path.join(os.tmpdir(), "test-main-log4.log");
  const tmpDir = os.tmpdir();
  const transcriptPath = path.join(tmpDir, "test-transcript.jsonl");
  const longText = "A".repeat(200);
  fs.writeFileSync(transcriptPath, '{"type":"user","message":{"role":"user","content":"' + longText + '"}}');
  
  // Suppress spawn errors by ignoring them
  try {
    await main(JSON.stringify({
      cwd: "/tmp/outside",
      transcript_path: transcriptPath
    }), "/tmp/vault", logFile, {});
  } catch (e) {
    // Ignore ENOENT from spawn
  }
  const logContent = fs.readFileSync(logFile, "utf8");
  assert.ok(logContent.includes("Spawned vault sync for project"));
});

test("main - trivial session", async () => {
  const logFile = path.join(os.tmpdir(), "test-main-log5.log");
  const tmpDir = os.tmpdir();
  const transcriptPath = path.join(tmpDir, "test-transcript-trivial.jsonl");
  fs.writeFileSync(transcriptPath, '{"type":"summary","summary":"Test session"}');
  
  await main(JSON.stringify({
    cwd: "/tmp/outside",
    transcript_path: transcriptPath
  }), "/tmp/vault", logFile, {});
  
  const logContent = fs.readFileSync(logFile, "utf8");
  assert.ok(logContent.includes("Skip: session too trivial"));
});

test("main - fallback transcript path", async () => {
  const logFile = path.join(os.tmpdir(), "test-main-log6.log");
  const cwd = path.join(os.tmpdir(), "my-test-project");
  const encoded = cwd.replace(/[:\\/]/g, "-");
  const projectDir = path.join(os.homedir(), ".claude", "projects", encoded);
  fs.mkdirSync(projectDir, { recursive: true });
  
  // Test no jsonl files
  await main(JSON.stringify({ cwd }), "/tmp/vault", logFile, {});
  let logContent = fs.readFileSync(logFile, "utf8");
  assert.ok(logContent.includes("Skip: no .jsonl files"));
  
  // Test with jsonl file
  fs.writeFileSync(path.join(projectDir, "session.jsonl"), '{"type":"user","message":{"role":"user","content":"' + "A".repeat(200) + '"}}');
  try {
    await main(JSON.stringify({ cwd }), "/tmp/vault", logFile, {});
  } catch (e) {}
  logContent = fs.readFileSync(logFile, "utf8");
  assert.ok(logContent.includes("Spawned vault sync"));
});

import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

test("CLI execution missing CLAUDE_VAULT_ROOT", () => {
  const scriptPath = path.resolve(fileURLToPath(import.meta.url), "../../claude/vault-sync.mjs");
  const env = { ...process.env };
  delete env.CLAUDE_VAULT_ROOT;
  const res = spawnSync(process.execPath, [scriptPath], { env, encoding: "utf8" });
  assert.strictEqual(res.status, 0); // Fails silently
});

test("CLI execution VAULT_SYNC_RUNNING", () => {
  const scriptPath = path.resolve(fileURLToPath(import.meta.url), "../../claude/vault-sync.mjs");
  const env = { ...process.env, CLAUDE_VAULT_ROOT: "/tmp/vault", VAULT_SYNC_RUNNING: "1" };
  const res = spawnSync(process.execPath, [scriptPath], { env, encoding: "utf8" });
  assert.strictEqual(res.status, 0); // Recursion guard
});

test("CLI execution success parsing stdin", () => {
  const scriptPath = path.resolve(fileURLToPath(import.meta.url), "../../claude/vault-sync.mjs");
  const env = { ...process.env, CLAUDE_VAULT_ROOT: "/tmp/vault" };
  const res = spawnSync(process.execPath, [scriptPath], { env, encoding: "utf8", input: "invalid json" });
  assert.strictEqual(res.status, 0);
});
