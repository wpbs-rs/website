+++
title = "Running the Plugin"
description = "Run the plugin in a local wpbs project."
weight = 3
+++

Install wpbs as described in [Quick Start](@/docs/usage/quick-start.md). Then
upload the built plugin to the daemon as a local plugin, from `my-plugins`:

```sh
wpbs plugin upload target/wasm32-wasip3/release/greeter.wasm local/greeter:0.1.0
```

Create a project for it next to the workspace:

```txt
my-plugins/
my-project/
└── project.yaml
```

```yaml,name=project.yaml
name: my-project

plugins:
  greeter:
    plugin: local/greeter:0.1.0
```

Create and start it from `my-project`, and follow its logs:

```sh
wpbs new
wpbs start
wpbs logs -f
```

The log shows `Hello from greeter!`, and `Goodbye from greeter!` when you stop
the project with `wpbs stop`.

After each change to the plugin, rebuild it and upload it again under the same
version. The daemon replaces it and restarts the plugin: `shutdown` runs for the
old build and `initialization` for the new one.
