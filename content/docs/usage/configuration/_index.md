+++
title = "Configuration"
description = "The project's project.yaml."
weight = 3
sort_by = "weight"
+++

`project.yaml` describes a project: its name, the services it enables, and the
plugins it runs. Project commands, such as `wpbs new` and `wpbs update`, read
it from the current directory (`-f` names another file) and send it to the
daemon, which keeps the project. The file can live anywhere, such as in a Git
repository.

```yaml,name=project.yaml
name: my-project

services:
  scheduler:
    enabled: true

plugins:
  hello-world:
    plugin: hello-world:0.1.0
```

- `name` names the project, and is required. It is how the daemon tells
  projects apart. Plugin data is kept per project, so a renamed project starts
  without it.
- `services` enables the services plugins can use.
- `plugins` lists the plugins to run.
- `restricted` makes [permissions](@/docs/usage/configuration/permissions.md)
  opt-in.

## Interpolation

Values can refer to environment variables of the shell running `wpbs` as
`${NAME}`; the CLI fills them in before sending the file. This keeps values that
differ per machine, or that should stay out of version control, out of
`project.yaml`:

```yaml,name=project.yaml
plugins:
  hello-world:
    plugin: hello-world:0.1.0
    environment:
      SECRET_GREETING: ${HELLO_WORLD_SECRET_GREETING}
```

Service secrets, such as a Discord bot token, are not part of the file; they
are set with [`wpbs secret set`](@/docs/usage/configuration/services.md).

## Further Configuration

Services, plugins, and their permissions each have a page of their own:
