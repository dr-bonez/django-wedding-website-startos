<p align="center">
  <img src="icon.svg" alt="Django Wedding Website Logo" width="21%">
</p>

# Django Wedding Website on StartOS

> **Upstream docs:** <https://github.com/czue/django-wedding-website#readme>
>
> Everything not listed in this document should behave the same as upstream
> Django Wedding Website. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

A wedding website and guest-management system built on Django, packaged for StartOS from [czue/django-wedding-website](https://github.com/czue/django-wedding-website).

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [RSVP Flow (fork-specific)](#rsvp-flow-fork-specific)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Two images:

- `django-wedding-website` — built by this repo's `Dockerfile` from the upstream source vendored as the `django-wedding-website/` git submodule. Runs Gunicorn serving the Django WSGI app on port 8000.
- `nginx` — the stock upstream nginx image, unmodified. Serves collected static files and reverse-proxies everything else to Gunicorn on port 8080.

Both build for x86_64 and aarch64.

The service runtime is: two oneshots (`migrate`, then `collectstatic`) followed by the `gunicorn` daemon and then the `nginx` daemon. On every start, `main.ts` regenerates `bigday/localsettings.py` inside the Django subcontainer's rootfs (not on a volume) from `store.json` and the interface hostnames, and writes nginx's `default.conf` into the nginx subcontainer.

Client IPs: the StartOS reverse proxy always sets `X-Forwarded-For` (stripping any client-supplied value). nginx trusts that header only from the bridge gateway (realip module), so its access logs and the single-value `X-Forwarded-For` it passes to gunicorn carry the real client IP; gunicorn's access log format prints that header. The RSVP audit log reads the same header.

## Volume and Data Layout

| Volume | Mounted at (Django) | Mounted at (nginx)            | Contents                                                        |
| ------ | ------------------- | ----------------------------- | --------------------------------------------------------------- |
| `main` | `/data`             | `/static` (subpath, readonly) | SQLite DB (`db.sqlite3`), collected static files, `store.json` |

`store.json` is StartOS-specific persistent state: the generated admin password, Django `SECRET_KEY`, the RSVP link token, SMTP selection, and the wedding details entered via the Configure Wedding Details action.

## Installation and First-Run Flow

On fresh install the package:

1. Generates an admin password, a Django secret key, and a short RSVP link token, persisting them to `store.json`.
2. Writes an initial `localsettings.py` and runs `manage.py migrate` followed by `manage.py createsuperuser` (username `admin`) in a temporary daemon chain (`runUntilSuccess`).
3. Creates a critical task prompting the user to run **Get Admin Credentials**.

There is no upstream setup wizard; upstream expects manual `localsettings.py` editing, which this package fully automates.

## RSVP Flow (fork-specific)

This fork replaces upstream's guest-centric RSVP entirely:

- The couple creates **parties** (one per physical invitation) in the admin panel or via CSV import — with a name, optional email addresses (one per line on the party), and a **guest limit** (default 1, minimum 1).
- Guests reach `/rsvp/<token>/` (token managed by the wrapper), search **by party name only**, and fill in one form: accept or decline, then name each attendee themselves and pick a meal per attendee, up to the party's guest limit. Exceeding the limit shows an error directing them to the configured contact email.
- Guest rows exist **only** as the result of an RSVP submission (always `is_attending=True`, meal required); each new submission replaces the party's previous guest list. Declining clears it.
- Every submission also appends an immutable `RSVPSubmission` audit row (client IP, X-Forwarded-For chain, user agent, responses).
- The CSV import format is `party_name, first_name, last_name, party_type, is_child, category, is_invited, email[, guest_limit]` — the name/`is_child` columns are ignored (kept for legacy sheets), emails accumulate per party (non-addresses rejected), and the optional `guest_limit` must be ≥ 1. Export is a report (one row per RSVP'd guest, plus one row for guest-less parties), not a round-trippable backup.

## Configuration Management

| StartOS-Managed (do not edit by hand)                                                        | Upstream-Managed                                         |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `localsettings.py` — regenerated on every service start                                      | Guest list, RSVPs, email templates (via the admin panel) |
| `SECRET_KEY`, `DEBUG` (always off), `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, database path   |                                                          |
| Wedding details (couple name, date, location, URL, contact email) via action                 |                                                          |
| SMTP/email settings via action (falls back to console logging when disabled)                 |                                                          |
| RSVP token (`RSVP_TOKEN`) via action                                                          |                                                          |

`ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` are derived reactively from the hostnames of the `ui` interface's binding; a hostname change restarts the service with a fresh config.

## Network Access and Interfaces

One host (`ui-multi`) binding internal port 8080 (nginx) over HTTP, exporting two interfaces:

| Interface id | Name        | Path      | Purpose                                  |
| ------------ | ----------- | --------- | ---------------------------------------- |
| `ui`         | Web UI      | `/`       | The public wedding website               |
| `admin`      | Admin Panel | `/admin/` | Django admin for guests, RSVPs, settings |

Gunicorn's port 8000 is internal only.

## Actions (StartOS UI)

| Action                    | Id                      | Availability | Purpose                                                                                                                                |
| ------------------------- | ----------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Get Admin Credentials     | `get-admin-credentials` | any status   | Shows the admin username/password, the RSVP link word, and the full RSVP URL (with QR) once a website URL is configured. No input.     |
| Configure Wedding Details | `configure-wedding`     | any status   | Sets couple name, wedding date, location, website URL (picked from the interface's addresses), contact email, and the RSVP link word. |
| Configure SMTP            | `manage-smtp`           | any status   | Selects system SMTP, custom SMTP credentials, or disabled (emails are logged to the service console instead of sent).                  |

All actions are visible (`visibility: 'enabled'`).

## Backups and Restore

The `main` volume is backed up in full — database, static files, and `store.json`. Restore brings back all guest data, credentials, and configuration; `localsettings.py` is regenerated on the next start.

## Health Checks

| Check         | Method                       | Meaning                        |
| ------------- | ---------------------------- | ------------------------------ |
| Gunicorn      | TCP listen check on port 8000 | The Django app is up           |
| Web Interface | TCP listen check on port 8080 | nginx is serving the website   |

## Dependencies

None.

## Limitations and Differences

1. Outbound email requires configuring SMTP via the **Configure SMTP** action; until then, emails (save-the-dates, invitations) are written to the service logs instead of sent.
2. `DEBUG` is always off; there is no supported way to enable it.
3. The database is SQLite only (upstream also documents Postgres setups).
4. The RSVP portal is gated behind a secret token in the URL (`/rsvp/<token>/`) managed by this package.
5. `localsettings.py` cannot be edited manually — it is overwritten on every service start.

## What Is Unchanged from Upstream

- The single-page website layout (with this fork's own content and styling)
- The save-the-date / invitation email templates and senders
- The Django admin panel itself

(Guest management, RSVP, and CSV import/export are all fork-modified — see [RSVP Flow](#rsvp-flow-fork-specific).)

## Contributing

See [AGENTS.md](AGENTS.md) for how to work in this repo, and [UPDATING.md](UPDATING.md) for bumping the upstream version.

---

## Quick Reference for AI Consumers

```yaml
package_id: django-wedding-website
architectures: [x86_64, aarch64]
volumes:
  main: /data
ports:
  ui: 8080
  gunicorn_internal: 8000
dependencies: none
startos_managed_env_vars: []
actions:
  - get-admin-credentials
  - configure-wedding
  - manage-smtp
```
