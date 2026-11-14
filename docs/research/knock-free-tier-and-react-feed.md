# Research: What do Knock's free tier and React feed component give us?

Ticket: #7 (map: #4). Researched 2026-11-14 from primary sources only: knock.app, docs.knock.app, and Knock's own
GitHub source. Source files are cited at `main` on that date.

## Answer

- **The free plan is enough for Cadence's Notification Feed.** It costs $0/month and includes up to 10,000 messages a
  month, with no hard cap. It also includes unlimited stored profiles, environments and team members, plus the Feed
  API and pre-built components. Its limits that matter here are the "Powered by Knock" branding, which can't be
  removed, and 30-day log retention. [pricing]
- **`@knocklabs/react` provides a working feed out of the box.** It includes a bell with a badge
  (`NotificationIconButton`), a popover (`NotificationFeedPopover`) and a full-page list (`NotificationFeed`). It also
  covers unread and unseen counts, live updates over a websocket, mark seen/read/archived (optimistic), an All/Unread
  filter, infinite scroll, and custom item rendering. Headless hooks are available for building our own UI. [react-feed]
  [src-feed]
- **The package supports React 19 and needs no router.** Its peer dependencies are
  `react`/`react-dom` `^17 || ^18 || ^19`. `next` and `@tanstack/react-router` are optional. The package is marked
  `"use client"` and fetches feed items in effects, so a server render shows only the empty shell. [src-pkg]
  [src-index]
- **Feed authentication uses a public API key and the user's id, plus a signed user token in production.** The token is
  an RS256 JWT that our server signs with `signUserToken` from `@knocklabs/node`. Without "enhanced security", the
  public key can act as any user, and Knock says to turn it on before release. [security]
- **Users are identified by upsert.** We can upsert from the server (`client.users.update(id, {...})`, which is
  `PUT /v1/users/{id}`), inline in a trigger (recipient objects), or from the client (`KnockProvider` identifies inline
  by default). [identify] [src-knock]
- **Our server sends a Notification by calling `client.workflows.trigger(key, { recipients, actor, data, tenant })`.**
  The run is asynchronous and returns a `workflow_run_id`. An `Idempotency-Key` header makes retries safe. The
  workflow, including its in-app feed step and template, is defined in Knock's dashboard or with the Knock CLI, not in
  our code. [trigger-api] [trigger-ref] [node]
- **What Cadence still builds:**
  - Server-side token signing and user identification
  - Triggers at each domain event, with their workflows and templates
  - A client-only bell in the app layout that re-authenticates when the DevUI panel switches users
  - Styling to match Cadence
  - Keeping Knock out of tests

## 1. Free (Developer) plan

| Item | Free plan | Source |
| --- | --- | --- |
| Price | "Free $0 / month" | [pricing] |
| Messages | "up to 10,000" a month; the FAQ says "We don't hard cap your messages" | [pricing] |
| Users | "Unlimited stored profiles"; no MAU limit is listed. A separate limit of 500 guide recipients a month doesn't affect the feed | [pricing] |
| Environments | "Isolated environments: Unlimited" | [pricing] |
| Team members | Unlimited | [pricing] |
| In-app feed | "Feeds per recipient: Unlimited", "Feed API: Yes", "Pre-built components: Yes", "Feed retention: Unlimited" | [pricing] |
| Not included | Removing Knock branding, translations (i18n), custom roles, audit logs, SAML SSO, per-tenant branding. Logs are kept for 30 days | [pricing] |
| Next tier | Starter costs $250/month plus usage: 50,000 messages, then $0.005 per message | [pricing] |

Knock's branding shows in the feed. `NotificationFeed` renders a "Powered by Knock" link when the account's feed settings
have `features.branding_required` set. [src-feed]

Environments: each one has its own public and secret API keys. Content is edited and committed in Development, then
promoted to Production. [environments]

## 2. What `@knocklabs/react` gives us

