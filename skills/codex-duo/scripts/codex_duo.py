#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""codex-duo — stress-test an idea with two persistent Codex app-server agents.

Keeps one ``codex app-server --stdio`` process open, starts two Codex threads, and
drives turns with structured ``turn/start`` calls. Each thread sees only the other
side's reply as its user message (the first A turn sees the opening seed); no prompt
reveals the relay, the turn schedule, or another agent. Standing roles live in
thread-level ``developerInstructions`` (proponent for A, Socratic challenger for B
by default). Sparse hidden ``additionalContext`` nudges shape the arc.

Run:  python3 scripts/codex_duo.py "<concept / idea to stress-test>" [options]
      (uv run scripts/codex_duo.py "<concept>" also works — deps are stdlib only)

The run streams a JSONL log — one record per line, flushed as each turn completes —
so a killed or failed run keeps every turn it finished.
"""

from __future__ import annotations

import argparse
import collections
import json
import os
import queue
import re
import shutil
import subprocess
import sys
import threading
import time
import uuid
from pathlib import Path
from typing import Any

CLIENT_NAME = "codex-duo"
CLIENT_TITLE = "Codex Duo"
CLIENT_VERSION = "0.3.0"
MIN_TURNS = 15
SMOKE_MODEL = "gpt-5.4-mini"
SMOKE_EFFORT = "low"
SMOKE_TURNS = 4

CODEX_INSTALL_HINT = "npm install -g @openai/codex"
CODEX_LOGIN_HINT = "codex login"

# Bundled data lives in <skill>/assets/, resolved relative to this script so the
# skill runs in place from anywhere (incl. through a symlinked skills dir).
SKILL_ROOT = Path(__file__).resolve().parent.parent
ASSETS = SKILL_ROOT / "assets"
PROMPTS = ASSETS / "prompts"
DEFAULT_NUDGES = ASSETS / "default_nudges.json"


class CodexAppServerError(RuntimeError):
    pass


class CodexAppServer:
    """Minimal JSONL app-server client for the subset codex-duo needs."""

    def __init__(self, *, stream_stderr: bool = False):
        self.stream_stderr = stream_stderr
        self.proc: subprocess.Popen[str] | None = None
        self._next_id = 1
        self._messages: "queue.Queue[dict[str, Any] | None]" = queue.Queue()
        self._pending: list[dict[str, Any]] = []
        self._stderr = collections.deque(maxlen=200)
        self._token_usage: dict[tuple[str, str], dict[str, Any]] = {}
        self.user_agent: str | None = None

    def start(self) -> None:
        self.proc = subprocess.Popen(
            ["codex", "app-server", "--stdio"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
        threading.Thread(target=self._read_stdout, daemon=True).start()
        threading.Thread(target=self._read_stderr, daemon=True).start()
        result = self.request(
            "initialize",
            {
                "clientInfo": {
                    "name": CLIENT_NAME,
                    "title": CLIENT_TITLE,
                    "version": CLIENT_VERSION,
                },
                "capabilities": {"experimentalApi": True},
            },
            timeout=30,
        )
        self.user_agent = result.get("userAgent")
        self.notify("initialized", {})

    def close(self) -> None:
        proc = self.proc
        if not proc:
            return
        try:
            if proc.stdin and not proc.stdin.closed:
                proc.stdin.close()
        except BrokenPipeError:
            pass
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=3)

    def start_thread(
        self,
        *,
        cwd: str,
        developer_instructions: str | None,
        model: str | None,
        service_tier: str | None,
        sandbox: str | None,
        approval_policy: str | None,
        config: dict[str, Any] | None,
        timeout: float,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"cwd": cwd}
        if developer_instructions:
            params["developerInstructions"] = developer_instructions
        if model:
            params["model"] = model
        if service_tier:
            params["serviceTier"] = service_tier
        if sandbox:
            params["sandbox"] = sandbox
        if approval_policy:
            params["approvalPolicy"] = approval_policy
        if config:
            params["config"] = config
        return self.request("thread/start", params, timeout=timeout)

    def run_turn(
        self,
        *,
        thread_id: str,
        text: str,
        nudge: str | None,
        effort: str | None,
        timeout: float,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {
            "threadId": thread_id,
            "clientUserMessageId": str(uuid.uuid4()),
            "input": [{"type": "text", "text": text, "text_elements": []}],
        }
        if nudge:
            params["additionalContext"] = {"guidance": {"kind": "application", "value": nudge}}
        if effort:
            params["effort"] = effort

        response = self.request("turn/start", params, timeout=timeout)
        turn = response.get("turn") or {}
        turn_id = turn.get("id")
        if not turn_id:
            raise CodexAppServerError(f"turn/start returned no turn id: {response!r}")

        deadline = time.monotonic() + timeout
        agent_messages: list[str] = []
        final_turn: dict[str, Any] | None = None

        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                self._interrupt(thread_id, turn_id)
                raise TimeoutError(f"turn {turn_id} timed out after {timeout:.0f}s")
            msg = self._recv(timeout=remaining)
            if msg is None:
                raise CodexAppServerError("codex app-server exited while a turn was running")
            self._remember_notification(msg)
            method = msg.get("method")
            params = msg.get("params") or {}

            if method == "item/completed":
                if params.get("threadId") != thread_id or params.get("turnId") != turn_id:
                    continue
                item = params.get("item") or {}
                if item.get("type") == "agentMessage" and item.get("text"):
                    agent_messages.append(item["text"])
            elif method == "turn/completed":
                turn_obj = params.get("turn") or {}
                if params.get("threadId") == thread_id and turn_obj.get("id") == turn_id:
                    final_turn = turn_obj
                    break

        usage = self._token_usage.get((thread_id, turn_id))
        return {
            "turn_id": turn_id,
            "text": "\n\n".join(m.strip() for m in agent_messages if m.strip()).strip(),
            "usage": usage.get("last") if usage else None,
            "usage_total_for_thread": usage.get("total") if usage else None,
            "turn": final_turn,
        }

    def request(self, method: str, params: Any, *, timeout: float) -> dict[str, Any]:
        req_id = self._next_id
        self._next_id += 1
        self._send({"method": method, "id": req_id, "params": params})
        deadline = time.monotonic() + timeout
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise TimeoutError(f"{method} timed out after {timeout:.0f}s")
            # Do not consume self._pending here: those are earlier notifications saved
            # for turn-level processing. Request responses must come from the live
            # transport queue, otherwise an old notification can starve this loop.
            msg = self._recv_live(timeout=remaining)
            if msg is None:
                raise CodexAppServerError(
                    f"codex app-server exited waiting for {method}: {self.stderr_tail()}"
                )
            if msg.get("id") == req_id:
                if "error" in msg:
                    raise CodexAppServerError(f"{method} failed: {msg['error']}")
                return msg.get("result") or {}
            self._pending.append(msg)
            self._remember_notification(msg)

    def notify(self, method: str, params: Any) -> None:
        self._send({"method": method, "params": params})

    def stderr_tail(self) -> str:
        return "\n".join(self._stderr)

    def _interrupt(self, thread_id: str, turn_id: str) -> None:
        try:
            self.request("turn/interrupt", {"threadId": thread_id, "turnId": turn_id}, timeout=10)
        except Exception as exc:  # best-effort cleanup path
            sys.stderr.write(f"[warn] failed to interrupt timed-out turn: {exc}\n")

    def _send(self, msg: dict[str, Any]) -> None:
        if not self.proc or not self.proc.stdin or self.proc.stdin.closed:
            raise CodexAppServerError("codex app-server is not running")
        try:
            self.proc.stdin.write(json.dumps(msg, separators=(",", ":")) + "\n")
            self.proc.stdin.flush()
        except BrokenPipeError as exc:
            raise CodexAppServerError(f"codex app-server stdin closed: {self.stderr_tail()}") from exc

    def _recv(self, *, timeout: float) -> dict[str, Any] | None:
        if self._pending:
            return self._pending.pop(0)
        return self._recv_live(timeout=timeout)

    def _recv_live(self, *, timeout: float) -> dict[str, Any] | None:
        try:
            return self._messages.get(timeout=timeout)
        except queue.Empty as exc:
            raise TimeoutError("timed out waiting for codex app-server message") from exc

    def _read_stdout(self) -> None:
        assert self.proc and self.proc.stdout
        for line in self.proc.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                self._messages.put(json.loads(line))
            except json.JSONDecodeError:
                self._stderr.append(f"[non-json stdout] {line}")
        self._messages.put(None)

    def _read_stderr(self) -> None:
        assert self.proc and self.proc.stderr
        for line in self.proc.stderr:
            line = line.rstrip()
            self._stderr.append(line)
            if self.stream_stderr:
                sys.stderr.write(f"[codex app-server] {line}\n")

    def _remember_notification(self, msg: dict[str, Any]) -> None:
        if msg.get("method") != "thread/tokenUsage/updated":
            return
        params = msg.get("params") or {}
        thread_id = params.get("threadId")
        turn_id = params.get("turnId")
        token_usage = params.get("tokenUsage")
        if thread_id and turn_id and isinstance(token_usage, dict):
            self._token_usage[(thread_id, turn_id)] = token_usage


class JsonlLog:
    """Per-run log: one JSON record per line, flushed as it is written."""

    def __init__(self, path: str):
        parent = os.path.dirname(os.path.abspath(path))
        if parent:
            os.makedirs(parent, exist_ok=True)
        self._f = open(path, "w", encoding="utf-8")
        self.path = path

    def emit(self, **rec: Any) -> None:
        rec.setdefault("ts", time.time())
        self._f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        self._f.flush()

    def close(self) -> None:
        try:
            self._f.close()
        except Exception:
            pass


def resolve_persona(val: str | None, concept: str) -> str | None:
    if not val:
        return None
    named = PROMPTS / f"{val}.md"
    if named.is_file():                                   # named library persona
        text = named.read_text(encoding="utf-8").strip()
    elif os.path.isfile(val):                            # filesystem path
        text = Path(val).read_text(encoding="utf-8").strip()
    else:                                                # literal text
        text = val
    return text.replace("{concept}", concept)


def default_nudges() -> list[Any]:
    return json.loads(DEFAULT_NUDGES.read_text(encoding="utf-8"))


def load_nudge_entries(source: str) -> list[Any]:
    if source.startswith("@"):
        text = open(source[1:], encoding="utf-8").read()
    elif os.path.isfile(source):
        text = open(source, encoding="utf-8").read()
    else:
        text = source
    try:
        entries = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"invalid nudge JSON: {exc}") from exc
    if not isinstance(entries, list):
        raise ValueError("nudge JSON must be an array")
    return entries


def resolve_turn_index(expr: Any, max_turns: int) -> int:
    if isinstance(expr, bool):
        raise ValueError("turnIndex must not be boolean")
    if isinstance(expr, int):
        index = expr
    elif isinstance(expr, str):
        compact = re.sub(r"\s+", "", expr)
        if re.fullmatch(r"-?\d+", compact):
            index = int(compact)
        else:
            match = re.fullmatch(r"(maxTurns|turns|lastTurn|lastA|lastB)([+-]\d+)?", compact)
            if not match:
                raise ValueError(f"unsupported turnIndex expression: {expr!r}")
            base_name, offset_text = match.groups()
            last_turn_index = max_turns - 1
            if base_name in {"maxTurns", "turns"}:
                index = max_turns
            elif base_name == "lastTurn":
                index = last_turn_index
            elif base_name == "lastA":  # last A turn = last even turn index
                index = last_turn_index - (last_turn_index % 2)
            else:  # lastB = last B turn = last odd turn index
                index = last_turn_index - (1 - last_turn_index % 2)
            if offset_text:
                index += int(offset_text)
    else:
        raise ValueError("turnIndex must be an integer or expression string")

    if not 0 <= index < max_turns:
        raise ValueError(f"turnIndex {expr!r} resolved outside 0..{max_turns - 1}")
    return index


def nudge_entry_parts(entry: Any) -> tuple[Any, str]:
    if isinstance(entry, list) and len(entry) == 2:
        index_expr, value = entry
    elif isinstance(entry, dict):
        index_expr = entry.get("turnIndex", entry.get("turn_index", entry.get("index")))
        value = entry.get("nudge", entry.get("text", entry.get("value")))
    else:
        raise ValueError("each nudge entry must be [turnIndex, text] or an object")

    if index_expr is None:
        raise ValueError("nudge entry is missing turnIndex")
    if not isinstance(value, str) or not value.strip():
        raise ValueError("nudge entry text must be a non-empty string")
    return index_expr, value.strip()


def build_nudge_schedule(entries: list[Any], max_turns: int) -> dict[int, str]:
    schedule: dict[int, str] = {}
    for entry in entries:
        index_expr, value = nudge_entry_parts(entry)
        index = resolve_turn_index(index_expr, max_turns)
        if index in schedule:
            raise ValueError(f"duplicate nudge turnIndex resolved to {index}")
        schedule[index] = value
    return schedule


def choose_nudge(turn: int, schedule: dict[int, str]) -> str | None:
    """Return the hidden nudge for this 1-based turn (A or B), if any."""
    return schedule.get(turn - 1)


def usage_add(total: dict[str, int], usage: dict[str, Any] | None) -> dict[str, int]:
    if not usage:
        return total
    mapping = {
        "totalTokens": "total_tokens",
        "inputTokens": "input_tokens",
        "cachedInputTokens": "cached_input_tokens",
        "outputTokens": "output_tokens",
        "reasoningOutputTokens": "reasoning_output_tokens",
    }
    for src, dst in mapping.items():
        value = usage.get(src)
        if isinstance(value, int):
            total[dst] = total.get(dst, 0) + value
    return total


def normalize_effort(effort: str | None) -> tuple[str | None, str | None]:
    if effort == "max":
        return "xhigh", "max is not an app-server ReasoningEffort; using xhigh."
    return effort, None


def default_output_path(cwd: str) -> str:
    return os.path.join(cwd, ".tmp", time.strftime("%Y%m%d-%H%M%S") + ".jsonl")


def _mark(ok: bool) -> str:
    return "✓" if ok else "✗"


def codex_home() -> str:
    return os.environ.get("CODEX_HOME") or os.path.expanduser("~/.codex")


def check_prereqs() -> list[tuple[str, bool, str]]:
    """Each runtime prerequisite as (name, ok, detail)."""
    codex_path = shutil.which("codex")
    auth = os.path.join(codex_home(), "auth.json")
    has_auth = os.path.isfile(auth)
    return [
        ("python >= 3.10", sys.version_info >= (3, 10),
         f"{sys.version_info.major}.{sys.version_info.minor}"),
        ("codex CLI on PATH", bool(codex_path),
         codex_path or f"missing — `{CODEX_INSTALL_HINT}`"),
        ("codex authenticated", has_auth,
         auth if has_auth else f"no auth.json — `{CODEX_LOGIN_HINT}`"),
    ]


REQUIRED_PREREQS = {"codex CLI on PATH", "codex authenticated"}


def preflight_or_exit() -> None:
    missing = [(n, d) for n, ok, d in check_prereqs() if not ok and n in REQUIRED_PREREQS]
    if not missing:
        return
    sys.stderr.write("codex-duo: cannot run — missing prerequisites:\n")
    for name, detail in missing:
        sys.stderr.write(f"  {_mark(False)} {name}: {detail}\n")
    sys.stderr.write("Re-run with --doctor to check and fix, then retry.\n")
    raise SystemExit(1)


def _app_server_handshake() -> tuple[bool, str]:
    app = CodexAppServer()
    try:
        app.start()
        return True, f"ok (server {app.user_agent})"
    except Exception as exc:  # noqa: BLE001 - report any failure
        return False, str(exc)
    finally:
        app.close()


def run_doctor() -> int:
    print("codex-duo doctor — checking prerequisites\n")
    for name, ok, detail in check_prereqs():
        print(f"  {_mark(ok)} {name}: {detail}")

    if not shutil.which("codex"):
        print("\nInstalling the codex CLI...")
        if shutil.which("npm"):
            rc = subprocess.run(["npm", "install", "-g", "@openai/codex"]).returncode
            print(f"  `{CODEX_INSTALL_HINT}` exited {rc}")
        else:
            print(f"  ! npm not found — install codex manually: `{CODEX_INSTALL_HINT}`")
    if not os.path.isfile(os.path.join(codex_home(), "auth.json")):
        print(f"\n  ! Not authenticated — run (interactive):  {CODEX_LOGIN_HINT}")

    required_ok = all(ok for n, ok, _ in check_prereqs() if n in REQUIRED_PREREQS)
    if required_ok:
        ok, detail = _app_server_handshake()
        print(f"\n  {_mark(ok)} codex app-server handshake: {detail}")
        if ok:
            print("\nAll good — codex-duo is ready.")
            return 0
    print("\nStill blocked — fix the items above and re-run with --doctor.")
    return 1


def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog="codex-duo", description="Stress-test an idea with two Codex agents.")
    ap.add_argument("concept", nargs="?", help="the idea/claim to stress-test")
    ap.add_argument("--doctor", action="store_true",
                    help="check prerequisites (codex CLI, auth) and try to fix them")
    ap.add_argument("--turns", type=int, default=None,
                    help=f"total replies, alternating A,B,...; default {MIN_TURNS} (min {MIN_TURNS}; --smoke lowers the floor)")
    ap.add_argument("--smoke", action="store_true",
                    help=f"quick pipeline check: low model ({SMOKE_MODEL}), low effort, {SMOKE_TURNS} turns")
    ap.add_argument("--system-a", help="A's developer prompt; default: proponent of the concept. Supports {concept}.")
    ap.add_argument("--system-b", help="B's developer prompt; default: socratic. Supports {concept}.")
    ap.add_argument("--opening", help="A's first visible user message")
    ap.add_argument("--no-nudges", action="store_true", help="disable hidden sparse nudges")
    ap.add_argument("--nudges", default=None, help="nudge JSON array, file path, or @file path (default: bundled schedule)")
    ap.add_argument("--effort", choices=["none", "minimal", "low", "medium", "high", "xhigh", "max"],
                    help="app-server ReasoningEffort override; max is treated as xhigh")
    ap.add_argument("--model", help="model override for both agent threads")
    ap.add_argument("--service-tier", help="service tier override for both agent threads")
    ap.add_argument("--sandbox", choices=["read-only", "workspace-write", "danger-full-access"],
                    help="sandbox for both app-server threads")
    ap.add_argument("--approval", choices=["untrusted", "on-failure", "on-request", "never"],
                    help="approval policy for both app-server threads")
    ap.add_argument("--timeout", type=int, default=1800, help="per operation/turn seconds")
    ap.add_argument("--out", help="JSONL run-log path (default ./.tmp/<timestamp>.jsonl)")
    ap.add_argument("--app-stderr", action="store_true", help="stream codex app-server stderr while running")
    return ap


def main() -> int:
    ap = build_parser()
    args = ap.parse_args()

    if args.doctor:
        return run_doctor()
    if not args.concept:
        ap.error("the following arguments are required: concept")
    preflight_or_exit()

    if args.smoke:                      # presets; any explicit flag still wins
        if args.model is None:
            args.model = SMOKE_MODEL
        if args.effort is None:
            args.effort = SMOKE_EFFORT
    turns = args.turns if args.turns is not None else (SMOKE_TURNS if args.smoke else MIN_TURNS)
    floor = 1 if args.smoke else MIN_TURNS
    if turns < floor:
        ap.error(f"turns must be >= {floor}")

    effort, effort_warning = normalize_effort(args.effort)
    if effort_warning:
        sys.stderr.write(f"[warn] {effort_warning}\n")

    persona = {
        "A": resolve_persona(args.system_a or "proponent", args.concept),
        "B": resolve_persona(args.system_b or "socratic", args.concept),
    }
    opening = args.opening or (
        "Explain your idea and the reasoning behind it." if not args.system_a else args.concept
    )
    output_path = args.out or default_output_path(os.getcwd())

    # The bundled default schedule targets full-length runs (lastA-4, etc.); a
    # short --smoke loop has nowhere to put them, so smoke runs nudge-free unless
    # the caller passes --nudges explicitly.
    nudges_off = args.no_nudges or (args.smoke and args.nudges is None)
    try:
        if nudges_off:
            nudge_entries: list[Any] = []
        elif args.nudges:
            nudge_entries = load_nudge_entries(args.nudges)
        else:
            nudge_entries = default_nudges()
        nudge_schedule = build_nudge_schedule(nudge_entries, turns)
    except ValueError as exc:
        ap.error(str(exc))

    config_rec = {
        "turns": turns,
        "smoke": args.smoke,
        "effort": effort or "(config default)",
        "model": args.model or "(config default)",
        "service_tier": args.service_tier or "(config default)",
        "sandbox": args.sandbox or "(config default)",
        "approval": args.approval or "(config default)",
        "nudges": bool(nudge_entries),
        "nudge_source": None if nudges_off else (args.nudges or "bundled"),
        "nudge_schedule": [
            {"turn": idx + 1, "turn_index": idx, "nudge": v} for idx, v in sorted(nudge_schedule.items())
        ],
    }

    log = JsonlLog(output_path)
    log.emit(type="meta", client=CLIENT_NAME, version=CLIENT_VERSION, cwd=os.getcwd(),
             concept=args.concept, opening=opening, config=config_rec)
    log.emit(type="seed", turn=0, speaker="seed", concept=args.concept, opening=opening)

    app = CodexAppServer(stream_stderr=args.app_stderr)
    threads: dict[str, dict[str, Any]] = {}
    usage_total: dict[str, int] = {}
    completed = 0
    status = "incomplete"

    try:
        app.start()
        for who in ("A", "B"):
            threads[who] = app.start_thread(
                cwd=os.getcwd(), developer_instructions=persona[who], model=args.model,
                service_tier=args.service_tier, sandbox=args.sandbox,
                approval_policy=args.approval, config=None, timeout=args.timeout,
            )
        log.emit(
            type="agents",
            transport={"kind": "codex app-server stdio", "client": CLIENT_NAME, "user_agent": app.user_agent},
            agents={
                who: {
                    "thread_id": threads[who]["thread"]["id"],
                    "path": threads[who]["thread"].get("path"),
                    "role_source": (args.system_a if who == "A" else args.system_b)
                    or (f"{'proponent' if who == 'A' else 'socratic'} (default)"),
                    "developer_instructions": persona[who],
                }
                for who in ("A", "B")
            },
        )

        message = opening
        for i in range(1, turns + 1):
            spk = "A" if i % 2 == 1 else "B"
            thread_id = threads[spk]["thread"]["id"]
            nudge = choose_nudge(i, nudge_schedule)
            result = app.run_turn(thread_id=thread_id, text=message, nudge=nudge, effort=effort, timeout=args.timeout)
            reply = result["text"]
            if not reply:
                sys.stderr.write(f"[turn {i}] agent {spk} returned no message; stopping.\n")
                status = "stopped"
                break
            usage_total = usage_add(usage_total, result.get("usage"))
            completed = i
            log.emit(type="turn", turn=i, speaker=spk, thread_id=thread_id, turn_id=result["turn_id"],
                     nudge=nudge, text=reply, usage=result.get("usage"),
                     turn_status=(result.get("turn") or {}).get("status"))
            sys.stderr.write(f"[turn {i}/{turns} {spk}] {len(reply)} chars\n")
            message = reply
        else:
            status = "complete"
        return 0
    except KeyboardInterrupt:
        status = "interrupted"
        sys.stderr.write("\n[interrupted]\n")
        return 130
    except Exception as exc:  # noqa: BLE001 - surface any failure into the log + exit code
        status = "error"
        sys.stderr.write(f"[error] {exc}\n")
        log.emit(type="error", message=str(exc))
        return 1
    finally:
        log.emit(type="summary", status=status, completed_turns=completed, usage_total=usage_total,
                 output_path=output_path)
        log.close()
        app.close()


if __name__ == "__main__":
    raise SystemExit(main())
