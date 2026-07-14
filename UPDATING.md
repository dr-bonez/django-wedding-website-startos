# Updating the upstream version

This package has two upstream sources: the Django application, vendored as the
`django-wedding-website/` git submodule and built by the root `Dockerfile`, and
the stock nginx image pulled by tag.

## Determining the upstream version

### Django Wedding Website (git submodule)

Upstream ([czue/django-wedding-website](https://github.com/czue/django-wedding-website))
publishes no releases or version tags — it is a template project tracked by commit.
The current pin is the submodule commit (`git submodule status`). Check for new
upstream commits with:

```
git -C django-wedding-website fetch origin && git -C django-wedding-website log --oneline HEAD..origin/master
```

Because upstream has no version numbers, the package's `1.0.0` upstream version is
this package's own; bump its patch/minor for meaningful upstream advances and the
downstream revision for wrapper-only changes (see
`start-technologies/projects/start-sdk/docs/src/versions.md`).

### nginx (Docker tag)

Pinned in `startos/manifest/index.ts` at `images.nginx.source.dockerTag`. It uses
the floating `nginx:alpine` tag, so rebuilding the package picks up the current
stable nginx automatically — there is nothing to bump.

## Applying the bump

1. Update the submodule: `git -C django-wedding-website pull origin master`, then
   commit the new submodule pointer.
2. Update `version` and `releaseNotes` in `startos/versions/current.ts`
   (spin off a historical version file only if the bump needs a migration).
3. Rebuild (`make x86` or `make arm`), install, and verify the site, admin login,
   and RSVP flow still work.
