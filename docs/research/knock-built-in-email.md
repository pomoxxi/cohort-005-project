# Can Knock's built-in email channel replace Postmark?

Research ticket: [#8](https://github.com/pomoxxi/cohort-005-project/issues/8). Sources read 2026-11-14, primary
sources only (docs.knock.app, knock.app).

## Verdict

**No. Knock alone cannot replace Postmark.** Knock's built-in email channel is a test channel. Knock's own FAQ answers
"Can I use this provider for production use?" with "No." It sends at most 100 emails a month, and only to members of
the Knock account. Its From address is fixed and read-only, so Cadence cannot send from its own domain.

If Cadence sends email through Knock, it needs Knock **plus** an external provider, and Postmark is one Knock supports.
So Postmark stays either way. Email leaves this map's scope, as the ticket says.

## Findings

### 1. Production or testing?

Testing only. Knock's wording:

- "Knock comes with a built-in email channel to test your email notifications. This is a great way to explore Knock and
  start testing email notifications before integrating your email provider of choice."
  ([knock-test](https://docs.knock.app/integrations/email/knock-test))
- Callout: "This provider is for testing purposes only. Sending is limited to email addresses associated with the
  members of your Knock account." ([knock-test](https://docs.knock.app/integrations/email/knock-test))
- FAQ, "Can I use this provider for production use?": "No. This provider is for testing only: it sends up to 100 emails
  per month, and only to the members of your Knock account. To send email to your users, configure a different email
  provider." ([knock-test FAQ](https://docs.knock.app/integrations/email/knock-test#faq-test-provider-in-production))
- The provider list names it "Knock (testing only)". It is the only provider marked that way.
  ([email overview](https://docs.knock.app/integrations/email/overview))

### 2. Sending domain and From address

- The channel's one setting is "**From email address** (`string`) - The email address Knock sends from for this
  channel. Read-only." ([knock-test, Channel configuration](https://docs.knock.app/integrations/email/knock-test))
  The page says nothing about using your own domain, SPF or DKIM.
- Overrides only allow a From *name*, To, Cc, Bcc and Reply-to, not the From address.
  ([knock-test](https://docs.knock.app/integrations/email/knock-test))
- Knock's "Custom domains" cover link tracking, short links, open tracking and the hosted preference center. They are
  not sending domains. ([custom domains](https://docs.knock.app/manage-your-account/custom-domains))
- With Postmark through Knock, the From address is ours: "**From email address** … The default sender email address
  (can use Liquid tags)", and Postmark needs "A verified sender signature or domain in Postmark".
  ([postmark](https://docs.knock.app/integrations/email/postmark))

So the built-in channel cannot send from `hello@cadence.dev` (the address in `app/lib/mailer.server.ts`).

### 3. Limits on the free plan

- Built-in channel: "You can send up to 100 emails per month for free." Over the limit, "your emails will be marked as
  `undelivered` and will not be sent to the recipient. You will be able to send emails again at the start of the next
  month." ([knock-test FAQ](https://docs.knock.app/integrations/email/knock-test#faq-email-send-limit))
- Recipients: only addresses that belong to members of the Knock account. Any other address gets "a delivery error
  (`knock_recipient_not_allowed`)". ([knock-test, Allowed recipients](https://docs.knock.app/integrations/email/knock-test))
  A Cadence student is not a member of our Knock account, so a refund email to a student would always fail.
- Environments: "all new Knock accounts will have the channel enabled and ready to use across all environments", and
  it is configured per environment. ([knock-test](https://docs.knock.app/integrations/email/knock-test))
- The Knock plan itself: the pricing page calls the free plan "Free" (not "Developer"). It costs $0 a month, sends "up
  to 10,000" messages a month, and has unlimited environments, team members and delivery channels.
  ([pricing](https://knock.app/pricing)) The pricing page does not mention the built-in email channel. Its 100-a-month
  cap comes from the docs above.

### 4. Deliverability and delivery tracking

- Tracking exists. The features list "Delivery tracking", "Bounce support", "Knock link and open tracking" and
  "Sandbox mode". Messages move to `delivered` or `bounced`.
  ([knock-test, Delivery tracking](https://docs.knock.app/integrations/email/knock-test))
- Deliverability: Knock publishes nothing about it for this channel: no sending reputation, no SPF/DKIM, no dedicated
  domain. Knock's custom-domains page warns: "You run the risk of having your messages marked as spam if the sending
  domain and the domain you're routing to for links are different."
  ([custom domains](https://docs.knock.app/manage-your-account/custom-domains)) A fixed, Knock-owned From address
  cannot match our domain.

### 5. The alternative: Knock plus an external provider

- Knock supports Amazon SES, Cloudflare Email, MailerSend, Mailgun, Mailjet, Mailtrap, Mandrill, **Postmark**, Resend,
  SendGrid, SMTP and SparkPost. ([email overview](https://docs.knock.app/integrations/email/overview))
- Postmark through Knock needs a Postmark server API key and a From address, and supports delivery tracking and bounces
  through a Postmark webhook (Delivery → `delivered`, Bounce → `bounced`).
  ([postmark](https://docs.knock.app/integrations/email/postmark))
- To move from the test channel to production: "change the channel on each of your existing email steps to use the new
  provider, then publish your workflows". With environments enabled, commit and promote the changes.
  ([knock-test FAQ](https://docs.knock.app/integrations/email/knock-test#faq-test-provider-in-production))

Either way Cadence keeps a Postmark account. It sends directly from `mailer.server.ts` as today, or through a Knock
workflow with a Postmark channel.

## Verdict, with conditions

**"Knock alone can replace Postmark": no.** No setting changes this. The built-in channel is fixed as testing-only (100
emails a month, account members only, read-only Knock From address). Knock's own docs say to configure another email
provider for production.

What the built-in channel *is* good for: trying out Knock email workflows in development and staging environments,
sending to the team's own addresses, before a real provider is wired in.