Setup, adapted from the package README. Two changes come from the provider's props: `user={{ id }}` replaces the
deprecated `userId`, and `userToken` is added. [readme] [src-provider]

```tsx
import { KnockProvider, KnockFeedProvider, NotificationIconButton, NotificationFeedPopover } from "@knocklabs/react";
import "@knocklabs/react/dist/index.css"; // "Required CSS import, unless you're overriding the styling"

<KnockProvider apiKey={KNOCK_PUBLIC_API_KEY} user={{ id: userId }} userToken={knockToken}>
  <KnockFeedProvider feedId={KNOCK_FEED_CHANNEL_ID}>
    <NotificationIconButton ref={buttonRef} onClick={() => setIsVisible(!isVisible)} />
    <NotificationFeedPopover buttonRef={buttonRef} isVisible={isVisible} onClose={() => setIsVisible(false)} />
  </KnockFeedProvider>
</KnockProvider>
```

| Capability | What is provided | Source |
| --- | --- | --- |
| UI | `NotificationIconButton` (bell and badge), `NotificationFeedPopover` (positioned with Popper, closes on an outside click), `NotificationFeed` (full page), plus `NotificationCell`, `EmptyFeed`, `MarkAsRead` and `UnseenBadge` | [overview] [src-index] [src-popover] |
| Counts | Feed metadata `total_count`, `unread_count`, `unseen_count`. The badge counts unseen items by default; `badgeCountType="unread"` changes that | [src-interfaces] [react-feed] |
| Real time | `useNotifications` calls `knock.feeds.initialize(...)` and then `listenForUpdates()`, which joins the socket topic `feeds:{feedId}:{userId}` and refetches when a new message arrives. Cross-tab sync through BroadcastChannel is behind `__experimentalCrossBrowserUpdates` | [src-useNotifications] [src-feedclient] |
| Mark state | `markAsSeen/Unseen`, `markAsRead/Unread`, `markAsInteracted`, `markAsArchived/Unarchived`, and the bulk `markAllAsSeen`, `markAllAsRead`, `markAllAsArchived`, `markAllReadAsArchived`. These update the store optimistically and don't roll back if the call fails | [src-feedclient] |
| Popover default | Opening the popover calls `markAllAsSeen` if `unseen_count > 0`. To mark items as read instead, override `onOpen` | [src-popover] [react-feed] |
| Pagination | `NotificationFeed` fetches on mount and calls `fetchNextPage()` on bottom scroll (`useOnBottomScroll`, 70px offset). Options include `page_size`, `status`, `archived`, `tenant`, `workflow_categories` and `trigger_data` | [src-feed] [src-interfaces] |
| Customisation | `renderItem`, `renderHeader`, `EmptyComponent`, `renderLoading`, `onNotificationClick`, `onNotificationButtonClick`, `onMarkAllAsReadClick`, `initialFilterStatus`, `formatTimestamp`. Clicking an item with an action URL redirects to it by default | [src-feed] [react-feed] |
| Theming | `colorMode` set to light or dark. Override the `--rnf-*` CSS variables, or replace the CSS entirely, since all classes start with `rnf-` | [react-feed] |
| Headless | `useKnockFeed` (gives `feedClient` and `useFeedStore`), `useNotifications`, `useNotificationStore`, `useAuthenticatedKnockClient`, `useFeedSettings` | [src-index] [readme] [src-feedprovider] |
| i18n | `i18n` prop on `KnockProvider`. Only `en` ships with the package | [react-feed] |
| Web only | "these components are designed to be used via React for web only" | [readme] |

**Compatibility with Cadence.** Cadence uses React `^19.2.7` and React Router 8.3.0 with `ssr: true`.

- The peer dependency range includes React 19, and React Router is not a peer dependency. [src-pkg]
- The feed client's constructor doesn't touch `window` or `document`. Its BroadcastChannel setup checks first that it is
  running in a browser. [src-feedclient]
