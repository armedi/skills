#!/usr/bin/env node
// Drive a T3 Code server over its WebSocket RPC (Effect RPC, JSON frames).
// Auth: bearer from `t3 auth session issue --token-only` (or T3_TOKEN env), exchanged for a wsTicket.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";
import os from "node:os";

const usage = `Usage:
  node t3-run.mjs --workspace <dir> (--prompt <text> | --prompt-file <path|->) [--title <title>] [--mode approval-required|auto-accept-edits|auto|full-access] [--timeout <seconds>] [--origin <url>] [--expect-file <path>] [--no-fusion] [--provider <instanceId>] [--model <slug>] [--effort <level>]
  node t3-run.mjs --workspace <dir> --preflight
  node t3-run.mjs --thread <threadId> (--prompt <text> | --prompt-file <path|->) [--steer] [--timeout <seconds>] [--origin <url>] [--expect-file <path>]
  node t3-run.mjs --thread <threadId> --interrupt [--timeout <seconds>] [--origin <url>]
  node t3-run.mjs --thread <threadId> --resume-queue [--timeout <seconds>] [--origin <url>]
  node t3-run.mjs --thread <threadId> [--timeout <seconds>] [--origin <url>]
  node t3-run.mjs --list-providers
  node t3-run.mjs --help

Defaults: provider claudeAgent, model claude-opus-5-5, effort high; launch prompts are prefixed with "/fusion ".
Exit 6: the fusion skill isn't available to Claude Code for the project.`;
const DEFAULT_PROVIDER = "claudeAgent";
const DEFAULT_MODEL = "claude-opus-5-5";
const DEFAULT_EFFORT = "high";
const FUSION_URL = "https://github.com/armedi/fusion-orchestrator";
const terminalStatuses = new Set(["completed", "interrupted", "failed", "cancelled", "rolled_back"]);
const activeStatuses = new Set(["preparing", "starting", "running", "waiting"]);
const modes = new Set(["approval-required", "auto-accept-edits", "auto", "full-access"]);
const result = { threadId: null, runId: null, status: null, exitCode: 1 };
let ws;

class TimeoutError extends Error {}
class DeadlineError extends TimeoutError {}

function closeSocket() {
  if (ws && ws.readyState < WebSocket.CLOSING) ws.close();
}

function compactJson(value) {
  try { return JSON.stringify(value); } catch { return String(value); }
}

function causeMessage(cause) {
  const messages = [];
  const seen = new Set();
  const addMessage = (message) => {
    const compact = message.replace(/\s+/g, " ").trim();
    if (compact) messages.push(compact);
  };
  const visit = (value) => {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    if (typeof value.message === "string") addMessage(value.message);
    if (typeof value.cause === "string") addMessage(value.cause);
    if (typeof value.defect === "string") addMessage(value.defect);
    for (const child of Object.values(value)) visit(child);
  };
  visit(cause);
  return [...new Set(messages)].join(": ") || compactJson(cause);
}

function hasInterruptTag(value, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return false;
  seen.add(value);
  return value._tag === "Interrupt" || Object.values(value).some((child) => hasInterruptTag(child, seen));
}

function rejectAll(pending, reason) {
  for (const entry of pending.values()) {
    clearTimeout(entry.timer);
    entry.reject(reason);
  }
  pending.clear();
}

