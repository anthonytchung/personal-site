import { readFile, writeFile, unlink } from "node:fs/promises";

const created: string[] = [];
function run(command: string[], fixtures = false) {
  const result = Bun.spawnSync(command, {
    stdout: "inherit", stderr: "inherit",
    env: { ...process.env, ...(fixtures ? { WRITING_FIXTURES: "1" } : {}) },
  });
  if (result.exitCode !== 0) throw new Error(`${command.join(" ")} failed`);
}

try {
  for (const [kind, folder] of [["journal", "journal"], ["travel", "travellogs"]]) {
    const target = `content/${folder}/publishing-verification-fixture.mdx`;
    await writeFile(target, await readFile(`tests/fixtures/writing/${kind}.mdx`), { flag: "wx" });
    created.push(target);
  }
  run(["bun", "run", "build"]);
  run(["bun", "run", "test:e2e", "tests/writing.spec.ts"], true);
} finally {
  for (const target of created) await unlink(target);
  // Never leave test articles in the production output, even when verification fails.
  run(["bun", "run", "build"]);
}
