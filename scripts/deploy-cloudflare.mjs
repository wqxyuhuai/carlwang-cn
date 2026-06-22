import { spawnSync } from "node:child_process";

const branch =
  process.env.WORKERS_CI_BRANCH ||
  process.env.CF_PAGES_BRANCH ||
  process.env.GITHUB_REF_NAME ||
  "";

const isDemo = branch === "demo";
const passthroughArgs = process.argv.slice(2);
const args = isDemo
  ? ["wrangler", "deploy", "--env", "demo", ...passthroughArgs]
  : ["wrangler", "deploy", "--env=", ...passthroughArgs];

console.log(
  `Deploying Cloudflare Worker from ${branch || "unknown branch"} to ${
    isDemo ? "demo" : "top-level"
  } environment.`,
);

const result = spawnSync("npx", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