function makeRpc(socket) {
  let nextId = 1;
  const pending = new Map();
  const streams = new Map();
  const rejectSocketWork = (reason) => {
    rejectAll(pending, reason);
    streams.clear();
  };

  socket.addEventListener("close", () => rejectSocketWork(new Error("WebSocket closed before RPC completed")));
  socket.addEventListener("error", () => rejectSocketWork(new Error("WebSocket connection error")));
  socket.addEventListener("message", (event) => {
    const raw = String(event.data);
    if (process.env.DEBUG === "1") console.error("<<", raw);
    try {
      const decoded = JSON.parse(raw);
      for (const message of Array.isArray(decoded) ? decoded : [decoded]) {
        if (message._tag === "Ping") {
          socket.send(JSON.stringify({ _tag: "Pong" }));
        } else if (message._tag === "Chunk") {
          streams.get(message.requestId)?.(message.values, message.requestId);
          socket.send(JSON.stringify({ _tag: "Ack", requestId: message.requestId }));
        } else if (message._tag === "Exit") {
          const entry = pending.get(message.requestId);
          if (entry) {
            pending.delete(message.requestId);
            clearTimeout(entry.timer);
            streams.delete(message.requestId);
            if (message.exit?._tag === "Success") entry.resolve(message.exit.value);
            else {
              const error = new Error(causeMessage(message.exit?.cause ?? message.exit));
              error.rpcCause = message.exit?.cause ?? message.exit;
              entry.reject(error);
            }
          }
        } else if (message._tag === "Defect") {
          console.error("WebSocket RPC defect:", causeMessage(message.defect));
          rejectSocketWork(new Error(`WebSocket RPC defect: ${causeMessage(message.defect)}`));
        }
      }
    } catch (error) {
      rejectSocketWork(new Error(`Invalid WebSocket RPC frame: ${error.message}`));
    }
  });

  return (tag, payload, onChunk, timeoutMs = 30_000) => new Promise((resolve, reject) => {
    const id = String(nextId++);
    if (socket.readyState !== WebSocket.OPEN) {
      reject(new Error("WebSocket is not open"));
      return;
    }
    const timer = setTimeout(() => {
      pending.delete(id);
      streams.delete(id);
      reject(new TimeoutError(`RPC ${tag} timed out after ${Math.ceil(timeoutMs / 1000)}s`));
    }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    if (onChunk) streams.set(id, onChunk);
    try {
      socket.send(JSON.stringify({ _tag: "Request", id, tag, payload, headers: [] }));
    } catch (error) {
      pending.delete(id);
      streams.delete(id);
      clearTimeout(timer);
      reject(error);
    }
  });
}

function parseOptions(argv) {
  const { values } = parseArgs({
    args: argv,
    strict: true,
    allowPositionals: false,
    options: {
      workspace: { type: "string" }, prompt: { type: "string" }, "prompt-file": { type: "string" }, provider: { type: "string" },
      model: { type: "string" }, mode: { type: "string" }, timeout: { type: "string" },
      title: { type: "string" }, origin: { type: "string" }, "expect-file": { type: "string" },
      thread: { type: "string" }, steer: { type: "boolean" }, interrupt: { type: "boolean" },
      "resume-queue": { type: "boolean" }, effort: { type: "string" }, "no-fusion": { type: "boolean" },
      preflight: { type: "boolean" },
      "list-providers": { type: "boolean" }, help: { type: "boolean" },
    },
  });
  if (values.help) return values;
  if (values["list-providers"]) {
    if (values.thread !== undefined) {
      throw new Error("--thread cannot be combined with launch options, --workspace <dir>, or --list-providers");
    }
    const incompatible = Object.keys(values).filter((key) =>
      !["list-providers", "origin"].includes(key) && values[key] !== undefined && values[key] !== false);
    if (incompatible.length) throw new Error(`--list-providers cannot be combined with ${incompatible.map((key) => `--${key}`).join(", ")}`);
    return values;
  }
  if (values.prompt !== undefined && values["prompt-file"] !== undefined) {
    throw new Error("--prompt and --prompt-file cannot be combined");
  }
  if (values["prompt-file"] !== undefined) {
    const promptPath = values["prompt-file"];
    try {
      values.prompt = promptPath === "-" ? readFileSync(0, "utf8") : readFileSync(promptPath, "utf8");
    } catch (error) {
      throw new Error(`Could not read prompt file ${promptPath}: ${error.message}`);
    }
    if (!values.prompt.trim()) throw new Error(`Prompt file ${promptPath} must not be empty or whitespace-only`);
  }
  const followUpActions = [values.interrupt, values["resume-queue"], values.prompt !== undefined].filter(Boolean).length;
  if (values.thread !== undefined) {
    if (["provider", "model", "effort", "title", "mode", "workspace", "no-fusion", "preflight"].some((key) => values[key] !== undefined && values[key] !== false)) {
      throw new Error("--thread cannot be combined with launch options or --workspace <dir>");
    }
    if (values.steer && values.prompt === undefined) throw new Error("--steer requires --thread and --prompt or --prompt-file");
    if (followUpActions > 1) throw new Error("--interrupt, --resume-queue, and --prompt or --prompt-file are mutually exclusive");
    if (values["expect-file"] !== undefined && values.prompt === undefined) throw new Error("--expect-file requires --prompt or --prompt-file");
    values.timeout = values.timeout === undefined ? 600 : Number(values.timeout);
    if (!Number.isFinite(values.timeout) || values.timeout <= 0) throw new Error("--timeout must be a positive number of seconds");
    return values;
  }
  if (values.interrupt || values["resume-queue"]) throw new Error("--interrupt and --resume-queue require --thread");
  if (values.steer) throw new Error("--steer requires --thread and --prompt or --prompt-file");
  values.provider ??= DEFAULT_PROVIDER;
  values.model ??= DEFAULT_MODEL;
  values.effort ??= values.provider === DEFAULT_PROVIDER ? DEFAULT_EFFORT : undefined;
  if (values.preflight) {
    if (values.workspace === undefined) throw new Error("--preflight requires --workspace");
    return values;
  }
  for (const key of ["workspace", "prompt"]) {
    if (values[key] === undefined) throw new Error(`Missing required option --${key}`);
  }
  if (values.mode !== undefined && !modes.has(values.mode)) throw new Error(`Invalid --mode: ${values.mode}`);
  values.mode ??= "auto";
  values.timeout = values.timeout === undefined ? 600 : Number(values.timeout);
  if (!Number.isFinite(values.timeout) || values.timeout <= 0) throw new Error("--timeout must be a positive number of seconds");
  if (values.title === undefined) {
    const firstLine = values.prompt.split(/\r?\n/, 1)[0].trim();
    values.title = firstLine ? `API: ${firstLine}`.slice(0, 40).trim() : "API run";
  }
  if (!values.title.trim()) throw new Error("--title must not be empty");
  return values;
}

async function connect(origin) {
  const bearer = token();
  let response;
  try {
    response = await fetch(`${origin}/api/auth/websocket-ticket`, {
      method: "POST",
      headers: { authorization: `Bearer ${bearer}` },
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    throw new Error(`Could not connect to ${origin}; the T3 Code server may not be running (stale runtime file). ${error.message}`);
  }
  if (!response.ok) throw new Error(`WebSocket ticket request failed: ${response.status} ${await response.text()}`);
  const { ticket } = await response.json();
  const socket = new WebSocket(`${origin.replace(/^http/, "ws")}/ws?orchestrationProtocol=2&wsTicket=${encodeURIComponent(ticket)}`);
  ws = socket;
  const opened = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError("WebSocket connection timed out after 30s")), 30_000);
    socket.addEventListener("open", () => { clearTimeout(timer); resolve(); }, { once: true });
    socket.addEventListener("error", () => { clearTimeout(timer); reject(new Error("WebSocket connection error")); }, { once: true });
    socket.addEventListener("close", () => { clearTimeout(timer); reject(new Error("WebSocket closed before connecting")); }, { once: true });
  });
  await opened;
  return makeRpc(socket);
}

