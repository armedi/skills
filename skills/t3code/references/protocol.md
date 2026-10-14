# T3 Code WebSocket protocol

What `scripts/t3-run.mjs` speaks. Reach for it only when the script can't do the job.

- **Server:** the running app serves locally. Read `origin` from `$T3CODE_HOME/userdata/server-runtime.json` (default home `~/.t3`); it's usually `http://127.0.0.1:3773`. `$T3CODE_HOME/bin/t3 serve` starts a headless server but runs in the foreground, so ask the user to open the app instead.
- **Auth:**
  1. `$T3CODE_HOME/bin/t3 auth session issue --token-only --ttl 1h --label t3-run-script --scope orchestration:read --scope orchestration:operate` prints a bearer token. Read-only methods need only `orchestration:read`.
  2. `POST /api/auth/websocket-ticket` with `Authorization: Bearer <token>` returns `{ticket}`.
  3. Connect to `ws://127.0.0.1:<port>/ws?orchestrationProtocol=2&wsTicket=<ticket>`. Without `orchestrationProtocol=2` the server answers HTTP 426.
- **Frames:**
  - Request: `{"_tag":"Request","id":"1","tag":"<method>","payload":{...},"headers":[]}`
  - Reply: `{"_tag":"Exit","requestId","exit":{_tag:"Success",value}|{_tag:"Failure",cause}}`
  - Each WebSocket message is one JSON value (an array of messages is also accepted). Stream data arrives in `Chunk` frames; reply with `{"_tag":"Ack","requestId"}`, and end a stream with `{"_tag":"Interrupt","requestId"}`. Answer every `Ping` with `Pong`.
- **Methods:**
  - **`server.getConfig {}`** returns `providers[]`: `instanceId`, `displayName`, `enabled`, `installed`, `status`, `message`, `supportedRuntimeModes` (absent means all), and `models[]` of `{slug, name, isDefault, aliases, capabilities.optionDescriptors[]}` (e.g. `effort` with options `low`…`max`), plus `skills[]` (`name`, `path`, `scope`, `enabled`) and `slashCommands[]` for Claude.
  - **`orchestration.subscribeShell {}`** streams a `snapshot` with `projects[]` (`id`, `title`, `workspaceRoot`) and `threads[]`.
  - **`orchestration.launchThread`** creates a thread and sends its first message in one call. Payload: `{commandId, projectId, title, modelSelection:{instanceId, model, options?:[{id:"effort", value:"high"}]}, runtimeMode, interactionMode:"default"|"plan", workspaceStrategy:{type:"root"}, initialMessage:{messageId, text, attachments:[]}}`. A skill is invoked by starting the message text with `/<skill> ` (the script sends `/fusion <task>`). `runtimeMode` is one of `approval-required`, `auto-accept-edits`, `auto`, `full-access`.
  - **`orchestration.getThreadProjection {threadId}`**: poll it until the watched run is terminal (`completed`, `interrupted`, `failed`, `cancelled`, `rolled_back`). Active statuses: `preparing`, `starting`, `running`, `waiting`; queued runs have status `queued` and may be held (`queueHeld`).
  - Pending user actions are in `runtimeRequests[]` with `status:"pending"`. Run errors are in `turnItems[]` entries with `type:"error"` at `failure`.
  - **`orchestration.dispatchCommand`** takes the command object itself as its payload and returns `{sequence}`. Follow-ups use `message.dispatch` with required `createdBy` and `creationSource` (the script sends `"user"`/`"web"` like the web client) and required `dispatchMode` (`start_immediately`, `queue_after_active`, `steer_active`/`restart_active` with `targetRunId`, or `defer_start`), and optional `deliveryIntent:"steer"`, which resolves against the active run. The server queues start-immediately messages behind an active run. Find the resulting run by `runs[].userMessageId === messageId`, or by the matching `messages[].runId` for a steered message.
  - **`run.interrupt`** stops an active run; `holdQueue:true` keeps queued runs from starting. **`queue.resume`** clears the hold and advances the queue.
  - **Also available:** `orchestration.subscribeThread` and `getTurnDiff`.
