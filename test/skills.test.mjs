import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const skillsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "skills");
const skills = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

test("standalone skills exist", () => {
  assert.deepStrictEqual(skills.sort(), ["vault-recall", "vault-sync"]);
});

for (const skill of skills) {
  test(`${skill}/SKILL.md has valid frontmatter`, () => {
    const text = fs.readFileSync(path.join(skillsDir, skill, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
    const match = text.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(match, "should start with a YAML frontmatter block");
    const frontmatter = match[1];

    const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1].trim();
    assert.strictEqual(name, skill, "name should match the folder name");
    assert.match(name, /^[a-z0-9-]{1,64}$/, "name should be lowercase letters, digits and hyphens");

    const description = frontmatter.match(/^description:\s*>-\n((?:  .*\n?)+)/m)?.[1].replace(/\s+/g, " ").trim();
    assert.ok(description, "should have a description");
    assert.ok(description.length <= 1024, "description should be at most 1024 characters");

    assert.match(frontmatter, /^license:\s*MIT$/m);
    assert.ok(!/[A-Z]:\\Users\\(?!you\\)/.test(text), "should not contain a personal Windows path");
  });
}