function token() {
  if (process.env.T3_TOKEN) return process.env.T3_TOKEN;
  const home = process.env.T3CODE_HOME || path.join(os.homedir(), ".t3");
  try {
    return execFileSync(path.join(home, "bin", "t3"),
      ["auth", "session", "issue", "--token-only", "--ttl", "1h", "--label", "t3-run-script",
        "--scope", "orchestration:read", "--scope", "orchestration:operate"],
      { stdio: ["ignore", "pipe", "pipe"], timeout: 30_000 }).toString().trim();
  } catch (error) {
    const stderr = error.stderr?.toString() ?? "";
    throw new Error(`Could not obtain T3 auth token.${stderr ? `\n${stderr}` : ` ${error.message}`}`);
  }
}

async function getProjects(rpc) {
  let foundSnapshot = false;
  let projects = [];
  try {
    await rpc("orchestration.subscribeShell", {}, (values, requestId) => {
      if (foundSnapshot) return;
      for (const item of values ?? []) {
        if (item.kind !== "snapshot") continue;
        foundSnapshot = true;
        projects = item.snapshot?.projects ?? [];
        ws.send(JSON.stringify({ _tag: "Interrupt", requestId }));
        break;
      }
    });
  } catch (error) {
    if (!foundSnapshot || !hasInterruptTag(error.rpcCause)) throw error;
  }
  if (!foundSnapshot) throw new Error("Project list stream ended without a snapshot");
  return projects;
}

