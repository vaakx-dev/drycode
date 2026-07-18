# Drycode

Drycode is a minimal, locally extensible AI coding application that developers compose into the tool they want.

## Language

**Drycode Core**:
The featureless host that discovers extensions, resolves their relationships, and controls their lifecycle.
_Avoid_: IDE core, application shell

**Drycode Home**:
The per-user `~/.drycode/` root containing installed Extensions and Drycode's durable, cached, diagnostic, and temporary data. Core reserves its platform paths, while fully trusted Extensions may create and own directly accessible paths elsewhere in Drycode Home.
_Avoid_: Workspace configuration, project data

**Drycode Agent**:
Drycode's independent coding-agent subsystem hosted by the Backend Runtime. Pi is its initial source, not its ongoing identity or compatibility contract.
_Avoid_: Drycode Harness, Pi runtime, Pi wrapper, backend runtime

**Drycode Extension**:
A local, fully trusted package that contributes UI behavior, backend behavior, or both.
_Avoid_: plug-in, Pi extension

**Extension Manifest**:
A Drycode Extension's declaration of its identity, version, Drycode compatibility, entry points, required dependencies, and soft ordering relationships.

**Installed Extension**:
A Drycode Extension package present as an immediate child directory of `~/.drycode/extensions/`. Developers own the directory and may author directly within it; Drycode discovers but does not install, update, or remove it.
_Avoid_: managed package, installation record

**Extension Validator**:
The validation-only `drycode-extension` companion CLI, which checks Extension packages without executing their code or controlling Drycode.
_Avoid_: Drycode CLI, package manager

**Soft Dependency**:
An optional activation-order relationship expressed as an Extension identity selector. Matching enabled Extensions activate first; no match is valid and promises no behavioral compatibility.
_Avoid_: required dependency, provided capability, Extension family

**Enabled Extension**:
An Installed Extension whose root does not contain the regular file `.disabled`, selecting it for inclusion in the next Runtime Generation. Enablement changes take effect through Reload.
_Avoid_: loaded Extension, active entry point

**Disabled Extension**:
An Installed Extension whose root contains the regular file `.disabled`, excluding it from the next Runtime Generation without removing its package or durable data.
_Avoid_: unloaded Extension, uninstalled Extension

**Extension Graph**:
The deterministic dependency and soft-ordering graph of enabled Drycode Extensions. Invalid or failed Extensions and their required dependents receive explicit activation states while independent Extensions may continue loading.
_Avoid_: all-or-nothing Extension Graph, silent skipping

**Extension State**:
The generation-specific outcome for an installed Extension: disabled, loaded, warning, failed, or blocked. A fatal generation state is reserved for failures that prevent a viable Shell or platform runtime.
_Avoid_: enabled list entry, color-only status

**Service Slot**:
A stable, namespaced contract with zero or one effective implementation inside one runtime. Its owner defines the contract, while any eligible Drycode Extension may supply, replace, decorate, or remove its value.
_Avoid_: global service, cross-process service

**Service Registry**:
The frozen result of composing all Service Slots for one runtime generation. The UI and Backend runtimes have separate registries.
_Avoid_: mutable container, Core service registry

**UI-Backend Bridge**:
The generation-scoped, bidirectional channel through which UI and backend entries perform validated remote Calls and Streams.
_Avoid_: UI-Harness Bridge, shared service registry, global event bus

**Bridge Endpoint**:
A named remote contract owned by one Drycode Extension and exposed from one runtime to the other.
_Avoid_: remote object, implicit callback

**UI Runtime**:
The replaceable runtime that composes UI services, executes UI entry points, mounts the effective Shell service, and applies Extension-declared localization resources.
_Avoid_: Core UI, permanent renderer

**Backend Runtime**:
The replaceable Node.js runtime that executes backend entry points, hosts Drycode Agent, and supports backend behavior unrelated to coding-agent execution.
_Avoid_: Harness runtime, Agent runtime, generic Core process

**Localization**:
The UI Runtime capability that loads Fluent FTL catalogs declared by UI Extensions, applies the selected locale, preserves source text when translations are absent, and reports locale support and coverage. Feature UI for choosing a locale belongs to an Extension.
_Avoid_: localization Extension, language-pack Extension

**Runtime Generation**:
One supervised instance of the resolved Extension Graph, the runtimes required by its Host, and the activation state of every installed Extension. A Desktop Runtime Generation pairs UI and Backend runtimes through the UI-Backend Bridge; a Headless Runtime Generation runs the Backend without a UI Runtime or Shell. Loaded Extensions start, run, and stop as one unit.
_Avoid_: independent UI restart, silently skipped Extension

