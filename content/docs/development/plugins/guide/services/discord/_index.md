+++
title = "Discord"
description = "Connect the plugin to Discord."
weight = 2
sort_by = "weight"

[extra]
ordered = true
+++

The Discord service connects wpbs to Discord. Set up an application and enable
the service as described in
[Services](@/docs/usage/configuration/services.md#discord), with these intents:

```yaml,name=config.yaml
services:
  discord:
    enabled: true
    settings:
      intents:
        - Guilds
        - GuildMessages
        - MessageContent
```

## Module

The Discord package has a world for each of its features: `events`, `requests`,
`interactions`, and `voice`. greeter generates the bindings of each world it
uses on the page that first needs it, under a `discord` module in
`mod bindings`.

The Discord code goes in `greeter/src/discord.rs`. Declare it in `lib.rs`:

```rust,name=greeter/src/lib.rs
mod discord;
```

Start it with a `register` function for the registrations to come:

```rust,name=greeter/src/discord.rs
pub async fn register() -> anyhow::Result<()> {
    Ok(())
}
```

and call it in `initialization`'s block:

```rust,name=greeter/src/lib.rs
            discord::register().await?;
```

## Features

The pages below add greeter's Discord features:
