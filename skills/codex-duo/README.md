# codex-duo

Stress-test an idea with two persistent Codex agents — a proponent that defends it
and a fresh challenger that pressures it — until it is sharpened into its strongest
bounded, falsifiable form or shown to fail.

See [`SKILL.md`](SKILL.md) for usage. This README is just install/bootstrap.

## Requirements

- Python ≥ 3.10
- The [`codex`](https://github.com/openai/codex) CLI on PATH, authenticated (`codex login`)

## Install

```bash
uv tool install .          # or:  pipx install .
```

Puts `codex-duo` on your PATH. For development: `uv tool install --editable .`.

## First run / troubleshooting

```bash
codex-duo --doctor                       # check prerequisites; install/fix what it can
codex-duo --smoke "is X better than Y"   # ~1-minute end-to-end sanity run
codex-duo "<your idea>"                   # full run
```

If a run can't start, it prints exactly which prerequisite is missing and points
you at `codex-duo --doctor`.
