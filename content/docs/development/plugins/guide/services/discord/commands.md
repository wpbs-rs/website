+++
title = "Commands"
description = "Add a /hello command."
weight = 2
+++

Discord's
[application commands](https://docs.discord.com/developers/interactions/application-commands)
are registrations too. `twilight-util` has builders for the commands and the
responses this page needs. Add it to the workspace's `Cargo.toml`:

```toml,name=Cargo.toml
twilight-util = { git = "https://github.com/wpbs-rs/twilight", features = ["builder"] }
```

and to `greeter/Cargo.toml`:

```toml,name=greeter/Cargo.toml
twilight-util.workspace = true
```

## Bindings

Commands send interactions, which come through the `interactions` world.
Generate it in `mod discord`, inside `mod bindings`:

```rust,name=greeter/src/lib.rs
        pub mod interactions {
            use crate::Plugin;

            wit_bindgen::generate!({
                path: "../wit/services/discord",
                world: "interactions",
                with: {
                    "wpbs:shared/shared-types@0.1.0": crate::bindings::core::wpbs::shared::shared_types,
                },
            });

            export!(Plugin);
        }
```

Then update the imports in `discord.rs`:

```rust,name=greeter/src/discord.rs
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
    Plugin,
    bindings::discord::{
        events::{
            exports::wpbs_services::discord::event_handler,
            wpbs_services::discord::subscriptions::{EventKind, EventSubscription},
        },
        interactions::{
            exports::wpbs_services::discord::interaction_handler,
            wpbs_services::discord::registrations::{ApplicationCommand, InteractionKind},
        },
        requests::wpbs_services::discord::client::{
            Body, InteractionCallbackParams, RequestData, Route, request,
        },
    },
    settings::Settings,
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

Unlike the subscription, the command stays registered with Discord when wpbs
stops. Registering it on the next start has no effect, or updates it if its data
changed.

Call it from `register`:

```rust,name=greeter/src/discord.rs
    subscribe().await?;
    register_command().await?;
```

## Receiving the Command

Using the command sends the plugin an interaction, which needs no subscription.
wpbs calls the `interactions` world's callback, `interaction`, with the kind and
key of the command, so the plugin matches on those. The key stays the same even
if wpbs renames the command, such as to `hello-1` when another command also uses
`hello`. Implement it like `cron`, with an `async` block:

```rust,name=greeter/src/discord.rs
impl interaction_handler::Guest for Plugin {
    async fn interaction(
        kind: InteractionKind,
        key: String,
        payload: Vec<u8>,
    ) -> Result<(), String> {
        async {
            let interaction: Interaction = serde_json::from_slice(&payload)?;

            let response = match (kind, key.as_str()) {
                (InteractionKind::ApplicationCommand, "hello") => ChannelMessageBuilder::new()
                    .content(Settings::load()?.greeting)
                    .build(),
                _ => return Ok(()),
            };

            respond(&interaction, &response).await
        }
        .await
        .map_err(|err| format!("{err:#}"))
    }
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
