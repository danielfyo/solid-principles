#!/usr/bin/env python3
"""Keep the code shown in README.md identical to the real, tested source files.

The README contains markers such as:

    <!-- snippet: go/srp/bad/order_service.go, go/srp/good/order.go -->
    <!-- /snippet -->

Everything between the markers is regenerated from the listed files.

Usage:
    python3 scripts/sync_readme.py          # rewrite README.md in place
    python3 scripts/sync_readme.py --check  # exit 1 if README.md is out of date (CI)
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
README = ROOT / "README.md"

LANGUAGES = {".cs": "csharp", ".py": "python", ".go": "go", ".ts": "typescript", ".tsx": "tsx"}
COMMENT = {".py": "#"}

SNIPPET = re.compile(
    r"(?P<open><!-- snippet: (?P<paths>[^>]+?) -->)\n.*?(?P<close><!-- /snippet -->)",
    re.DOTALL,
)


def render(paths: list[str]) -> str:
    suffix = Path(paths[0]).suffix
    language = LANGUAGES[suffix]
    parts: list[str] = []
    for relative in paths:
        source = (ROOT / relative).read_text(encoding="utf-8").rstrip()
        if len(paths) > 1:
            prefix = COMMENT.get(Path(relative).suffix, "//")
            source = f"{prefix} ── {relative} ──\n{source}"
        parts.append(source)
    body = "\n\n".join(parts)
    return f"```{language}\n{body}\n```\n"


def sync(text: str) -> str:
    def replace(match: re.Match[str]) -> str:
        paths = [p.strip() for p in match["paths"].split(",") if p.strip()]
        return f"{match['open']}\n{render(paths)}{match['close']}"

    return SNIPPET.sub(replace, text)


def main() -> int:
    current = README.read_text(encoding="utf-8")
    updated = sync(current)
    if "--check" in sys.argv:
        if current != updated:
            print("README.md is out of date. Run: python3 scripts/sync_readme.py")
            return 1
        print("README.md snippets are up to date.")
        return 0
    README.write_text(updated, encoding="utf-8")
    print("README.md snippets synchronised.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
