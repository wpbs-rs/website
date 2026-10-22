+++
title = "Scheduler"
description = "Log the greeting every morning."
weight = 1
+++

The scheduler runs crons on cron expressions, and one-shots at a point in time.
greeter uses a cron. Enable the scheduler in `config.yaml`:

```yaml,name=config.yaml
services:
  scheduler:
    enabled: true
```

## Bindings

Each of the scheduler's features is a world of its own, `cron` and `one-shot`.
Generate the `cron` world's bindings next to core's, in `mod bindings`:

```rust,name=greeter/src/lib.rs
    pub mod scheduler {
        pub mod cron {
            use crate::Plugin;

            wit_bindgen::generate!({
                path: "../wit/services/scheduler",
                world: "cron",
                with: {
                    "wpbs:shared/shared-types@0.1.0": crate::bindings::core::wpbs::shared::shared_types,
                },
            });

            export!(Plugin);
        }
    }
```

`world` selects the world, since the package has more than one. The scheduler
uses the same shared types as core. `with` reuses the ones core's bindings
generated, so that types such as `HostError` are the same in both modules.

## Registering the Cron

The scheduler code goes in a new module, `greeter/src/scheduler.rs`. Declare it
in `lib.rs`:

```rust,name=greeter/src/lib.rs
mod scheduler;
```

and start it with these imports:

```rust,name=greeter/src/scheduler.rs
use crate::{
    Plugin,
    bindings::{
        core::wpbs::core::logging::{LogLevel, log},
        scheduler::cron::{
            exports::wpbs_services::scheduler::cron_handler::Guest,
            wpbs_services::scheduler::crons::Cron,
        },
    },
    settings::Settings,
};
```

A `Cron` is a handle to a cron, named by a key. Registering it with a
[cron expression](https://docs.rs/cron/0.17.0/cron/) schedules it. Expressions
start with a seconds field; this one runs daily at 09:00, in the system's time
zone:

```rust,name=greeter/src/scheduler.rs
const EVERY_MORNING: &str = "0 0 9 * * *";

pub async fn register() -> anyhow::Result<()> {
    Cron::new("morning")
        .register(EVERY_MORNING.to_string())
        .await?;

    Ok(())
}
```

The cron is a
[registration](@/docs/development/plugins/concepts/registrations.md): it lasts
until wpbs stops, so the plugin registers it again on every start.

Call `register` in `initialization`'s block, after saving the settings:

```rust,name=greeter/src/lib.rs
            scheduler::register().await?;
```

## Running the Cron

When the schedule triggers, wpbs calls the scheduler's `cron` callback with the
cron's key. It runs in a fresh instance, so it loads the settings from storage.
Like `initialization`, it turns the error of its `async` block into a string:

```rust,name=greeter/src/scheduler.rs
impl Guest for Plugin {
    async fn cron(key: String) -> Result<(), String> {
        async {
            if key == "morning" {
                log(LogLevel::Info, Settings::load()?.greeting).await;
            }

            anyhow::Ok(())
        }
        .await
        .map_err(|err| format!("{err:#}"))
    }
}
```

`Settings::load` does not exist yet. Add it to `impl Settings` in `settings.rs`:

```rust,name=greeter/src/settings.rs
    pub fn load() -> anyhow::Result<Self> {
        let bytes = store::open("")?
            .get("settings")?
            .context("no settings stored")?;

        Ok(serde_json::from_slice(&bytes)?)
    }
```

and import `Context` at the top of the file:

```rust,name=greeter/src/settings.rs
use anyhow::Context;
```
