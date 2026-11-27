+++
title = "Services"
description = "Enable and configure services."
weight = 1
+++

Services are off by default. Plugins that use a disabled service still get
initialized, but their registrations and calls will fail. Some services also
need settings and/or secrets.

{% <collapsible title="Discord"> %}
Connects to Discord. Create an application as described in Discord's
[getting started guide](https://docs.discord.com/developers/quick-start/getting-started),
and give the project its bot token, from the project's directory:

```sh
wpbs secret set discord.bot-token
```

The CLI asks for the token, or reads it from stdin. The daemon stores it
encrypted, and never shows it again; run the command again to replace it. The
project does not start without the token while the service is enabled.

Enable the service with the
[gateway intents](https://docs.discord.com/developers/events/gateway#gateway-intents)
your plugins need. Their documentation lists them.

```yaml,name=project.yaml
services:
  discord:
    enabled: true
    settings:
      intents:
        - Guilds
        - GuildMessages
```

Intents use Discord's names in PascalCase, and `All` and `AllNonPrivileged`
select several at once. Without intents, plugins only receive interactions.
Privileged intents, such as `MessageContent`, must also be enabled for the bot
in Discord's developer portal.

### Interactions

Commands, message components, and modals that plugins register stay registered
until the plugin removes them, or its entry is removed or renamed. Commands stay
listed in Discord while the project is stopped, and components and modals sent
earlier work again once it runs.

A command whose name is already taken gets a number, such as `/hello-2` next to
`/hello`. The first command keeps its name, and names never change afterwards.
{% </collapsible> %}

{% <collapsible title="Scheduler"> %}
Runs plugin jobs on cron schedules, and one-shots at a point in time. Crons and
one-shots stay registered while the project is stopped: a cron skips the times
it missed, and a one-shot that came due runs once the project runs again.

Schedules follow the time zone of the daemon's system, which is UTC in the
Docker image unless `TZ` is set.

```yaml,name=project.yaml
services:
  scheduler:
    enabled: true
```
{% </collapsible> %}
