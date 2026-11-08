---
"@zenthcloud/server": minor
"@zenthcloud/app": minor
---

Add zenthcloud Cloud generated hostnames: applications deployed on managed Cloud
receive a stable `<application>.zenthcloud.app` URL. Allocation is atomic (unique
hostname index with collision suffixes), survives redeployments, is routed
through the existing Traefik file provider and provisioned over HTTPS. The
central `*.zenthcloud.app` wildcard is bootstrapped through the Cloudflare API with
a scoped token, and released hostnames are kept as tombstones so a name can
never be reused by another tenant.
