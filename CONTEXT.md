# Drycode

Drycode is a minimal, locally extensible AI coding application that developers compose into the tool they want.

## Language

**Drycode Core**:
The featureless host that discovers extensions, resolves their relationships, and controls their lifecycle.
_Avoid_: IDE core, application shell

**Drycode Harness**:
Drycode's independent coding-agent runtime. Pi is its initial source, not its ongoing identity or compatibility contract.
_Avoid_: Pi runtime, Pi wrapper

**Drycode Extension**:
A local, fully trusted package that contributes UI behavior, harness behavior, or both.
_Avoid_: plug-in, Pi extension

**Extension Manifest**:
A Drycode Extension's declaration of its identity, version, Drycode compatibility, entry points, and required dependencies.

**Extension Graph**:
The complete, deterministic dependency graph of discovered Drycode Extensions. Drycode accepts or rejects the graph as a whole.
_Avoid_: partial extension set, best-effort loading

**Service Slot**:
A stable, namespaced contract with zero or one effective provider inside one runtime. Its owner defines the contract, while any eligible Drycode Extension may provide, replace, decorate, or remove its value.
_Avoid_: global service, cross-process service

**Service Registry**:
The frozen result of composing all Service Slots for one runtime generation. The UI and Harness runtimes have separate registries.
_Avoid_: mutable container, Core service registry

**UI-Harness Bridge**:
The generation-scoped, bidirectional channel through which UI and Harness extensions perform validated remote Calls and Streams.
_Avoid_: shared service registry, global event bus

**Bridge Endpoint**:
A named remote contract owned by one Drycode Extension and exposed from one runtime to the other.
_Avoid_: remote object, implicit callback

**UI Runtime**:
The replaceable runtime that composes UI services, executes UI entry points, and mounts the effective Shell service.
_Avoid_: Core UI, permanent renderer

**Shell Extension**:
The Drycode Extension that supplies the effective base provider for the Shell service. It owns the application's root user interface and defines how other UI contributions compose.
_Avoid_: core shell, built-in shell

**Starter Extension Set**:
The recommended extensions seeded by the installer to provide a basic chat experience.
_Avoid_: built-in features, default IDE

**Workspace**:
The local folder in which a Drycode Harness Session operates.
_Avoid_: project

**Session**:
A durable, linear conversation bound to one Workspace. A Session has at most one active Run.
_Avoid_: application session, branch tree

**Run**:
One agent execution started by Session input and completed by success, failure, or cancellation.
_Avoid_: process, runtime generation

**Tool**:
A headless, model-callable operation contributed by a Drycode Extension.
_Avoid_: command, UI action

**Model Provider**:
A Drycode Extension contribution that owns Model discovery, credential resolution, requests, and normalized response streaming.
_Avoid_: built-in provider, Core model

**Skill**:
A named set of instructions and resources selected for a Session and incorporated through prompt assembly.
_Avoid_: command, executable extension

**Reload**:
A complete restart of the extension and harness runtimes while the desktop application remains open.
_Avoid_: hot reload, application restart
