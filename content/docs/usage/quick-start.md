+++
title = "Quick Start"
description = "Install wpbs and run a first project."
weight = 1
+++

## Installation

Install the latest release of wpbs for your system with its install script. It
also starts the daemon, `wpbsd`, as a system service:

{% <tabs> %}
{% <tab title="Linux/FreeBSD/macOS"> %}
```sh
curl -fsSL https://raw.githubusercontent.com/wpbs-rs/wpbs/main/install.sh | sh
```
{% </tab> %}
{% <tab title="Windows"> %}
```powershell
irm 'https://raw.githubusercontent.com/wpbs-rs/wpbs/main/install.ps1' | iex
```
{% </tab> %}
{% </tabs> %}

Log out and in again, then check that the CLI reaches the daemon:

```sh
wpbs version
```

> [Installation](@/docs/usage/installation.md) covers other options, such as
> Docker.

## Configuration

Create a directory for the project:

```sh
mkdir my-project
cd my-project
```

In it, add a `project.yaml` that runs `hello-world`, a plugin that logs
`Hello, world!` when it starts and `Goodbye, world!` when it stops:

```yaml,name=project.yaml
name: my-project

plugins:
  hello-world:
    plugin: hello-world:0.1.0
```

> [Configuration](@/docs/usage/configuration/_index.md) covers everything
> `project.yaml` can describe, such as services and plugin settings.

## Running

From the project's directory, create the project in the daemon, and start it:

```sh
wpbs new
wpbs start
```

The daemon downloads the plugin, which then logs its greeting. Follow the logs
with:

```sh
wpbs logs -f
```

Stop the project, and the plugin says goodbye:

```sh
wpbs stop
```

## Data

The daemon keeps every project, its plugins' data, and its logs in its data
directory. Back it up; without it, every project starts from scratch.

| System  | Data directory        |
| ------- | --------------------- |
| Linux   | `/var/lib/wpbs`       |
| FreeBSD | `/var/db/wpbs`        |
| macOS   | `/usr/local/var/wpbs` |
| Windows | `%ProgramData%\wpbs`  |

A project keeps running when the daemon restarts, such as after a reboot or an
update.

## Next Steps

Replace `hello-world` with the services and plugins your project needs, and run
`wpbs update` after changing the file. That works whether the project runs or
not; on a running project, only the plugins that changed restart.
`wpbs restart` restarts the whole project, `wpbs ls` lists your projects, and
`wpbs remove` removes this one with all its data.
