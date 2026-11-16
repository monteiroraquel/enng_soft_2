import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, rmSync } from "node:fs";

const require = createRequire(import.meta.url);
const prismaCli = require.resolve("prisma/build/index.js");
const testDatabasePath = "tests/data/bytehub-test.db";
const databaseUrl = `file:./${testDatabasePath}`;
const artifacts = [testDatabasePath, `${testDatabasePath}-journal`, `${testDatabasePath}-wal`, `${testDatabasePath}-shm`];
const env = { ...process.env, DATABASE_URL: databaseUrl, RUST_LOG: process.env.RUST_LOG ?? "info", NODE_ENV: "test" };

mkdirSync("tests/data", { recursive: true });
for (const artifact of artifacts) rmSync(artifact, { force: true });

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

let exitCode = 1;
try {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    exitCode = run(process.execPath, [prismaCli, "migrate", "deploy"]);
    if (exitCode === 0 || attempt === 3) break;
    console.warn(`Falha ao iniciar o mecanismo Prisma; repetindo migração (${attempt + 1}/3).`);
  }
  if (exitCode === 0) exitCode = run(process.execPath, [prismaCli, "db", "seed"]);
  if (exitCode === 0) exitCode = run(process.execPath, ["--import", "tsx", "--test", "tests/api.test.ts"]);
} finally {
  for (const artifact of artifacts) rmSync(artifact, { force: true });
}

process.exitCode = exitCode;
