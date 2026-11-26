+++
title = "Lifecycle"
description = "When wpbs calls a plugin."
weight = 4
+++

1. `initialization` runs when the plugin starts: when its project starts, when
   it is added to a running project, and when its entry changes in a running
   project, such as a new version or new settings. It receives the plugin's
   settings. The plugin sets up its crons, subscriptions, and commands here, and
   keeps data that later calls need, such as its settings, in storage.
2. Service callbacks, such as a cron or a Discord event, run whenever they
   trigger.
3. `shutdown` runs when the plugin stops: when its project stops, when it is
   removed from a running project, and before its entry changes in a running
   project.

Calls into core, such as logging and storage, are synchronous, while calls into
services are async. Calls that can fail return an error. Callbacks can return an
error too, which wpbs logs. If `initialization` returns an error, the plugin
will not be loaded.
