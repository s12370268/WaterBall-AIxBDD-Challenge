"""Narrow structural checks for this skill; not a general YAML validator."""
import json
import re
import sys
from pathlib import Path

root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "conventional-commits"
content = (root / "SKILL.md").read_text(encoding="utf-8")
assert content.startswith("---\n")
frontmatter = content.split("---\n", 2)[1]
fields = dict(line.split(": ", 1) for line in frontmatter.strip().splitlines())
assert set(fields) == {"name", "description"}
assert fields["name"] == root.name
assert 0 < len(fields["description"]) < 1024
assert len(content.splitlines()) < 500
for path in root.rglob("*.md"):
    for target in re.findall(r"\]\(([^)]+)\)", path.read_text(encoding="utf-8")):
        if "://" not in target:
            assert (path.parent / target).is_file(), (path, target)
evals = json.loads((root / "evals/evals.json").read_text(encoding="utf-8"))
assert evals["skill_name"] == root.name
assert len(evals["evals"]) == 3
assert sum(len(e["expectations"]) for e in evals["evals"]) == 10
print("PASS: frontmatter fields, name, size, local references, eval JSON and 10 expectations")