function resolveWorkspace(directory) {
  let resolved;
  try {
    resolved = realpathSync(directory);
  } catch (error) {
    throw Object.assign(new Error(`Workspace directory does not exist or cannot be resolved: ${directory}: ${error.message}`), { exitCode: 2 });
  }
  try {
    if (!statSync(resolved).isDirectory()) {
      throw Object.assign(new Error(`Workspace path is not a directory: ${directory}`), { exitCode: 2 });
    }
  } catch (error) {
    if (error.exitCode !== undefined) throw error;
    throw Object.assign(new Error(`Workspace directory cannot be accessed: ${directory}: ${error.message}`), { exitCode: 2 });
  }
  const git = (cwd, args) => {
    try {
      const env = { ...process.env };
      for (const key of ["GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_INDEX_FILE"]) {
        delete env[key];
      }
      return execFileSync("git", ["-C", cwd, ...args],
        { encoding: "utf8", env, stdio: ["ignore", "pipe", "pipe"], timeout: 10_000 });
    } catch {
      return null;
    }
  };
  const topLevelOutput = git(resolved, ["rev-parse", "--show-toplevel"]);
  const topLevel = topLevelOutput?.replace(/\n$/, "");
  if (!topLevel) return { projectRoot: resolved, worktree: null };

  let top;
  try {
    top = realpathSync(topLevel);
  } catch {
    return { projectRoot: resolved, worktree: null };
  }
  const worktreeList = git(resolved, ["worktree", "list", "--porcelain", "-z"]);
  if (worktreeList === null) {
    throw Object.assign(new Error(`Could not list git worktrees for ${top}; cannot determine the main checkout`), { exitCode: 2 });
  }
  let mainRoot = top;
  const worktreeFields = worktreeList.split("\0");
  const firstRecordEnd = worktreeFields.indexOf("");
  const firstRecord = worktreeFields.slice(0, firstRecordEnd < 0 ? undefined : firstRecordEnd);
  if (!firstRecord.includes("bare")) {
    const mainPath = firstRecord.find((field) => field.startsWith("worktree "))?.slice("worktree ".length);
    if (!mainPath) {
      throw Object.assign(new Error(`Could not determine the main checkout for git repository ${top}`), { exitCode: 2 });
    }
    try {
      mainRoot = realpathSync(mainPath);
    } catch {
      throw Object.assign(new Error(`Main checkout ${mainPath} for worktree ${top} is missing; run \`git worktree repair\` or pass the main checkout`), { exitCode: 2 });
    }
  }
  if (top === mainRoot) return { projectRoot: mainRoot, worktree: null };
  const branch = git(top, ["symbolic-ref", "--short", "-q", "HEAD"])?.trim() || null;
  return { projectRoot: mainRoot, worktree: { path: top, branch } };
}

function normalizeWorkspaceRoot(workspaceRoot) {
  try {
    return realpathSync(workspaceRoot);
  } catch {
    return path.resolve(workspaceRoot);
  }
}

async function workspaceProject(rpc, directory) {
  const findProject = (projects) => projects.find((project) =>
    normalizeWorkspaceRoot(project.workspaceRoot) === directory);
  let project = findProject(await getProjects(rpc));
  if (project) {
    console.log(`project\t${project.id}\t${project.title}\t${project.workspaceRoot}`);
  } else {
    const home = process.env.T3CODE_HOME || path.join(os.homedir(), ".t3");
    try {
      execFileSync(path.join(home, "bin", "t3"), ["project", "add", directory],
        { stdio: ["ignore", "pipe", "pipe"], timeout: 30_000 });
    } catch (error) {
      const stderr = error.stderr?.toString().trim() ?? "";
      throw new Error(`Could not add T3 project for ${directory}.${stderr ? `\n${stderr}` : ` ${error.message}`}`);
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 500));
      project = findProject(await getProjects(rpc));
      if (project) break;
    }
    if (!project) throw new Error(`T3 project was added for ${directory}, but it was not listed afterwards`);
    console.log(`created\t${project.id}\t${project.title}\t${project.workspaceRoot}`);
  }
  return project;
}

async function listProviders(rpc) {
  const config = await rpc("server.getConfig", {});
  if (!Array.isArray(config?.providers)) throw new Error("Server config has no providers array");
  for (const provider of config.providers) {
    const modes = Array.isArray(provider.supportedRuntimeModes) ? provider.supportedRuntimeModes.join(",") : "all";
    const header = ["provider", provider.instanceId, provider.displayName, provider.status, `modes=${modes}`];
    if (typeof provider.message === "string" && provider.message) header.push(provider.message);
    console.log(header.join("\t"));
    if (provider.enabled === true && provider.installed === true) {
      for (const model of provider.models ?? []) {
        const effort = (model.capabilities?.optionDescriptors ?? []).find((item) => item.id === "effort");
        const extras = [];
        if (model.isDefault === true) extras.push("default");
        if (effort) extras.push(`effort=${(effort.options ?? []).map((item) => item.id).join(",")}`);
        console.log(`  ${model.slug}\t${model.name}${extras.map((item) => `\t${item}`).join("")}`);
      }
    }
  }
  result.status = "completed";
  result.exitCode = 0;
}

