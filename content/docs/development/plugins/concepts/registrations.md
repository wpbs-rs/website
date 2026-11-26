+++
title = "Registrations"
description = "Crons, subscriptions, and commands that outlive calls."
weight = 5
+++

Crons, one-shots, event subscriptions, commands, and other things a plugin sets
up with wpbs are registrations. wpbs stores them, so they outlive the call that
created them.

A plugin works with a registration through a handle, such as a `Cron` created
with a key. Creating or dropping the handle does nothing. Its `register` method
creates a new registration, while `update` and `deregister` change or remove an
existing one.

Any call can change registrations, but most are made in `initialization`.

## Lifetime

A registration lasts until the plugin deregisters it, or until the plugin or
its project is removed; a one-shot also ends once it runs. It stays while the
plugin is stopped, and wpbs never removes one on its own. A plugin that no
longer needs a registration, such as after an update, deregisters it itself.

## Registering Again

`initialization` runs each time the plugin starts, so it often registers what
already exists:

- A cron, one-shot, or event subscription that already exists fails to register
  with `AlreadyExists`; `update` changes it instead.
- A command is updated if its guild or data changed, and left as is otherwise.
- A message component or modal is left as is, and keeps its custom ID, so
  messages and modals sent earlier keep working.

## Missed Time

While a plugin is stopped:

- A one-shot that comes due runs once the plugin runs again.
- A cron skips the times it missed, like crontab, and runs again on its next
  scheduled time.
- Discord events and interactions are lost.
