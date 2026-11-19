import { readFile, writeFile, unlink, mkdir, rmdir } from "node:fs/promises";

const created: string[] = [];
const imageDirectory = "public/images/__photo-viewer-fixtures";
let imageDirectoryCreated = false;
function run(command: string[], fixtures = false) {
  const result = Bun.spawnSync(command, {
    stdout: "inherit", stderr: "inherit",
    env: { ...process.env, ...(fixtures ? { WRITING_FIXTURES: "1" } : {}) },
  });
  if (result.exitCode !== 0) throw new Error(`${command.join(" ")} failed`);
}

try {
  await mkdir("public/images", { recursive: true });
  // Refuse to touch any pre-existing directory or photograph at the fixture path.
  await mkdir(imageDirectory);
  imageDirectoryCreated = true;
  for (const filename of ["landscape.svg", "portrait.svg"]) {
    const target = `${imageDirectory}/${filename}`;
    await writeFile(target, await readFile(`tests/fixtures/photos/${filename}`), { flag: "wx" });
    created.push(target);
  }
  for (const [kind, folder] of [["journal", "journal"], ["travel", "travellogs"]]) {
    const target = `content/${folder}/publishing-verification-fixture.mdx`;
    await writeFile(target, await readFile(`tests/fixtures/writing/${kind}.mdx`), { flag: "wx" });
    created.push(target);
  }
  run(["bun", "run", "build"]);
  run(["bun", "run", "test:e2e", "tests/writing.spec.ts", "tests/photo-viewer.spec.ts"], true);
} finally {
  for (const target of created) await unlink(target);
  if (imageDirectoryCreated) await rmdir(imageDirectory);
  // Never leave test articles in the production output, even when verification fails.
  run(["bun", "run", "build"]);
}
