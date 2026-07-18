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

Edit the `KNOWLEDGE_BASE` string in `twin.js` and redeploy. Everything the twin
can say comes from that text, by design, so it cannot invent facts.