// Finds a fusion skill that `/fusion` resolves to: the user skills T3 reports for the provider, then the
// project's and the user's .claude/skills. Plugin skills are namespaced (`/<plugin>:fusion`), so they don't count.
// macOS can block this process from ~/Desktop, ~/Documents and ~/Downloads (EPERM); a project there is unverified, not missing.
function findFusionSkill(config, instanceId, workspaceRoot) {
  const provider = (config?.providers ?? []).find((item) => item.instanceId === instanceId);
  const skill = (provider?.skills ?? []).find((item) => item.name === "fusion" && item.enabled !== false);
  if (skill) return skill.path ?? "reported by T3 Code";
  const claudeHome = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
  for (const file of [path.join(workspaceRoot, ".claude/skills/fusion/SKILL.md"), path.join(claudeHome, "skills/fusion/SKILL.md")]) {
    try {
      statSync(file);
      return file;
    } catch (error) {
      if (error.code === "EPERM") return `${file} (unverified: macOS blocked access)`;
    }
  }
  return null;
}

async function preflight(rpc, options) {
  const config = await rpc("server.getConfig", {});
  const provider = (config?.providers ?? []).find((item) => item.instanceId === options.provider);
  if (!provider) throw Object.assign(new Error(`Provider ${options.provider} not found; run --list-providers`), { exitCode: 2 });
  if (provider.enabled !== true || provider.installed !== true) {
    throw Object.assign(new Error(`Provider ${options.provider} is not enabled/installed in T3 Code (status ${provider.status})`), { exitCode: 1 });
  }
  const model = (provider.models ?? []).find((item) => item.slug === options.model || (item.aliases ?? []).includes(options.model));
  if (!model) throw Object.assign(new Error(`Model ${options.model} is not listed under ${options.provider}`), { exitCode: 2 });
  options.model = model.slug;
  if (options.effort !== undefined) {
    const effort = (model.capabilities?.optionDescriptors ?? []).find((item) => item.id === "effort");
    if (!effort || !(effort.options ?? []).some((item) => item.id === options.effort)) {
      throw Object.assign(new Error(`Effort ${options.effort} is not offered for ${model.slug}`), { exitCode: 2 });
    }
  }
  console.log(`model\t${provider.instanceId}\t${model.slug}\teffort=${options.effort ?? "default"}`);
  const project = await workspaceProject(rpc, options.workspaceResolution.projectRoot);
  if (options.workspaceResolution.worktree) {
    const { path: worktreePath, branch } = options.workspaceResolution.worktree;
    console.log(`worktree\t${worktreePath}\t${branch ?? "detached"}`);
  }
  if (options["no-fusion"]) return project;
  const fusionRoot = options.workspaceResolution.worktree?.path ?? options.workspaceResolution.projectRoot;
  const skill = findFusionSkill(config, provider.instanceId, fusionRoot);
  if (!skill) {
    throw Object.assign(new Error(`Fusion skill not found for ${fusionRoot} (checked T3's skill list, .claude/skills/fusion in the project, and ~/.claude/skills/fusion). Install it from ${FUSION_URL}`), { exitCode: 6 });
  }
  console.log(`fusion\t${skill}`);
  return project;
}

function reportTerminal(projection, run) {
  const errors = [];
  for (const item of projection.turnItems ?? []) {
    if (item.type !== "error" || item.runId !== run.id || !item.failure) continue;
    const failure = item.failure;
    const line = `error [${failure.class ?? "unknown"}]: ${failure.message ?? "Unknown error"}`;
    if (!errors.includes(line)) errors.push(line);
  }
  if (errors.length) for (const line of errors) console.log(line);
  else if (run.status !== "completed") console.log(`run ended ${run.status} with no error item`);

  const answer = (projection.messages ?? []).filter((message) =>
    message.runId === run.id && message.role === "assistant" && !message.streaming).at(-1);
  if (answer) console.log(`--- assistant ---\n${answer.text}`);
}

function latestRun(runs) {
  return runs.reduce((latest, run) => !latest || (run.ordinal ?? -Infinity) > (latest.ordinal ?? -Infinity) ? run : latest, null);
}

function nonMonitorRuns(projection) {
  const monitorRuns = new Set((projection.messages ?? []).filter((message) =>
    message.notification?.source?.kind === "monitor").map((message) => message.runId));
  return (projection.runs ?? []).filter((run) => !monitorRuns.has(run.id));
}

function latestWorkRun(projection) {
  return latestRun(nonMonitorRuns(projection));
}

function runRanAfter(run, other) {
  const end = (item) => !item.completedAt ? Infinity : Date.parse(item.completedAt);
  return end(run) === end(other) ? run.ordinal > other.ordinal : end(run) > end(other);
}

