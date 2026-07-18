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

**Soft Dependency**:
An optional activation-order relationship expressed as an Extension identity selector. Matching enabled Extensions activate first; no match is valid and promises no behavioral compatibility.
_Avoid_: required dependency, provided capability, Extension family

**Enabled Extension**:
An installed Drycode Extension selected for inclusion in the next Runtime Generation. Enablement changes take effect through Reload; disabled packages and their durable data remain installed.
_Avoid_: active entry point, uninstalled Extension

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
One supervised instance of the resolved Extension Graph, paired UI and Backend runtimes, their UI-Backend Bridge, and the activation state of every installed Extension. Loaded Extensions start, run, and stop as one unit.
_Avoid_: independent UI restart, silently skipped Extension

**Recovery Surface**:
The minimal Core-owned lifecycle interface shown when no Runtime Generation is running.
_Avoid_: fallback Shell, built-in application UI

**Shell Extension**:
The Drycode Extension that supplies the effective Shell service. It owns the application's root user interface and renders the stable UI Element Identifiers that other UI Extensions may use.
_Avoid_: core shell, built-in shell

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
A durable, linear conversation bound to one Workspace. A Session has at most one active Run.
_Avoid_: application session, branch tree

**Session Record**:
One validated, append-only fact in a Session's authoritative record stream.
_Avoid_: mutable session row, Pi entry

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
