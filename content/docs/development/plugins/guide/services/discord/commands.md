+++
title = "Commands"
description = "Add a /hello command."
weight = 2
+++

Discord's
[application commands](https://docs.discord.com/developers/interactions/application-commands)
are registrations too.
[`twilight-util`](https://docs.rs/twilight-util)
([wpbs fork](https://github.com/wpbs-rs/twilight/tree/main/twilight-util)) has
builders for the commands and the responses this page needs. Add it to the
workspace's `Cargo.toml`:

```toml,name=Cargo.toml,hl_lines=7
[workspace.dependencies]
anyhow = "1"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
twilight-http = { git = "https://github.com/wpbs-rs/twilight", default-features = false }
twilight-model = { git = "https://github.com/wpbs-rs/twilight" }
twilight-util = { git = "https://github.com/wpbs-rs/twilight", features = ["builder"] }
wit-bindgen = "0.63"
```

and to `greeter/Cargo.toml`:

```toml,name=greeter/Cargo.toml,hl_lines=7
[dependencies]
anyhow.workspace = true
serde.workspace = true
serde_json.workspace = true
twilight-http.workspace = true
twilight-model.workspace = true
twilight-util.workspace = true
wit-bindgen.workspace = true
```

## Bindings

Commands send interactions, which come through the `interaction` world.
Generate it in `mod discord`, inside `mod bindings`:

```rust,name=greeter/src/lib.rs,hl_lines=4-16
            export!(Plugin);
        }

        pub mod interactions {
            use crate::Plugin;

            wit_bindgen::generate!({
                path: "../wit/services/discord",
                world: "interaction",
                with: {
                    "wpbs:shared/shared-types@0.1.0": crate::bindings::core::wpbs::shared::shared_types,
                },
            });

            export!(Plugin);
        }

        pub mod requests {
```

Then update the imports in `discord.rs`:

```rust,name=greeter/src/discord.rs,hl_lines=2-9 20-26
use twilight_http::{client::ClientBuilder, request::TryIntoRequest};
use twilight_model::{
    application::{command::CommandType, interaction::Interaction},
    gateway::payload::incoming::MessageCreate,
    http::interaction::InteractionResponse,
};
use twilight_util::builder::{
    command::CommandBuilder, interaction_response::ChannelMessageBuilder,
};

use crate::{
    Plugin, Settings,
    bindings::{
        core::wpbs::shared::shared_types::HostError,
        discord::{
            events::{
                exports::wpbs_services::discord::event_handler,
                wpbs_services::discord::events::{EventKind, EventSubscription},
            },
            interactions::{
                exports::wpbs_services::discord::interaction_handler,
                wpbs_services::discord::interactions::{ApplicationCommand, InteractionKind},
            },
            requests::wpbs_services::discord::requests::{
                Body, InteractionCallbackParams, RequestData, Route, request,
            },
        },
    },
};
```

## Registering the Command

An `ApplicationCommand` is a handle named by a key. Registering it with `None`
creates a global command, described by Discord's command object:

```rust,name=greeter/src/discord.rs
async fn register_command() -> anyhow::Result<()> {
    let command = CommandBuilder::new("hello", "Say hello", CommandType::ChatInput).build();
    let data = serde_json::to_vec(&command)?;

    ApplicationCommand::new("hello")
        .register(None, data)
        .await?;

    Ok(())
}
```

Unlike the subscription, a command can be registered again: on the next start
it has no effect, or updates the command if its data changed.

Call it from `register`:

```rust,name=greeter/src/discord.rs,hl_lines=3
pub async fn register() -> anyhow::Result<()> {
    subscribe().await?;
    register_command().await?;

    Ok(())
}
```

## Responding

Discord expects an
[interaction response](https://docs.discord.com/developers/interactions/receiving-and-responding)
within three seconds. `ChannelMessageBuilder` builds one that replies with a
message. The response is the request's body as it is, so the plugin serializes
it without the client:

```rust,name=greeter/src/discord.rs
async fn respond(interaction: &Interaction, response: &InteractionResponse) -> anyhow::Result<()> {
    request(RequestData {
        route: Route::InteractionCallback(InteractionCallbackParams {
            interaction_id: interaction.id.get(),
            interaction_token: interaction.token.clone(),
            with_response: false,
        }),
        body: Some(Body::Json(serde_json::to_vec(response)?)),
        headers: None,
    })
    .await?;

    Ok(())
}
```

## Receiving the Command

Using the command sends the plugin an interaction, which needs no subscription.
wpbs calls the `interactions` world's callback, `interaction`, with the kind and
key of the command, so the plugin matches on those. The key stays the same even
if wpbs renames the command, such as to `hello-2` when another command already
uses the name `hello`.

A handler, `on_hello`, replies to the command with the greeting:

```rust,name=greeter/src/discord.rs
async fn on_hello(payload: &[u8]) -> anyhow::Result<()> {
    let interaction: Interaction = serde_json::from_slice(payload)?;

    let response = ChannelMessageBuilder::new()
        .content(Settings::load()?.greeting)
        .build();

    respond(&interaction, &response).await
}
```

Like `event`, the callback passes the interaction on to its handler, and turns
its error into a string:

```rust,name=greeter/src/discord.rs
impl interaction_handler::Guest for Plugin {
    async fn interaction(
        kind: InteractionKind,
        key: String,
        payload: Vec<u8>,
    ) -> Result<(), String> {
        match (kind, key.as_str()) {
            (InteractionKind::ApplicationCommand, "hello") => on_hello(&payload).await,
            (kind, key) => unreachable!("{kind:?} {key} was never registered"),
        }
        .map_err(|err| format!("{err:#}"))
    }
}
```

Interactions only come from what the plugin registered, so any other kind and
key is a bug.