function subagentWaiting(task) {
  return ["pending", "running", "waiting"].includes(task.status)
    || ["pending", "claimed"].includes(task.completionDelivery?.state);
}

// Mirrors T3's server-side delegatedTaskProgress.
function delegatedTaskProgress(projection) {
  const runs = nonMonitorRuns(projection).filter((run) => run.status !== "rolled_back");
  const active = runs.some((run) => !terminalStatuses.has(run.status) && !(run.status === "queued" && run.queueHeld === true));
  const children = (projection.subagents ?? []).some(subagentWaiting)
    || (projection.providerThreads ?? []).some((thread) => (thread.pendingBackgroundTasks ?? []).length > 0);
  const resultRun = runs.filter((run) => terminalStatuses.has(run.status) && (run.startedAt != null || run.ordinal === 1))
    .toSorted((a, b) => runRanAfter(a, b) ? -1 : runRanAfter(b, a) ? 1 : 0)[0];
  return { state: active || resultRun === undefined ? "working" : children ? "waiting_for_children" : "result_available", resultRun, active, children };
}

function followUpRun(projection, messageId) {
  const runs = projection.runs ?? [];
  return runs.find((run) => run.userMessageId === messageId)
    ?? runs.find((run) => run.id === (projection.messages ?? []).find((message) => message.id === messageId)?.runId)
    ?? null;
}

async function monitor(rpc, threadId, initialProjection, options, selectRun, monitorOptions = {}) {
  result.threadId = threadId;
  console.log("thread", result.threadId);
  const deadline = Date.now() + options.timeout * 1000;
  let lastStatus = "";
  let lastWaitingCount = null;
  let watchedRun = null;
  let projection = initialProjection;
  const poll = async () => {
    while (true) {
      if (Date.now() >= deadline) throw new DeadlineError();
      if (!projection) projection = await rpc("orchestration.getThreadProjection", { threadId: result.threadId });
      if (Date.now() >= deadline) throw new DeadlineError();
      const runs = projection.runs ?? [];
      const run = watchedRun ? runs.find((item) => item.id === watchedRun.id) ?? watchedRun : selectRun(projection);
      const request = (projection.runtimeRequests ?? []).find((item) => item.status === "pending");
      if (run && terminalStatuses.has(run.status) && !monitorOptions.anyTerminalSuccess) watchedRun = run;
      const progress = watchedRun ? delegatedTaskProgress(projection) : null;
      if (run) {
        result.runId = run.id;
        result.status = progress?.state ?? run.status;
        const followed = watchedRun ? latestRun(nonMonitorRuns(projection).filter((item) =>
          !terminalStatuses.has(item.status) && item.status !== "queued")) ?? latestWorkRun(projection) ?? run : run;
        const status = `${followed.id}:${followed.status}`;
        if (status !== lastStatus) {
          console.log("runs:", followed.status + (followed.id !== run.id ? ` (run ${followed.ordinal})` : ""));
          lastStatus = status;
        }
      } else if (!lastStatus) {
        console.log("runs: waiting for watched run");
        lastStatus = "waiting for watched run";
      }
      if (!monitorOptions.anyTerminalSuccess && request) {
        console.log(`thread ${result.threadId} has pending request ${request.id} (${request.kind}); answer it in the T3 Code app, or relaunch with a --mode the provider supports, e.g. full-access`);
        result.exitCode = 3;
        return;
      }
      if (monitorOptions.noRunsMessage && nonMonitorRuns(projection).length === 0) {
        console.log("thread has no runs");
        result.exitCode = 0;
        return;
      }
      const held = run?.status === "queued" && run.queueHeld === true;
      if (!monitorOptions.anyTerminalSuccess && held) {
        console.log(`thread ${result.threadId} run ${run.id} is queued and held; resume it with --resume-queue or in the T3 Code app`);
        result.exitCode = 3;
        return;
      }
      if (run && terminalStatuses.has(run.status)) {
        if (monitorOptions.anyTerminalSuccess) {
          console.log(`run ${run.id} ended ${run.status}`);
          const heldCount = runs.filter((item) => item.status === "queued" && item.queueHeld === true).length;
          if (heldCount) console.log(`queue held: ${heldCount} run(s); resume with --resume-queue`);
          result.exitCode = 0;
          return;
        }
        for (const task of projection.subagents ?? []) {
          if (!["pending", "running", "waiting"].includes(task.status) || !task.childThreadId) continue;
          const childProjection = await rpc("orchestration.getThreadProjection", { threadId: task.childThreadId }).catch(() => null);
          if (Date.now() >= deadline) throw new DeadlineError();
          const childRequest = (childProjection?.runtimeRequests ?? []).find((item) => item.status === "pending");
          if (childRequest) {
            console.log(`thread ${result.threadId} subagent "${task.title}" (thread ${task.childThreadId}) has pending request ${childRequest.id} (${childRequest.kind}); answer it in the T3 Code app`);
            result.exitCode = 3;
            return;
          }
        }
        const heldRun = progress.state !== "result_available" && !progress.active
          && nonMonitorRuns(projection).find((item) => item.status === "queued" && item.queueHeld === true);
        if (heldRun) {
          console.log(`thread ${result.threadId} run ${heldRun.id} is queued and held; resume it with --resume-queue or in the T3 Code app`);
          result.runId = heldRun.id;
          result.exitCode = 3;
          return;
        }
        if (progress.state === "result_available" || (!progress.active && !progress.children)) {
          const finalRun = progress.resultRun && (progress.resultRun.id === run.id || runRanAfter(progress.resultRun, run))
            ? progress.resultRun : run;
          result.runId = finalRun.id;
          result.status = finalRun.status;
          reportTerminal(projection, finalRun);
          if (finalRun.status !== "completed") result.exitCode = 1;
          else if (options["expect-file"] && !existsSync(options["expect-file"])) {
            console.error(`Expected file missing: ${options["expect-file"]}`);
            result.exitCode = 5;
          } else {
            result.exitCode = 0;
            if (options["expect-file"]) console.log(`--- ${options["expect-file"]} ---\n${readFileSync(options["expect-file"], "utf8")}`);
          }
          const heldCount = runs.filter((item) => item.status === "queued" && item.queueHeld === true).length;
          if (heldCount) console.log(`queue held: ${heldCount} run(s); resume with --resume-queue`);
          return;
        }
        const waitingCount = (projection.subagents ?? []).filter(subagentWaiting).length;
        if (waitingCount !== lastWaitingCount && (waitingCount > 0 || lastWaitingCount !== null)) {
          console.log(`runs: waiting for ${waitingCount} subagent(s)`);
          lastWaitingCount = waitingCount;
        }
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw new DeadlineError();
      await new Promise((resolve) => setTimeout(resolve, Math.min(3000, remaining)));
      projection = await rpc("orchestration.getThreadProjection", { threadId: result.threadId });
      if (Date.now() >= deadline) throw new DeadlineError();
    }
  };
  let timer;
  const deadlinePromise = new Promise((_, reject) => {
    const arm = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        closeSocket();
        reject(new DeadlineError());
      } else timer = setTimeout(arm, Math.min(remaining, 2_147_483_647));
    };
    arm();
  });
  try {
    await Promise.race([poll(), deadlinePromise]);
  } finally {
    clearTimeout(timer);
  }
}

