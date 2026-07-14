# Django Wedding Website

## Documentation

- [Upstream README](https://github.com/czue/django-wedding-website#readme) — the original project's overview of the website, guest management, and email features.

## What you get on StartOS

Two interfaces: the **Web UI** (your public wedding website) and the **Admin Panel** (where you manage guests, RSVPs, and emails). Everything Django normally makes you configure by hand — secret keys, allowed hostnames, the database — is set up automatically. Your guest list, RSVPs, and settings all live in the service's data and are included in backups.

## Getting set up

1. Right after install, run the **Get Admin Credentials** task. Save the admin password it shows you — it also shows your RSVP link word and, once you've set a website URL, the full RSVP link with a QR code.
2. Open the **Admin Panel** interface and sign in as `admin` with that password.
3. Run the **Configure Wedding Details** action to set your names, wedding date, location, contact email, the website URL guests will use, and (optionally) a memorable RSVP link word to replace the generated one.
4. Create your invitations in the Admin Panel as **parties** — one per physical invitation (a household, a couple, a plus-one). Give each party the name printed on its invitation, its email address(es) (one per line), and a **guest limit**: how many people that invitation may bring. You don't enter individual guest names — guests type their own names when they RSVP.

## Using Django Wedding Website

### Web interface

The **Web UI** is the site your guests see: your story, the details of the day, and the RSVP page.

### RSVP links

Guests reach the RSVP page through a secret link — your website URL plus `/rsvp/<your link word>/`. Print it (or its QR code, from **Get Admin Credentials**) on your invitations. Anyone without the link cannot RSVP.

### How guests RSVP

A guest searches for the party name printed on their invitation, then fills in one form: accept or decline, the name of each person attending, and a meal choice for each. They can add people up to that party's guest limit — past it, the form tells them to email you. Each new submission from a party replaces its previous answer, so guests can update their RSVP by visiting the link again. You can watch responses arrive on the admin **Dashboard**, including who submitted what and from where.

### Sending email

To send save-the-dates and invitations from the site, run the **Configure SMTP** action and either use your server's system SMTP credentials or enter your own. Until SMTP is configured, emails are not sent — they appear in the service logs instead, which is useful for previewing.
