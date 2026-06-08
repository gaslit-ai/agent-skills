---
name: codex-duo
description: Stress-test an idea before you trust or act on it — spawns two persistent Codex agents (one defending the claim, one challenging it with no priors) that drive it over many turns into its strongest defensible, bounded, falsifiable form, or expose where it fails; returns the transcript and the sharpened claim. Use this whenever a non-trivial, contestable claim, belief, thesis, plan, or design/architecture decision is asserted and would benefit from scrutiny before it is relied on — e.g. "X replaces Y", "we should do Z", "the right approach is…", a strong opinion, or a hypothesis — EVEN WHEN the user does not explicitly ask to test, debate, or critique it. Also use on explicit requests to pressure-test, red-team, play devil's advocate, steel-man, sanity-check, or get an unbiased second opinion on an idea.
allowed-tools: Bash, Read, Write
---

# codex-duo

## What it does

Stress-test an idea: two persistent Codex agents argue it out — agent A holds and
defends the idea, agent B challenges it with no priors — until it is sharpened into
its strongest bounded, falsifiable form, or shown to fail. The value is the
asymmetry: real scrutiny comes from a mind that didn't author the belief.

## Use it

```bash
codex-duo "<concept / idea to stress-test>"
```

The run streams a JSONL log (one record per line) to `./.tmp/<timestamp>.jsonl`
(or `--out PATH`): a `meta` line, then one `turn` line per turn as it completes,
then a `summary`. Read that file for the transcript and the final sharpened claim.

Add `--smoke` for a fast sanity run (low model, 4 turns).

Common options:

- `--turns N` — length of the debate (default 15).
- `--system-a` / `--system-b` — swap a side's role: a library persona
  (`proponent`, `socratic`), a file path, or literal text; `{concept}` is filled in.
- `--effort low|medium|high|xhigh|max`, `--model`, `--sandbox`, `--out`, `--timeout`.

Run `codex-duo --help` for everything.

## Personas

Default A = `proponent` (defends the concept); default B = `socratic` (a fresh
challenger that forces real, falsifiable improvement). Add roles as
`codex_duo/prompts/<name>.md` and reference them by bare name via `--system-a/-b`.