async function dispatchCommand(rpc, command) {
  return rpc("orchestration.dispatchCommand", command);
}

async function runThreadAction(rpc, options) {
  const threadId = options.thread;
  result.threadId = threadId;
  if (options.interrupt) {
    const projection = await rpc("orchestration.getThreadProjection", { threadId });
    const run = latestRun((projection.runs ?? []).filter((item) => activeStatuses.has(item.status)));
    if (!run) {
      console.log("thread", threadId);
      console.log("no active run to interrupt");
      result.exitCode = 0;
      return;
    }
    result.runId = run.id;
    result.status = run.status;
    try {
      await dispatchCommand(rpc, {
        type: "run.interrupt", commandId: randomUUID(), threadId, runId: run.id,
        reason: "Interrupted via t3-run script", holdQueue: true,
      });
    } catch (error) {
      if (!error.message.includes("not interruptible")) throw error;
      const refreshed = await rpc("orchestration.getThreadProjection", { threadId });
      const current = (refreshed.runs ?? []).find((item) => item.id === run.id);
      if (!current || !terminalStatuses.has(current.status)) throw error;
      await monitor(rpc, threadId, refreshed, options, (value) => (value.runs ?? []).find((item) => item.id === run.id), { anyTerminalSuccess: true });
      return;
    }
    await monitor(rpc, threadId, null, options, (value) => (value.runs ?? []).find((item) => item.id === run.id), { anyTerminalSuccess: true });
    return;
  }
  if (options["resume-queue"]) {
    await dispatchCommand(rpc, { type: "queue.resume", commandId: randomUUID(), threadId });
  } else if (options.prompt !== undefined) {
    const messageId = randomUUID();
    const command = {
      type: "message.dispatch", commandId: randomUUID(), threadId, messageId, text: options.prompt, attachments: [],
      createdBy: "user", creationSource: "web",
      dispatchMode: { type: "start_immediately" },
    };
    if (options.steer) command.deliveryIntent = "steer";
    await dispatchCommand(rpc, command);
    await monitor(rpc, threadId, null, options, (projection) => followUpRun(projection, messageId));
    return;
  }
  await monitor(rpc, threadId, null, options, latestWorkRun, { noRunsMessage: true });
}

