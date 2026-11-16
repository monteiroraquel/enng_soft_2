import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const prismaCli = require.resolve("prisma/build/index.js");
const result = spawnSync(process.execPath, [prismaCli, "migrate", "dev", "--name", "init"], {
  stdio: "inherit",
  env: { ...process.env, RUST_LOG: process.env.RUST_LOG ?? "info" },
});

process.exitCode = result.status ?? 1;
