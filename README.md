# NoSpamCalls

Free spam-number lookup, community reports, and a guide to stopping unwanted calls.

## Stack

SvelteKit, TypeScript, Tailwind CSS, and `@sveltejs/adapter-vercel`. Reports and waitlist emails are stored in a Postgres database (Neon). Database credentials and the IP-hash secret live in environment variables, never in this repository.

## Pages

- `/` — number search
- `/number/[e164]` — lookup, report counts, comments, and a report form (SSR, SEO meta, JSON-LD)
- `/report` — standalone report form
- `/stop-spam-calls` — free Do Not Call, carrier, iOS, Android, and data-broker guide
- `/business` — “Scam Likely” business waitlist
- `/app` — consumer app waitlist
- `/privacy`, `/terms`
- `/sitemap.xml`, `/robots.txt`

## Local development

```sh
cp .env.example .env
# fill in DATABASE_URL and IP_HASH_SECRET
npm install
npm run dev
```

## Environment variables

- `DATABASE_URL` — Postgres connection string
- `IP_HASH_SECRET` — salt used to hash IP addresses for rate limiting
- `PUBLIC_SITE_URL` — canonical origin, for example `https://nospamcalls.org`

## Notes

This site is not legal advice and does not guarantee that spam calls will stop. Comments are user-generated opinions. Advertisement areas are placeholders only; no ad network is connected.
