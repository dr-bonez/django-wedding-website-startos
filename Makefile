ARCHES := x86 arm
# overrides to s9pk.mk must precede the include statement
include node_modules/@start9labs/start-sdk/s9pk.mk

# The docker image builds from the submodule, which s9pk.mk's ingredient list
# can't see — without this, submodule-only changes skip the repack and `make
# install` re-uploads a stale s9pk.
SUBMODULE_FILES := $(shell find django-wedding-website -type f -not -path '*/.git/*' 2>/dev/null)
django-wedding-website.s9pk django-wedding-website_x86_64.s9pk django-wedding-website_aarch64.s9pk: $(SUBMODULE_FILES)