- Items are fetched in `useEffect`. A server render therefore shows only an empty shell, and no Knock data is loaded on
  the server. [src-feed]

Knock's docs give no guidance for React Router SSR. To be safe, render the bell on the client only (lazy-load it or put
it behind a "mounted" flag). A first implementation slice should confirm this. *(This is our inference, not a Knock
statement.)*

## 3. Authentication and identification

- **Default.** `authenticate({ id })` with only the public key is enough. The docs warn: "Without enhanced security mode,
  a request with your public key can act as any user." [security]
- **Enhanced security.** Once it is on, Knock rejects public-key requests that lack a signed user token. The token is
  an RS256 JWT with `sub` (the user id) required and `iat`/`exp` recommended. The signing key comes from **Platform >
  API keys** and is shown only once (by convention it goes in `KNOCK_SIGNING_KEY`). Node:
  `signUserToken(userId, { signingKey, expiresInSeconds })`, which by default uses `KNOCK_SIGNING_KEY` and expires in
  3600s. Knock says "Enable it before you release your in-app feed to your users." [security] [node]
- **Refreshing the token.** `KnockProvider` accepts `onUserTokenExpiring` and `timeBeforeExpirationInMs` (default
  30,000ms). If the callback returns a new token, the client re-authenticates with it. [src-knock] [src-provider]
- **`enabled` prop.** When `KnockProvider` gets `enabled={false}`, it stays idle: "no identify call, no API requests, and
  no websocket". This is useful while there is no signed-in user. [src-provider]
- **Identifying users.** There are three ways:
  - Server upsert: `client.users.update(userID, {...})`, which is `PUT /v1/users/{user_id}`. It creates the user or
    merges properties into the existing record. [node-api] [users-update]
  - Inline at trigger time: recipients as objects with an `id`, not bare strings. [identify]
  - Client-side: `authenticate()` uses `identificationStrategy: "inline"` by default. Given `{ id, ...props }`, it
    identifies the user; `"skip"` turns this off. [src-knock]

  Only `id` is required. `email` is needed only for the email channel. [users]

## 4. Triggering from Node, and the workflow

- **Client.** Install `@knocklabs/node`, then `new Knock({ apiKey })`, which defaults to `KNOCK_API_KEY`. The SDK is
  generated by Stainless and needs Node 20 or later. [node]
- **Trigger.** `client.workflows.trigger(key, { recipients, actor, data, tenant, cancellation_key })` sends
  `POST /v1/workflows/{key}/trigger` and returns `{ workflow_run_id }`. "All workflow runs are executed
  asynchronously." [node-api] [trigger-ref]
  - `data` holds the template variables, up to 10MB.
  - `actor` links the person who acted to the feed item.
  - `tenant` scopes feed messages.
  - `Idempotency-Key` makes a retry within 24h return the original response. [trigger-api]
- **The workflow.** A workflow has a trigger step, then channel steps and function steps: batch, delay, branch,
  throttle and fetch. [workflows] A message reaches a feed when a workflow (or a broadcast) runs for a recipient.
  [feeds]
- **The in-app feed step's template.** Variants are Standard, Single-action and Multi-action. An optional click action
  URL can be static or use a Liquid variable. [in-app-channel]
- **What the feed API returns per item.** Actors, public variables, the full trigger `data` and the recipient. This can
  be trimmed with response filters. [in-app-channel]
- **Feed item fields.** `blocks`, `data`, `actors`, `read_at`, `seen_at`, `archived_at`, `tenant` and more.
  [src-interfaces]
- **Message content can't change.** Once generated, it is immutable: archive the message and trigger again. [feeds]
- **Where workflows live.** They are written in the dashboard and kept in Knock's version control: commit in
  Development, promote to Production. [environments] The Knock CLI (`knock pull`/`knock push` into `.knock/workflows/`)
  can keep them in our repo. [cli]

## 5. What Cadence would have to build

