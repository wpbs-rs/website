+++
title = "Permissions"
description = "Optionally restrict plugins further."
weight = 3
+++

Plugins run [sandboxed](@/docs/_index.md#sandboxed), so they can only use what
wpbs provides. By default, permissions are opt-out: plugins may use every
operation of the enabled services, which suits most projects.

A plugin entry can narrow this down under `permissions`:

```yaml,name=project.yaml
plugins:
  hello-world:
    plugin: hello-world:0.1.0
    permissions:
      services:
        scheduler:
          - Jobs
```

`core` covers core operations, such as `Shutdown` for requests to stop or
restart the plugin's project, and `services` has a list per service. Each list
also accepts `All`. Registrations and calls a plugin has no permission for
fail. A plugin's documentation lists the permissions it needs.

## Restricted Mode

Restricted mode makes permissions opt-in: a list that an entry leaves out allows
nothing instead of everything, so each plugin only gets what its entry lists.
Restricted mode is for advanced use. Turn it on per project:

```yaml,name=project.yaml
name: my-project
restricted: true
```
