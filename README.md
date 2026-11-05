# Barclays banking demo

A responsive, independent **Barclays-branded banking demo**, using sdsadasdsaddd
[barclays.co.uk](https://www.barclays.co.uk/) as the visual reference. The main
experience uses fictional local data, not live accounts. No login, real
payments, card operations or banking connection are provided.

The original AEM content-fragment consumer is preserved at **`/fragments`**,
with its existing API routes, fetcher, variations and offline snapshot.
The banking home loads the published **Barclays product-card fragment**, not M&G
content. Its selector discovers the authored variations from AEM and displays
their actual titles. The single variation dropdown sits outside the phone in a
compact top header alongside the red demo warning (stacked on narrow screens),
leaving more height for the app. It updates the product card inside Home,
immediately above the Everyday account balance section.
The selection is retained when switching app tabs.

## Live Barclays product card

Home uses the supplied persisted query:
`/graphql/execute.json/barclays-xwalk/get-barclays-product-card-by-path`,
with fragment path `/content/dam/barclays-xwalk/fragments/barclays-product-card`.
The same publish origin's direct GraphQL endpoint,
`/content/_cq_graphql/barclays-xwalk/endpoint.json`, discovers `_variations`
and their titles using `barclaysProductCardByPath`. Blank variation is treated as
`master`, matching the live service. The currently published options are
**First Time Buyers** (master), **Savings Accounts** (`savings_accounts`) and
**Credit Cards** (`credit_cards`); the UI does not hardcode this list.

The browser calls `/api/product-card`; AEM configuration and requests stay
server-side. Optional `BARCLAYS_AEM_PUBLISH_ORIGIN` and
`BARCLAYS_PRODUCT_CARD_PATH` overrides are separate from the legacy CTA settings.
Every upstream product-card and variation-discovery request appends a fresh
`cq` query parameter to bypass stale AEM/CDN responses, while preserving the
persisted query's `;path=...;variation=...` parameters. The browser request,
server fetch and API response also use `no-store`. Authored image URLs are
returned unchanged; image assets are not indiscriminately cache-busted.
The adapter maps the actual `title`, `description.html`, `ctaLabel`, `ctaLink`
and `image._publishUrl` fields. Rich text (including the published escaped
paragraph markup) is rendered as React-escaped plain text, never injected HTML.
Relative CTA paths resolve against `https://www.barclays.co.uk/`; images use
their publish URLs. Only HTTP(S) links and images are accepted.

Loading, retrieval failures and image errors are visible. Failed requests can
be retried, and changing variations cancels obsolete browser requests.
No M&G/offline snapshot is substituted when Barclays content is unavailable.

## Banking interactions

- Home and Accounts show three fictional accounts; balances can be hidden.
- Pay someone and Move money open validated, review-only demo flows. They
  never submit a payment or change an account balance.
- Activity can be searched by merchant or category.
- Cards lets you freeze/unfreeze a fictional card, in page memory only.
- Savings goals, spending breakdowns, notifications and Help provide useful
  illustrative detail. Reloading resets all demo state.
- The banking experience uses a centred phone frame on desktop and fills the
  available width on mobile, with an independently scrolling feed and persistent
  bottom navigation. A large red “this is a demo site” warning appears above the
  app and on the Brand Concierge page.

## Brand Concierge

The real Adobe integration is adapted from
[`waringme/barclays-xwalk/blocks/brand-concierge`](https://github.com/waringme/barclays-xwalk/tree/main/blocks/brand-concierge),
including its README, JavaScript bootstrap sequence, CSS, Universal Editor
configuration and exported `style-config.json`. The adapter is in
`public/concierge/agent.js`; the full exported styling configuration is
preserved in `public/concierge/style-config.json`, with demo-safe privacy and
disclaimer text, Barclays-blue accents and human-agent handoff disabled.
The SDK's supported mobile theme enables suggestion pills and disables the
welcome-card carousel. Adobe's container-width breakpoints select the mobile
variant inside the phone-sized iframe even when the outer browser is desktop.
Official eagle and wordmark assets from the user-supplied branding reference
are stored in `public/brand/`. The agent receives the eagle as inline SVG,
as required by its configuration.

Choose **Ask Brand Concierge** near the top of Home, or use the persistent
**Concierge** tab. Consent and chat now open inside the same phone-style app;
**`/brand-concierge`** also opens that in-app view directly. Switching to another
tab or closing the concierge removes its iframe; returning requires consent again.
**No Adobe SDK scripts or requests
load until the visitor chooses “Agree and open concierge”.** Continuing loads
the upstream Web SDK (Alloy 2.35.1) and Adobe web agent in an isolated iframe.
Closing or leaving the page removes that iframe; reopening starts a fresh SDK
lifecycle. Data already sent is not erased by closing.

This is **not a simulated chatbot**. Network/bootstrap errors are visible,
initial loading times out after 30 seconds, and conversation errors are
rendered by Adobe's own agent. A loaded chat UI alone does not establish that
the conversation backend works. Never enter real financial or personal data.

The upstream public identifiers are used by default. To override them, copy
`.env.example` to `.env.local`, then restart the app (redeploy in production):

```dotenv
BRAND_CONCIERGE_DATASTREAM_ID=your-datastream-id
BRAND_CONCIERGE_ORG_ID=your-org-id@AdobeOrg
BRAND_CONCIERGE_REGION=nld2
```

These are public browser configuration, not API keys. The Adobe datastream
must enable **Brand Concierge**, have a **published concierge** attached and
allow **every domain used to access the demo**, including the exact localhost
or preview domain. The upstream README documents `Datastream config not found`
and `Concierge not found` responses when Adobe-side setup is incomplete.
The page exposes connection details and a reload control for troubleshooting.
Outbound service hosts are `cdn1.adoberesources.net`, `experience.adobe.net`
and `edge.adobedc.net`; Adobe's agent may load further service assets.
Use your deployment's approved consent and privacy policy before public use;
the explicit demo consent gate is not a production compliance implementation.

## Content-fragment integration

A minimal **Next.js** web app that consumes an **AEM CTA content fragment** and
renders it — demonstrating how a content fragment authored once in Adobe
Experience Manager can be reused by any third-party web app.

It reproduces the exact consumption pattern used by the ACCA Edge Delivery
Services `content-fragment` block (the "col-promo" style CTA banner), but as a
standalone app that has nothing to do with Edge Delivery.

## What it demonstrates

A CTA content fragment lives in AEM with fields like `title`, `subtitle`,
`description`, `bannerimage`, `ctalabel`, and `ctaurl`. Any consumer can fetch it:

```
Browser ──POST──▶ /api/cta (this app, server-side)
                     │
                     └─POST──▶ Adobe I/O Runtime wrapper service
                                  │
                                  └─GET──▶ AEM publish GraphQL persisted query
                                           /graphql/execute.json/ref-demo-eds/CTAByPath
                                           ;path=<cfPath>;variation=<variation>
```

The **wrapper service** (an Adobe I/O Runtime action) performs the GraphQL
request server-side and returns JSON, so a browser can consume the fragment
without running into CORS. This is the same gateway the EDS block posts to on
publish.

The page lets you point at any AEM publish origin + content fragment path, fetch
it, and see both the **rendered CTA banner** and the **exact request** that was
made.

## Routes

| Route     | What it is                                                                  |
| --------- | --------------------------------------------------------------------------- |
| `/`       | Responsive Barclays banking demo with fictional local data. |
| `/brand-concierge` | Consent-gated Adobe Brand Concierge, using the requested integration. |
| `/fragments` | Preserved developer test page — enter an origin / path / variation and inspect the request. |
| `/advice` | Redirects to `/` for compatibility with the previous demo URL. |

Content-fragment developer-tool defaults still point at the M&G reference AEM instance
(`https://publish-p147324-e2050468.adobeaemcloud.com`,
`/content/dam/mandg/en/fragments/promotions/cf-1`), for legacy integration testing. The banking home does not use these defaults.

## Running locally

```bash
npm install
cp .env.example .env.local   # optional — edit to point at your AEM
npm run dev
```

Open http://localhost:3000.

The developer tools can fetch the live `cf-1` fragment from the M&G reference
instance. If that instance is hibernating (see below), or if you clear
`AEM_PUBLISH_ORIGIN`, the app serves a bundled snapshot so it still renders.

---

## Offline mock / AEM hibernation fallback

AEM as a Cloud Service **dev and stage environments hibernate when idle**. A
hibernating instance makes the live GraphQL fetch time out or return a 5xx —
even though nothing is wrong with this app. To keep the demo working, the repo
ships an **offline snapshot of the `cf-1` fragment** and falls back to it
automatically whenever AEM is unreachable.

### How the fallback is triggered

The fallback lives in the fetch layer ([`lib/cta.ts`](lib/cta.ts)), so callers
don't need to do anything:

1. Every AEM request is wrapped in an **8-second timeout**
   (`fetchWithTimeout`, `AEM_TIMEOUT_MS`).
2. If the request **aborts, errors, returns a non-2xx, or returns no item**,
   and a snapshot exists for the requested content-fragment path, the snapshot
   is returned instead of throwing.
3. Both the CTA fetch (`fetchCta`) and the variation-list lookup
   (`fetchVariations`) fall back this way, so the dropdown and the promo stay
   populated.

The snapshot is only used for the path it covers (`cf-1`). Requesting any other
path while AEM is down still surfaces the real error, because there's no
snapshot to serve.

### How you can tell mock data is showing

The result carries a `mockReason` field so the UI can be honest about it:

| `mockReason`       | Meaning                                                            |
| ------------------ | ----------------------------------------------------------------- |
| _(absent)_         | Live data from AEM.                                               |
| `aem-unavailable`  | AEM was configured but unreachable → repo `cf-1` snapshot served. |
| `no-origin`        | No `AEM_PUBLISH_ORIGIN` configured → sample/mock data served.     |

- The developer page (`/fragments`) shows a notice: _"AEM is unreachable (likely
  hibernating) — showing the repo's offline `cf-1` snapshot…"_.
- The banking demo never automatically displays this legacy snapshot.

### What the snapshot contains

```
lib/mock/cf-1.json          Snapshot of cf-1: master + every authored variation,
                            in the GraphQL `data.ctaByPath.item` shape.
                            Banner image URLs point at the local copies below.
public/mock/50-5077.png            Banner for master (also inherited by
                                   genai_future_preparation, which has no image)
public/mock/square-146.png         Banner for genai_smart_planning
public/mock/16-9-aspect-ratio40.png Banner for genai_expert_guidance
lib/mock.ts                 Loader: hasMock(), mockVariations(),
                            mockFragmentFor(), mockMaster()
```

The snapshot mirrors AEM's behaviour where a variation with no banner image
**inherits master's image** (`imageFromMaster: true`).

Variations captured: `master` (_Secure Future_),
`genai_future_preparation` (_Future Ready_),
`genai_smart_planning` (_Retire Smart_),
`genai_expert_guidance` (_Plan Ahead_).

### Regenerating / updating the snapshot

The snapshot is a point-in-time copy. If you edit `cf-1` in AEM (or want to
snapshot a different fragment), refresh it:

1. **List the current variations** from the direct GraphQL endpoint:

   ```bash
   curl -s -X POST \
     'https://publish-p147324-e2050468.adobeaemcloud.com/content/_cq_graphql/ref-demo-eds/endpoint.json' \
     -H 'Content-Type: application/json' \
     -d '{"query":"{ ctaByPath(_path: \"/content/dam/mandg/en/fragments/promotions/cf-1\") { item { _variations title } } }"}'
   ```

2. **Fetch each variation** (master + each name from step 1) through the wrapper
   service and copy the `data.ctaByPath.item` object into the matching entry in
   `lib/mock/cf-1.json`:

   ```bash
   curl -s -X POST \
     'https://3635370-refdemoapigateway-stage.adobeioruntime.net/api/v1/web/ref-demo-api-gateway/fetch-cf' \
     -H 'Content-Type: application/json' \
     -d '{"graphQLPath":"https://publish-p147324-e2050468.adobeaemcloud.com/graphql/execute.json/ref-demo-eds/CTAByPath","cfPath":"/content/dam/mandg/en/fragments/promotions/cf-1","variation":"master"}'
   ```

3. **Download each banner image** into `public/mock/` and set the entry's
   `bannerimage._publishUrl` to the local path (e.g. `/mock/50-5077.png`). Leave
   `bannerimage: null` for a variation that should inherit master's image.

   ```bash
   curl -s -o public/mock/50-5077.png \
     'https://publish-p147324-e2050468.adobeaemcloud.com/content/dam/mandg/image/50-5077.png'
   ```

4. Keep the top-level `variations` array in `cf-1.json` in sync (name + title
   per variation) — it drives the fallback dropdown.

---

## Pointing at your own AEM instance

Everything is driven by environment variables (with sane hardcoded defaults for
the M&G reference instance). Copy `.env.example` to `.env.local` and change the
values, then restart `npm run dev`.

```bash
cp .env.example .env.local
```

```dotenv
# The AEM publish origin that hosts the GraphQL endpoint.
# Leave blank to force mock/sample mode.
AEM_PUBLISH_ORIGIN=https://publish-pXXXXX-eYYYYY.adobeaemcloud.com

# Persisted GraphQL query that returns a CTA fragment by path.
AEM_GRAPHQL_QUERY=/graphql/execute.json/<project>/CTAByPath

# Direct (non-persisted) GraphQL endpoint, used server-side to list a
# fragment's authored variations for the dropdown.
AEM_GRAPHQL_DIRECT_ENDPOINT=/content/_cq_graphql/<project>/endpoint.json

# Adobe I/O Runtime wrapper that proxies the GraphQL call (avoids CORS).
CF_WRAPPER_SERVICE_URL=https://<namespace>.adobeioruntime.net/api/v1/web/<package>/fetch-cf

# Which fragment to load by default, and which variation.
DEFAULT_CF_PATH=/content/dam/<tenant>/.../fragments/promotions/cf-1
DEFAULT_CF_VARIATION=master
```

### Configuration reference

| Env var                       | Purpose                                                                     | Default |
| ----------------------------- | --------------------------------------------------------------------------- | ------- |
| `AEM_PUBLISH_ORIGIN`          | AEM publish origin hosting the GraphQL endpoint. **Blank = mock mode.**      | M&G reference publish |
| `AEM_GRAPHQL_QUERY`           | Persisted query path used to fetch a CTA fragment by path.                   | `/graphql/execute.json/ref-demo-eds/CTAByPath` |
| `AEM_GRAPHQL_DIRECT_ENDPOINT` | Direct GraphQL endpoint used to list a fragment's variations.               | `/content/_cq_graphql/ref-demo-eds/endpoint.json` |
| `CF_WRAPPER_SERVICE_URL`      | Adobe I/O Runtime wrapper that proxies the GraphQL call.                     | ref-demo stage gateway |
| `DEFAULT_CF_PATH`             | Content fragment path loaded by default.                                     | `/content/dam/mandg/en/fragments/promotions/cf-1` |
| `DEFAULT_CF_VARIATION`        | Variation loaded by default.                                                 | `master` |

> **Note:** a *blank* env var (e.g. an empty value in a hosting dashboard) is
> treated the same as unset — the hardcoded default is used. This prevents an
> empty variable from silently dropping the app into mock mode. To force mock
> mode, set `AEM_PUBLISH_ORIGIN` to an empty string in `.env.local`.

### Changing the endpoint at runtime (no restart)

The developer page (`/fragments`) lets you override the **publish origin**, **content
fragment path**, **variation**, and **persisted query** directly in the form and
fetch immediately — handy for testing another instance without editing env vars.
Env vars set the defaults the form starts from.

### What "the endpoint" is made of

A live fetch resolves to a single URL of the form:

```
<AEM_PUBLISH_ORIGIN><AEM_GRAPHQL_QUERY>;path=<cfPath>;variation=<variation>?cq=<cachebuster>
```

To move to a different AEM instance you typically only change
`AEM_PUBLISH_ORIGIN` (and, if your persisted query is named differently or lives
in a different project, `AEM_GRAPHQL_QUERY` / `AEM_GRAPHQL_DIRECT_ENDPOINT`). The
wrapper service (`CF_WRAPPER_SERVICE_URL`) must be reachable and configured to
fetch from that origin.

## Deploying to Vercel

This is a standard Next.js App Router project, so it deploys to
[Vercel](https://vercel.com) with no extra configuration — the `/api/*` routes
become serverless functions and the `public/mock/*` images (and everything else
in `public/`) are served as static assets. The offline snapshot works in
production because those files are committed to the repo.

### Option A — Vercel dashboard (Git integration)

1. Push this repo to GitHub/GitLab/Bitbucket (it already lives at
   `github.com/waringme/cf-example`).
2. In Vercel, **Add New → Project** and import the repository.
3. Framework preset is auto-detected as **Next.js** — leave the build command
   (`next build`) and output settings at their defaults.
4. Add the environment variables (see below), then **Deploy**.
5. Every push to `master` triggers a production deploy; other branches and PRs
   get preview deployments automatically.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel            # first run links the project and creates a preview deploy
vercel --prod     # promote to production
```

### Environment variables on Vercel

Set these under **Project → Settings → Environment Variables** (for the
Production, and optionally Preview/Development, environments). They mirror
`.env.local` — see the [Configuration reference](#configuration-reference) above.

| Variable | Notes |
| --- | --- |
| `AEM_PUBLISH_ORIGIN` | Your AEM publish origin. Leave **unset** to use the built-in M&G default, or set to an empty string to force mock mode. |
| `AEM_GRAPHQL_QUERY` | Only needed if your persisted query differs from the default. |
| `AEM_GRAPHQL_DIRECT_ENDPOINT` | Only needed if your project path differs. |
| `CF_WRAPPER_SERVICE_URL` | The Adobe I/O Runtime wrapper, reachable from Vercel's servers. |
| `DEFAULT_CF_PATH` | Fragment to load by default. |
| `DEFAULT_CF_VARIATION` | Usually `master`. |

Notes:

- These are **server-side** variables (read in API routes / server code), so
  they are never exposed to the browser and don't need the `NEXT_PUBLIC_`
  prefix.
- After changing an environment variable in the Vercel dashboard, **redeploy**
  for it to take effect — env vars are baked in at deploy time.
- The app is resilient by design: if you deploy with **no** AEM variables and
  the reference instance is hibernating, visitors still see the bundled `cf-1`
  snapshot instead of an error.

## Project structure

```
app/
  page.tsx                 Barclays banking demo
  fragments/page.tsx       Preserved content-fragment developer tools
  brand-concierge/page.tsx Direct entry to the in-app Concierge tab
  advice/page.tsx          Redirect to the banking demo
  layout.tsx               Root layout
  globals.css              Legacy content-fragment consumer styles
  banking.css              Responsive Barclays banking and concierge styles
  api/
    cta/route.ts           Server route: fetch a CTA fragment (proxies wrapper)
    variations/route.ts    Server route: list a fragment's variations
    product-card/route.ts  Live Barclays product card and authored variations
  components/
    CtaConsumer.tsx        Developer UI: form + fetch + "how it works" panel
    CtaBanner.tsx          Renders the CTA fragment as a banner
    MobileApp.tsx          Responsive demo banking screens and local interactions
    BrandConcierge.tsx     Consent gate and isolated agent iframe
    ProductCard.tsx        Live product card with authored-variation selector
    Brand.tsx             Barclays eagle and wordmark
    Icon.tsx              Shared interface icons
lib/
  cta.ts                   Core fetch logic + timeout + AEM-unavailable fallback
  product-card.ts          Barclays schema adapter and live variation discovery
  brand-concierge.ts       Shared server-side Adobe client configuration
  mock.ts                  Offline snapshot loader
  mock/cf-1.json           cf-1 snapshot (master + variations)
public/
  brand/*.svg              Barclays reference eagle and wordmark
  concierge/               Adapted SDK loader, markup, CSS and exported style config
  mock/*.png               Snapshot banner images
```

## Reference

Modeled on the `content-fragment` block in the ACCA Edge Delivery project
(`blocks/content-fragment/content-fragment.js`).