1. **Configuration and secrets.** Store `KNOCK_API_KEY` (secret, server only), `KNOCK_SIGNING_KEY` (server only), the
   public API key and the feed channel id, separately for each environment. [environments] [security]
2. **Identity mapping.** Use Cadence's user id as the Knock user id. Upsert name and email on sign-up and on profile
   changes, or inline at trigger time. Decide what role or tenant data to send. [identify] [users-update]
3. **Token issuing.** A loader (for example in `layout.app.tsx`) signs a short-lived user token for the signed-in user
   and passes it to the client, along with a refresh path for `onUserTokenExpiring`. Turn on enhanced security in every
   environment the public can reach. [security]
4. **Triggers.** Call `workflows.trigger` at each domain event that should produce a Notification. This should happen
   after the database write commits, use an idempotency key, and not block the request on Knock's response. Which events
   to cover is a separate ticket. [trigger-api]
5. **Workflows and templates.** Build them in the dashboard, or with the CLI so they live in the repo. Each workflow
   needs an in-app feed step whose copy follows GLOSSARY.md and whose action URLs point at Cadence routes. [cli]
   [in-app-channel]
6. **The bell in the app layout.**
   - Render it on the client only, and use `enabled` to keep it idle without a session. [src-provider]
   - Re-authenticate when the DevUI panel switches the user (`api.switch-user.ts`).
   - Route clicks through React Router (`onNotificationClick`) rather than a full page load.
   - Choose between mark-as-seen and mark-as-read on open.
   - Possibly build a full-page Notification Feed route with `NotificationFeed`.
7. **Styling.** Map Cadence's design tokens onto the `--rnf-*` variables, or go headless with `useNotifications` and
   our own components. The Knock branding stays on the free plan. [react-feed] [src-feed]
8. **Tests.** Wrap the Node client behind a small module so tests can stub it, and never call Knock from tests.
9. **Not provided by Knock's feed UI.** Notification preferences (Knock has a preference center, which is outside this
   ticket's scope), rollback of failed optimistic updates, and translations beyond `en`. [overview] [src-feedclient]

## Sources

- [pricing]: https://knock.app/pricing
- [overview]: https://docs.knock.app/in-app-ui/react/overview
- [react-feed]: https://docs.knock.app/in-app-ui/react/feed
- [security]: https://docs.knock.app/in-app-ui/security-and-authentication
- [feeds]: https://docs.knock.app/in-app-ui/feeds/overview
- [in-app-channel]: https://docs.knock.app/integrations/in-app/knock
- [users]: https://docs.knock.app/concepts/users
- [identify]: https://docs.knock.app/managing-recipients/identifying-recipients
- [users-update]: https://docs.knock.app/api-reference/users/update
- [trigger-api]: https://docs.knock.app/send-notifications/triggering-workflows/api
- [trigger-ref]: https://docs.knock.app/api-reference/workflows/trigger
- [workflows]: https://docs.knock.app/designing-workflows/overview
- [environments]: https://docs.knock.app/concepts/environments
- [cli]: https://docs.knock.app/cli/overview
- [readme]: https://github.com/knocklabs/javascript/blob/main/packages/react/README.md
- [src-pkg]: https://github.com/knocklabs/javascript/blob/main/packages/react/package.json (`@knocklabs/react` 0.15.1)
- [src-index]: https://github.com/knocklabs/javascript/blob/main/packages/react/src/index.ts
- [src-feed]: https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx
- [src-popover]: https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx
- [src-provider]: https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/core/context/KnockProvider.tsx
- [src-feedprovider]: https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/feed/context/KnockFeedProvider.tsx
- [src-useNotifications]: https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/feed/hooks/useNotifications.ts
- [src-feedclient]: https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts
- [src-interfaces]: https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts
- [src-knock]: https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts
- [node]: https://github.com/knocklabs/knock-node/blob/main/README.md
- [node-api]: https://github.com/knocklabs/knock-node/blob/main/api.md
