+++
title = "Plugins"
description = "Add plugins and their settings."
weight = 2
+++

Each entry under `plugins` runs one plugin. The key names it:

```yaml,name=project.yaml
plugins:
  hello-world:
    plugin: hello-world:0.1.0
```

A plugin that cannot be loaded or fails to initialize is logged and left out;
the daemon runs the others.

## Sources

`plugin` is a reference in the same form as a Docker image reference:

- `hello-world:0.1.0` is an official plugin, short for
  `ghcr.io/wpbs-rs/hello-world:0.1.0`.
- `ghcr.io/someone/their-plugin:1.2.0` comes from any OCI registry, public or
  private, the same kind that hosts container images.
- `local/greeter:0.1.0` is your own plugin, uploaded with the CLI:

  ```sh
  wpbs plugin upload greeter.wasm local/greeter:0.1.0
  ```

  Several versions of a local plugin can be uploaded side by side. Uploading a
  version again replaces it, and restarts the plugins that use it.

The daemon downloads a plugin when it is added or its reference changes, and
keeps running that exact download until the reference changes again, even if
the tag is later moved to a newer release. `@sha256:…` pins a download
explicitly.

Downloaded and uploaded plugins stay cached after their last project stops using
them, so other projects reuse them. `wpbs plugin ls` lists them,
`wpbs plugin rm` removes one that no project uses, and `wpbs plugin prune`
removes all unused ones.

## Settings and Environment

`settings` configures the plugin, and `environment` sets environment variables
for it:

```yaml,name=project.yaml
plugins:
  hello-world:
    plugin: hello-world:0.1.0
    settings:
      greeting: Good morning!
    environment:
      SECRET_GREETING: ${HELLO_WORLD_SECRET_GREETING}
```

## Working Directory

Each entry gets a working directory for files, in the daemon's data directory.
It is deleted when the entry is removed.

## Duplicate Plugins

The same plugin can be added more than once under different keys, such as
`hello-world` and `hello-world-dev`. Each entry has its own settings, data, and
working directory. The data belongs to the key, so an entry that is renamed
starts without it.