**Headless Host**:
The terminal entry point that supervises a Headless Runtime Generation and exposes Drycode Agent through one-shot Print or persistent JSONL RPC operation.
_Avoid_: terminal UI, CLI Extension, desktop client

**Recovery Surface**:
The minimal Core-owned lifecycle interface shown when no Runtime Generation is running.
_Avoid_: fallback Shell, built-in application UI

**Shell Extension**:
The Drycode Extension that supplies the effective Shell service for a Desktop Runtime Generation. It owns the application's root user interface and renders the stable UI Element Identifiers that other UI Extensions may use.
_Avoid_: core shell, built-in shell, headless shell

**UI Element Identifier**:
A conventional DOM identifier through which fully trusted UI Extensions may opportunistically observe or modify another Extension's rendered interface. Unique elements use `id`; repeated elements use `data-element-id`. An absent identifier leaves the observing Extension inert and never invalidates the Extension Graph.
_Avoid_: attachment point, provided capability, required UI contract

**Starter Extension Set**:
The recommended Extensions seeded and initially enabled by the installer to provide a basic chat experience.
_Avoid_: built-in features, default IDE

**Workspace**:
The absolute local folder path carried by a Session and used as that Session's operating context. A Workspace is not an independently stored entity; recent folders, grouping, and filtering are UI preferences.
_Avoid_: project, Workspace record, Workspace repository

**Session**:
A durable, append-only conversation tree bound to one Workspace. One active leaf selects the current conversation path, and a Session has at most one active Run.
_Avoid_: application session, linear transcript

**Session Record**:
One validated, append-only fact whose parent relationship places it in a Session tree.
_Avoid_: mutable session row, Pi entry

**Extension Record**:
A namespaced Session Record owned and validated by one Drycode Extension. It preserves Extension state and is excluded from Model context unless explicitly projected by its owner.
_Avoid_: custom entry, arbitrary metadata

**Extension Message**:
A namespaced Session Record owned and validated by one Drycode Extension whose content is projected into Model context with explicit user-visibility metadata.
_Avoid_: custom message, hidden user message

**Branch**:
A conversation path through one Session tree. Selecting an earlier Session Record as the active leaf preserves existing history and lets subsequent records form another Branch.
_Avoid_: copied Session, mutable history

**Fork**:
A new Session derived from a selected position in another Session, retaining its source lineage and selected conversation history. A Fork may use a different Workspace.
_Avoid_: Branch, imported Session

**Clone**:
A Fork created from the active leaf of a Session in the same Workspace.
_Avoid_: Branch, backup

**Run**:
One Agent Execution started by Session input and completed by success, failure, or cancellation.
_Avoid_: process, runtime generation

**Agent Execution**:
One invocation of Drycode Agent with an explicit system prompt, Model, active Tool set, Workspace, Prompt Variables, and cancellation signal. A Session Run is an Agent Execution; Extensions may also start child executions that remain part of their parent Tool Invocation.
_Avoid_: Runtime Generation, implicit subagent Session

**Tool**:
A headless, model-callable operation contributed by a Drycode Extension.
_Avoid_: command, UI action

**Available Tool**:
A Tool registered by an enabled Extension in the current Runtime Generation.
_Avoid_: active Tool, enabled Extension

**Active Tool**:
An Available Tool selected for a Session or child Agent Execution and included in Model requests. Changing the active Tool set does not require Reload.
_Avoid_: enabled Extension, installed Tool

**Model Provider**:
A Drycode Extension contribution that owns Model discovery, credential resolution, requests, and normalized response streaming.
_Avoid_: built-in provider, Core model

**Skill**:
A named set of instructions and resources discovered by an Extension and available for on-demand use by Drycode Agent. Its summary may appear in a prompt before its complete instructions and resources are loaded.
_Avoid_: command, executable extension

**Prompt Variable**:
A named value resolved by Drycode Agent while assembling a prompt. Drycode Agent owns registration, metadata, and expansion; Drycode Agent and backend entries may contribute values that vary by Session or Run.
_Avoid_: environment variable, manifest capability, UI attachment

**Reload**:
The stop-then-start replacement of one Runtime Generation with another while Drycode Core and the desktop window remain open.
_Avoid_: hot reload, application restart, rolling replacement
