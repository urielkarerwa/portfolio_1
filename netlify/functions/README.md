# Digital twin — deployment notes

The chat widget on the site talks to `twin.js`, a Netlify Function that relays to
the Anthropic Messages API. The API key stays server-side and never reaches the
browser.

## One-time setup on Netlify

1. In the Netlify site dashboard, go to **Site configuration → Environment variables**.
2. Add a variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key from console.anthropic.com
   - Scope: leave as all scopes (the function reads it at runtime).
3. Redeploy (any new deploy picks up the variable). The function is bundled
   automatically from `netlify/functions/` per `netlify.toml`.

## Recommended guardrails

- In the Anthropic console, set a monthly spend limit or billing alert so a bad
  day cannot surprise you.
- The function already caps history to the last 10 turns and each message to
  2000 characters, and it only answers from the embedded knowledge base.

## Model and cost

- Model: `claude-haiku-4-5`.
- The static system prompt is sent with `cache_control` so repeat requests pay a
  fraction of the input rate. Real-world cost is a few tenths of a cent per
  conversation.

## Updating what the twin knows

The twin's knowledge comes from two shared sources, assembled into the system
prompt at build time so nothing is duplicated:

- `data/twin-knowledge.js` — bio, voice, experience, skills, contact, FAQ.
- `data/projects.json` — the same project data the Work page renders. Edit a
  project once and both the site and the twin update. The private
  `_internalReferences` field is never sent to the model.

Redeploy after editing either file.

## Optional: log conversations to Notion

If you set both of these environment variables, each exchange is written as a
row in a Notion database. Leave them unset and logging is simply skipped (the
chat works either way):

- `NOTION_TOKEN` — an internal Notion integration secret.
- `NOTION_DB_ID` — the target database's 32-character id.

The database must have these properties (exact names): `Name` (title),
`Question` (text), `Reply` (text), `Session` (text), `Language` (text),
`Time` (date). Share the database with the integration, or the API returns 404.
Logging is wrapped in try/catch with a 4s timeout, so it can never break or slow
the chat noticeably, and the API key stays server-side like `ANTHROPIC_API_KEY`.