async function main() {
  if (typeof WebSocket === "undefined") {
    console.error(`Node 22+ required (found ${process.version})`);
    result.exitCode = 2;
    return;
  }
  let options;
  try {
    options = parseOptions(process.argv.slice(2));
  } catch (error) {
    console.error(`${error.message}\n${usage}`);
    result.exitCode = 2;
    return;
  }
  if (options.help) {
    console.log(usage);
    result.exitCode = 0;
    return;
  }

  if (options.workspace !== undefined) {
    try {
      options.workspaceResolution = resolveWorkspace(options.workspace);
    } catch (error) {
      console.error(error.message);
      result.exitCode = error.exitCode ?? 2;
      return;
    }
  }

  const home = process.env.T3CODE_HOME || path.join(os.homedir(), ".t3");
  const runtimePath = path.join(home, "userdata", "server-runtime.json");
  if (!existsSync(runtimePath)) {
    console.error(`T3 Code server isn't running (no ${runtimePath}). Open the app or run \`t3 serve\`.`);
    result.exitCode = 1;
    return;
  }
  let runtime;
  try { runtime = JSON.parse(readFileSync(runtimePath, "utf8")); }
  catch (error) {
    console.error(`Could not read T3 Code runtime file ${runtimePath}: ${error.message}`);
    result.exitCode = 1;
    return;
  }
  const origin = options.origin ?? runtime.origin;
  try {
    const rpc = await connect(origin);
    if (options["list-providers"]) {
      await listProviders(rpc);
      return;
    }
    if (options.thread !== undefined) {
      try {
        await runThreadAction(rpc, options);
      } catch (error) {
        if (!(error instanceof DeadlineError)) throw error;
        result.exitCode = 4;
        console.error(`Timed out; thread is still running in T3 Code: ${options.thread}`);
      }
      return;
    }
    let project;
    try {
      project = await preflight(rpc, options);
    } catch (error) {
      if (error.exitCode === undefined) throw error;
      console.error(error.message);
      result.exitCode = error.exitCode;
      return;
    }
    if (options.preflight) {
      result.status = "completed";
      result.exitCode = 0;
      return;
    }
    const prompt = options["no-fusion"] || /^\s*\/fusion(\s|$)/.test(options.prompt) ? options.prompt : `/fusion ${options.prompt}`;
    const modelSelection = { instanceId: options.provider, model: options.model };
    if (options.effort !== undefined) modelSelection.options = [{ id: "effort", value: options.effort }];
    const commandId = randomUUID();
    // Launch waits for durable run creation; a client timeout can cause duplicate retries.
    const initialMessageId = randomUUID();
    const launch = await rpc("orchestration.launchThread", {
      commandId,
      threadId: commandId,
      projectId: project.id,
      title: options.title,
      modelSelection,
      runtimeMode: options.mode,
      interactionMode: "default",
      workspaceStrategy: options.workspaceResolution.worktree
        ? {
          type: "existing_worktree",
          worktreePath: options.workspaceResolution.worktree.path,
          ...(options.workspaceResolution.worktree.branch ? { branch: options.workspaceResolution.worktree.branch } : {}),
        }
        : { type: "root" },
      initialMessage: { messageId: initialMessageId, text: prompt, attachments: [] },
    }, undefined, 120_000);
    try {
      await monitor(rpc, launch.threadId, launch.projection, options, (projection) =>
        (projection.runs ?? []).find((run) => run.userMessageId === initialMessageId) ?? latestWorkRun(projection));
    } catch (error) {
      if (!(error instanceof DeadlineError)) throw error;
      result.exitCode = 4;
      console.error(`Timed out; thread is still running in T3 Code: ${launch.threadId}`);
    }
  } catch (error) {
    console.error(error.message);
    result.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  result.exitCode = 1;
} finally {
  closeSocket();
  console.log(`result ${JSON.stringify(result)}`);
  process.exitCode = result.exitCode;
  setTimeout(() => process.exit(), 2000).unref();
}
