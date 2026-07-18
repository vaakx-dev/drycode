# Pi's reusable non-TUI architecture

## Scope and pin

This is a source map, not a Drycode architecture decision. It answers which Pi
packages currently own the reusable runtime and where an independent Drycode
Harness would encounter presentation or application-shell boundaries.

The source was inspected at **`3da591ab74ab9ab407e72ed882600b2c851fae21`**
(`feat(coding-agent): add Hugging Face llama search`, the `main` tip at the time
of research). The pinned commit is [available in the first-party repository](https://github.com/badlogic/pi-mono/commit/3da591ab74ab9ab407e72ed882600b2c851fae21).
At this pin the published package scope is `@earendil-works/*`, although the
repository and this research ticket refer to it as Pi.

The Drycode framing used here is from [`CONTEXT.md`](../../CONTEXT.md): Pi is
an initial source for the independent **Drycode Harness**, not its compatibility
contract or ongoing identity.

## Boundary map

The monorepo has five relevant packages. The package manifests are the most
compact statement of the dependency direction: [`package.json`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/package.json),
[`ai/package.json`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/ai/package.json),
[`agent/package.json`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/package.json),
[`coding-agent/package.json`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/package.json),
[`tui/package.json`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/tui/package.json),
and [`orchestrator/package.json`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/orchestrator/package.json).

```text
@earendil-works/pi-ai       provider/model protocols, auth, streams, messages
             ▲
             │
@earendil-works/pi-agent-core  low-level loop + stateful Agent + generic AgentHarness
             ▲                         (the newer generic harness lives here)
             │
@earendil-works/pi-coding-agent  coding session, tools, resources, extensions,
             │                     settings, CLI, print/RPC/interactive adapters
             ├───────────────► @earendil-works/pi-tui (package-level dependency)
             ▲
@earendil-works/pi-orchestrator  experimental orchestration over coding-agent
```

`pi-ai` and `pi-agent-core` do not import `pi-tui`. `pi-coding-agent` does: its
manifest declares it as a runtime dependency, and its public index exports both
interactive components and the run modes alongside the SDK. Thus package-level
reuse of the coding-agent package pulls a presentation-oriented boundary even
when a caller uses `createAgentSession`.

### Package roles

| Package | Owns | TUI/application-shell status |
| --- | --- | --- |
| `pi-ai` | `Model`, `Provider`, `Models`, provider catalogs, API protocol adapters, auth/credentials, streaming events, tool-call message types | No TUI or coding-agent dependency; a clean lower seam. Node-specific helpers exist, so browser-safe entry points still need normal export selection. |
| `pi-agent-core` | `AgentMessage`, `AgentTool`, `AgentState`, `Agent`, low-level agent loop, tool-call lifecycle, queueing, stream/proxy hooks | The low-level package has no TUI import. Its newer `harness/` subtree is explicitly designed around host-supplied capabilities and has a Node-only entry point. |
| `pi-coding-agent` | Pi coding behavior: built-in tools, system prompt, settings, model runtime, resource discovery, extension runtime, JSONL session manager, compaction, SDK session, CLI and all three run modes | This is the mixed layer. Core files import interactive theme/TUI types; CLI and interactive components couple it to the Pi application shell. |
| `pi-tui` | Terminal differential renderer, editor, terminal and component primitives | Independent leaf package, but coding-agent extension types and interactive components depend on it. It is not needed by `pi-ai` or `pi-agent-core`. |
| `pi-orchestrator` | Experimental process/supervisor/storage orchestration | Depends on `pi-coding-agent`, so it is an application-shell consumer rather than an extraction source. |

## Model providers and the AI boundary

`pi-ai` defines the transport-independent data model and request boundary.
`Provider` owns provider identity, auth, model listing and streaming; `Models`
resolves credentials and delegates requests to the provider that owns a model.
The interfaces and delegation contract are in [`models.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/ai/src/models.ts#L66-L187).
`Model`, `Context`, content blocks, tool schemas, stream events and provider
options are in [`types.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/ai/src/types.ts).

Provider implementation has two separable axes:

* `src/providers/*.ts` contains provider factories and their static/dynamic
  catalogs. The `all` entry point explicitly constructs all built-ins and
  registers them in a `Models` collection ([`providers/all.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/ai/src/providers/all.ts#L43-L140)).
  Individual provider subpath exports are a credible bundle-size seam.
* `src/api/*.ts` implements wire protocols (Anthropic messages, OpenAI
  responses/completions, Google, Bedrock, Mistral, Pi messages, image APIs,
  and lazy wrappers). A provider can share an API implementation with other
  providers; the provider factory remains the auth/catalog/policy unit. This
  relationship is also documented in the [`pi-ai` README](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/ai/README.md#providers-and-models).
* `src/auth/` owns credential stores, API-key/environment resolution and OAuth
  helpers. The AI package's `Models` API exposes login/logout and auth checks,
  but does not prescribe a UI.

The result is a useful lower dependency direction for Drycode: a Harness can
own a `Models` instance (or a narrower provider interface), pass a model and
conversation `Context` to `streamSimple`, and keep provider-specific auth and
wire protocols below the coding-agent/session layer. The full `all` catalog is
not intrinsically required; providers can be selected individually.

## Agent loop and state

The low-level loop is in [`agent-loop.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/agent-loop.ts). It:

1. appends prompts to an `AgentContext`;
2. emits `agent_start`, turn and message lifecycle events;
3. streams an assistant response through the injected `StreamFn`;
4. validates and executes tool calls (sequentially or in parallel), emitting
   tool lifecycle events and tool results;
5. polls steering and follow-up queues between turns; and
6. terminates on a normal response, error/abort, or a caller's stop policy.

The contract and extension points are typed in [`agent/src/types.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/types.ts), including `convertToLlm`, context transformation, dynamic API-key lookup, before/after tool hooks, queue callbacks, and per-turn replacement state. It imports only `pi-ai` types/runtime. The low-level loop is therefore a stronger extraction seam than coding-agent's `AgentSession`.

`Agent` in [`agent.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/agent.ts) is the stateful wrapper: it owns the transcript, model/thinking/tool state, active run/abort controller, subscribers, steering/follow-up queues, and calls the loop. `Agent` deliberately works in `AgentMessage` until the LLM boundary; custom application messages can be filtered or projected by `convertToLlm`. The package README's [message flow and event sequence](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/README.md#agentmessage-vs-llm-message) documents that separation.

### The newer generic `AgentHarness`

At this pin `pi-agent-core` also contains an emerging, more independently
extractable harness in [`src/harness/agent-harness.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/harness/agent-harness.ts#L157-L385), exported from [`agent/src/index.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/index.ts#L1-L46). It directly calls `runAgentLoop`, owns phases, turn snapshots, queueing, pending session writes, model/thinking/tools/resources, provider hooks and save points; it does not wrap `Agent`.

Its constructor requires host-supplied [`ExecutionEnv`, `Session`, `Models`, tools, resources and system-prompt`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/harness/types.ts#L331-L479), which makes the ownership boundary explicit:

* `ExecutionEnv` is a filesystem and shell capability interface; operations
  return typed `Result` values rather than relying on a Node process.
* `Session` is a generic append/tree/context abstraction over a `SessionStorage`
  or `SessionRepo`. JSONL and in-memory implementations are separate files
  ([session types](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/harness/types.ts#L334-L492),
  [`session.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/harness/session/session.ts),
  and [`jsonl-repo.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/harness/session/jsonl-repo.ts)).
* Tool implementations and model/auth providers remain runtime dependencies of
  the host; the durable design explicitly says they are not serialized. See
  [`durable-harness.md`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/docs/durable-harness.md).
* Node process/filesystem behavior is isolated in [`harness/env/nodejs.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/harness/env/nodejs.ts), with `agent/node` as an explicit Node entry point. The generic root export does not need to expose that implementation.

This is a credible *source seam*, not evidence that the current generic
harness is finished: its own lifecycle document marks hook generalization,
recovery, auto-compaction/retry and final reentrancy hardening as remaining
work ([implementation todo](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/docs/agent-harness.md#implementation-todo)).

## Coding-agent session model

There are two distinct session abstractions at this pin.

### `AgentSession` (coding-agent integration)

[`AgentSession`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/agent-session.ts#L1-L105) is shared by interactive, print and RPC modes. Its configuration includes an `Agent`, `SessionManager`, `SettingsManager`, cwd, `ResourceLoader`, model runtime, tool definitions and extension runner bindings ([`AgentSessionConfig`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/agent-session.ts#L177-L230)). It adds coding-agent behavior above `Agent`:

* prompt/template/skill handling and system-prompt assembly;
* automatic event subscription and JSONL persistence;
* model and thinking-level changes;
* compaction, overflow handling and retry;
* bash execution and built-in tool registration;
* session switching, new sessions, fork/tree navigation and HTML export; and
* extension lifecycle and tool wrapping.

`SessionManager` is a Node-backed, versioned JSONL append log with a tree
(`id`/`parentId`), branch context construction, compaction/branch-summary
entries, model/thinking entries and extension custom/custom-message entries.
Its entry schema and session context projection are in
[`session-manager.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/session-manager.ts#L30-L184).
This is a rich coding-agent session format, but it is not the same storage
interface as the generic harness's `Session`.

The SDK factory wires these objects together in [`sdk.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/sdk.ts#L33-L121): `createAgentSession` creates or accepts the model runtime, settings manager, resource loader and session manager, restores session model/thinking state, selects active tools, constructs `Agent`, and then binds the coding session. The SDK documentation confirms this is the intended programmatic integration and recommends `AgentSession` rather than spawning RPC for Node consumers ([`docs/sdk.md`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/docs/sdk.md#quick-start)).

### `AgentSessionRuntime` (replacement/supervision)

[`AgentSessionRuntime`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/agent-session-runtime.ts#L17-L220) owns the active `AgentSession` plus cwd-bound services. It tears down and recreates the session for new, resume, fork, clone and import operations, and returns diagnostics from service creation. This is a useful application-lifecycle wrapper, but its session replacement hooks include extension shutdown/rebind behavior and therefore are not the low-level agent core.

## Tools and execution capabilities

The built-in coding tool family is in [`core/tools/`](https://github.com/badlogic/pi-mono/tree/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/tools). `read`, `bash`, `edit`, `write`, `grep`, `find` and `ls` each expose a tool definition and/or an `AgentTool`; [`tools/index.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/tools/index.ts#L71-L195) selects them and provides coding/read-only/all groupings. The implementations use injected operation shapes in places (for example [`bash.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/tools/bash.ts)), but their default local operations are Node process/filesystem behavior and their output truncation/edit queues are coding-agent policy.

At the AI boundary, a tool is just a TypeBox-schema `Tool` in `Context`; at the agent boundary, it is an `AgentTool` with `execute` and progress/result semantics; at the coding boundary, `ToolDefinition` adds labels, source information, rendering metadata and extension lifecycle. The coding session converts/wraps registered definitions into agent tools. Those are three useful seams rather than one universal tool interface.

`bash` is the largest environment coupling: Pi's coding implementation exposes command execution, shell configuration, process termination and output capture. The generic harness instead takes `ExecutionEnv` and its Node implementation handles Windows/non-Windows shell discovery, timeout, abort and process-tree cleanup ([`NodeExecutionEnv`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/harness/env/nodejs.ts#L246-L332)). That capability inversion is a credible route for a Drycode Harness to own tools without inheriting a TUI or CLI.

## Configuration and model runtime

Configuration is currently coding-agent-owned, not `pi-ai`-owned:

* [`config.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/config.ts) detects install/runtime mode and derives package, docs, home and agent directories. It also contains self-update and executable/application concerns.
* [`SettingsManager`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/settings-manager.ts#L11-L129) merges global `~/.pi/agent/settings.json` and project `.pi/settings.json`, uses file locking, and stores defaults, retry/compaction behavior, resource paths/packages, terminal/image preferences and model selection. The [settings documentation](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/docs/settings.md) describes the user-facing format.
* [`ModelConfig`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/model-config.ts) and [`ModelRuntime`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/model-runtime.ts#L50-L165) layer `auth.json`, `models.json`, cached model catalogs, configured credentials, built-ins and extension providers over `pi-ai`. `ModelRuntime` also composes provider overlays and exposes the current model/auth snapshot.
* [`AuthStorage`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/auth-storage.ts) and runtime credentials adapt persistent coding-agent files to `pi-ai`'s provider auth APIs.

This creates an extraction distinction: preserve the provider/auth interfaces
and perhaps a host-neutral credential abstraction; do not accidentally make
Drycode's Harness inherit Pi's home-directory layout, install-method detection,
project trust policy or terminal settings. A Drycode host can provide paths,
settings and model selection explicitly to a lower runtime.

## Resources

[`ResourceLoader`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/resource-loader.ts#L28-L48) is the coding-agent resource facade. `DefaultResourceLoader` discovers and reloads:

* extensions;
* skills (`SKILL.md` and skill commands);
* prompt templates;
* themes;
* `AGENTS.md`/`CLAUDE.md` ancestor context files; and
* system and appended system-prompt text.

It accepts additional paths, package metadata, inline extension factories,
feature-disable switches and override callbacks. It owns provenance/diagnostics
and uses `DefaultPackageManager` for npm/git/local Pi packages. The package
format and resource filtering rules are documented in [`docs/packages.md`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/docs/packages.md).

The resource seam is conceptually reusable but not presentation-free in this
implementation: `resource-loader.ts` imports the interactive `Theme` type and
`loadThemeFromPath` directly. A host-neutral loader could retain extension,
skill, prompt and context discovery while making themes a separately supplied
resource kind. The generic `AgentHarness` has already narrowed its resource
contract to concrete skills and prompt templates supplied by the host
([`AgentHarnessResources`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/agent/src/harness/types.ts#L40-L78)).

## Extensions

The coding-agent extension system is an executable module loader plus a
lifecycle runner:

* [`extensions/types.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/extensions/types.ts#L1-L85) defines events, extension factories, tools, commands, flags, provider registration and contexts.
* [`extensions/loader.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/extensions/loader.ts#L1-L72) loads TypeScript via `jiti`, creates virtual module aliases for bundled Pi packages, caches extension factories by cwd and queues provider registrations until the model runtime is ready.
* [`extensions/runner.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/extensions/runner.ts#L233-L280) binds the loaded extensions to session/model/tool and UI actions, dispatches lifecycle hooks, and supplies a no-op UI context for non-interactive modes.

The key coupling is in the *contract*, not just the interactive mode. The
extension type file imports `@earendil-works/pi-tui` types and the interactive
`Theme` type, and `ExtensionUIContext` includes component factories, editor,
footer/header, widgets, autocomplete, terminal input and theme operations
([`ExtensionUIContext`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/extensions/types.ts#L124-L279)). The same contract also contains genuinely reusable hooks: before-agent/context/provider hooks, tool block/modify hooks, session hooks, custom entries, commands and provider registration. Pi's extension documentation records that extensions run with full system access ([`docs/extensions.md`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/docs/extensions.md#available-imports)).

The credible extraction seam is therefore a split extension contract: keep a
headless registration/hook/tool/provider/session surface with explicit host
facades, and put TUI component/rendering/editor methods in an adapter. The
current no-op UI context proves the modes already tolerate absent UI for many
calls, but it does not remove the compile-time TUI dependency or define a
separate headless extension package.

## TUI and application-shell couplings

### Direct TUI couplings in coding-agent core

The following are direct source couplings, not assumptions based on filenames:

* `AgentSession` imports `getThemeByName`/`theme` from
  `modes/interactive/theme`, and its core file also owns HTML export and tool
  rendering ([imports](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/agent-session.ts#L16-L106)).
* `ResourceLoader` imports the interactive theme loader ([imports](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/resource-loader.ts#L1-L24)).
* Extension types and runner import `pi-tui`, interactive `Theme`, keybinding types,
  footer data and interactive rendering types ([types imports](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/extensions/types.ts#L34-L81),
  [runner imports](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/extensions/runner.ts#L5-L13)).
* The coding-agent index exports the interactive components and `InteractiveMode`
  next to the SDK and RPC exports ([index](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/index.ts#L319-L376)).
* RPC and print modes still import interactive theme/output-adjacent modules
  transitively; `runRpcMode` constructs a headless UI bridge but returns a
  `Theme` value and explicitly no-ops component operations ([RPC UI context](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/modes/rpc/rpc-mode.ts#L132-L300)).

`pi-tui` itself remains a leaf from the runtime perspective: neither AI
transport nor the low-level agent imports it. The coupling is concentrated in
coding-agent's extension type surface, session integration and public barrel.

### Application-shell couplings

`main.ts` is the CLI/application shell: it parses arguments, reads piped stdin,
chooses interactive/print/json/RPC mode based on TTY state, configures HTTP
proxy/runtime behavior, performs migrations/project trust/first-run setup,
constructs the runtime, reports diagnostics and installs process signal
handlers. Its imports show the breadth of this shell boundary ([`main.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/main.ts#L1-L50)).

`config.ts`, package-manager CLI, self-update, clipboard/image utilities,
terminal setup and `output-guard.ts` are likewise host/process concerns. The
session layer still accepts shell-provided `ExtensionBindings` (UI context,
mode, command actions, abort/shutdown/error callbacks); the SDK itself is more
usable, but its concrete implementation is in the same package as these
concerns. `AgentSessionRuntime` explicitly supports rebind callbacks and a
synchronous pre-invalidation callback for UI teardown ([runtime lifecycle](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/core/agent-session-runtime.ts#L67-L131)).

## RPC capabilities

RPC is a protocol adapter around the coding-agent runtime, not a second agent
loop. [`rpc-types.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/modes/rpc/rpc-types.ts#L16-L72) defines JSON commands for prompting/steering/follow-up/abort, state, model and thinking control, queue modes, compaction/retry, bash, session new/switch/fork/clone/tree/entries, messages and command discovery. Responses include model/session data, compaction and bash results; session events stream separately.

[`runRpcMode`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/modes/rpc/rpc-mode.ts#L49-L75) consumes strict LF-delimited JSONL via [`jsonl.ts`](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/modes/rpc/jsonl.ts), subscribes to `AgentSession` events, and delegates session replacement to `AgentSessionRuntime`. The RPC mode's `ExtensionUIContext` turns dialogs/editor requests into `extension_ui_request` records and accepts responses; unsupported TUI operations are no-ops or explicit fallbacks ([UI bridge](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/src/modes/rpc/rpc-mode.ts#L89-L300)). The [RPC documentation](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/docs/rpc.md#protocol-overview) describes framing and asynchronous event semantics.

The credible seam is a transport-independent command/event codec and a thin
adapter over a Harness API. Reusing Pi's current RPC mode directly would also
inherit `AgentSessionRuntime`, output takeover/backpressure, coding-agent
session commands and its UI bridge. The RPC docs themselves recommend using
`AgentSession` directly for Node/TypeScript integrations rather than spawning a
subprocess ([SDK note](https://github.com/badlogic/pi-mono/blob/3da591ab74ab9ab407e72ed882600b2c851fae21/packages/coding-agent/docs/rpc.md#rpc-mode)).

## Credible extraction seams for an independent Drycode Harness

These are research findings about existing boundaries, not a final Drycode
module plan:

1. **Start below coding-agent where possible.** `pi-ai` plus the low-level
   `pi-agent-core` loop/Agent has no TUI dependency. The provider, stream,
   message, tool-call and event contracts are already explicit.
2. **Evaluate the generic `agent/src/harness` subtree as the closest current
   seam.** It has host-provided `ExecutionEnv`, generic session storage,
   `Models`, tools, resources and system-prompt callbacks; it directly owns
   turn snapshots, queues, save points and persistence ordering. Its own docs
   show which durability and lifecycle pieces are not yet complete, so this is
   an extraction candidate rather than a drop-in finished runtime.
3. **Keep environment and persistence behind capabilities.** The generic
   `ExecutionEnv`/`Session` interfaces are credible seams for Drycode's
   workspace and session implementations. The coding-agent `SessionManager`
   can be an adapter or migration source, but directly importing it brings
   Node paths, Pi's JSONL format and Pi config directory conventions.
4. **Treat coding tools as adapters.** Reuse the tool behavior and schemas
   selectively, but bind filesystem/shell operations to a Drycode-owned
   environment. This avoids making the Harness depend on Pi's terminal shell
   policy while retaining read/write/edit/search semantics where useful.
5. **Split resource and extension contracts before reusing them.** Retain
   skills, prompts, context, hooks, custom tools and provider registration as
   headless capabilities. Isolate themes, TUI components, editor state,
   keybindings, footer/header and renderer callbacks behind a shell adapter.
6. **Keep model runtime policy outside the transport core.** `pi-ai` providers
   are reusable; `ModelRuntime`, `SettingsManager`, auth file paths, package
   installation, project trust and CLI model selection are coding-agent policy
   that a Drycode host would need to recreate or replace explicitly.
7. **Build RPC above the chosen Harness contract.** Pi demonstrates a useful
   JSONL command/event shape and extension UI bridge, but the protocol should
   not be the ownership boundary for the agent. A Drycode host can expose only
   the capabilities it intends to support and can make its extension/UI bridge
   explicit.

The main risk is assuming that `pi-coding-agent`'s public SDK barrel is already
non-TUI. It is a convenient integration surface, but its manifest and source
imports show otherwise. The more credible path is to extract or follow the
newer generic harness seam, then selectively adapt coding-agent resources,
tools, session migration and extension behavior around it.
