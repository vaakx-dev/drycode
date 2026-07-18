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

**Shell Extension**:
The one active Drycode Extension that owns the application's root user interface and defines how other UI contributions compose.
_Avoid_: core shell, built-in shell

**Starter Extension Set**:
The recommended extensions seeded by the installer to provide a basic chat experience.
_Avoid_: built-in features, default IDE

**Workspace**:
The local folder in which a Drycode Harness session operates.
_Avoid_: project

**Reload**:
A complete restart of the extension and harness runtimes while the desktop application remains open.
_Avoid_: hot reload, application restart
