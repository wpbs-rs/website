+++
title = "Installation"
description = "Install wpbs with its install script or run it with Docker."
weight = 2
+++

wpbs has two parts: `wpbsd`, the daemon that runs every project in the
background, and `wpbs`, the CLI you manage it with. Once the daemon runs, you
only use the CLI.

{% <collapsible title="Install Script"> %}
The install script installs the latest release for your system. It installs
both binaries, creates a `wpbs` user and group for the daemon, registers the
daemon with your system's service manager (systemd, rc.d, launchd, or Windows
services), starts it, and adds your account to the `wpbs` group:

{% <tabs> %}
{% <tab title="Linux/FreeBSD/macOS"> %}
```sh
curl -fsSL https://raw.githubusercontent.com/wpbs-rs/wpbs/main/install.sh | sh
```
{% </tab> %}
{% <tab title="Windows"> %}
```powershell
irm 'https://raw.githubusercontent.com/wpbs-rs/wpbs/main/install.ps1' | iex
```
{% </tab> %}
{% </tabs> %}

Log out and in again, so the group membership applies. Members of the `wpbs`
group have full control over the daemon. Check that the CLI reaches it:

```sh
wpbs version
```

It prints the versions of both the CLI and the daemon.

The [releases page](https://github.com/wpbs-rs/wpbs/releases) also has archives
for Linux, FreeBSD, macOS, and Windows, on x86-64 and ARM64, with the binaries
and service files for installing by hand.
{% </collapsible> %}

{% <collapsible title="Docker"> %}
The `wpbsd` image runs the daemon. Its configuration and data are volumes, and
the CLI on the host reaches it through the socket in the `run` volume. Add a
`compose.yaml`, and start it with `docker compose up -d`:

```yaml,name=compose.yaml
services:
  wpbsd:
    image: ghcr.io/wpbs-rs/wpbsd:0.1.0
    volumes:
      - ./config:/etc/wpbs
      - ./data:/var/lib/wpbs
      - ./run:/run/wpbs
    restart: unless-stopped
```

Install the CLI from the release archive for your system, and point it at the
socket:

```sh
export WPBS_HOST=$PWD/run/wpbs.sock
wpbs version
```

The socket belongs to the image's `wpbs` group, whose id is fixed; give a group
on the host the same id to use it without `sudo`. Schedules use UTC unless `TZ`
is set, such as `TZ: Europe/Brussels` under `environment`.
{% </collapsible> %}

