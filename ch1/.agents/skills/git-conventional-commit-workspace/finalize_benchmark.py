"""Remove unavailable metrics emitted as zeros by the stock aggregator."""
import json
import statistics
from pathlib import Path

root = Path(__file__).resolve().parent / "iteration-1"
path = root / "benchmark.json"
data = json.loads(path.read_text(encoding="utf-8"))
if not data["runs"]:
    # Stock aggregator expects an extra run-1 level; our one-run layout is flat.
    data["metadata"] = {"skill_name": "conventional-commits", "evals_run": [1, 2, 3], "runs_per_configuration": 1}
    data["run_summary"] = {}
    for directory in sorted(root.glob("eval-*")):
        metadata = json.loads((directory / "eval_metadata.json").read_text(encoding="utf-8"))
        for config in ("with_skill", "without_skill"):
            grading = json.loads((directory / config / "grading.json").read_text(encoding="utf-8"))
            data["runs"].append({"eval_id": metadata["eval_id"], "eval_name": metadata["eval_name"], "configuration": config, "run_number": 1, "result": grading["summary"], "expectations": grading["expectations"]})
    for config in ("with_skill", "without_skill"):
        rates = [r["result"]["pass_rate"] for r in data["runs"] if r["configuration"] == config]
        data["run_summary"][config] = {"pass_rate": {"mean": statistics.mean(rates), "stddev": statistics.stdev(rates), "min": min(rates), "max": max(rates)}}
    data["run_summary"]["delta"] = {"pass_rate": f"{data['run_summary']['with_skill']['pass_rate']['mean'] - data['run_summary']['without_skill']['pass_rate']['mean']:+.2f}"}
for run in data["runs"]:
    for key in ("time_seconds", "tokens", "tool_calls", "errors"):
        run["result"].pop(key, None)
for summary in data["run_summary"].values():
    for key in ("time_seconds", "tokens"):
        summary.pop(key, None)
data["runs"].sort(key=lambda r: (r["eval_id"], r["configuration"] != "with_skill"))
data["notes"] = [
    "每種設定僅各跑三題、每題一次；測試提示已明示關鍵限制，辨識力有限。",
    "沒有可用的執行時間與 token 量測，未填入推算值或零值。",
    "兩組回答皆通過時只能證明此組基本案例相容，不能證明 skill 帶來準確率提升。",
    "詳細語意評分與測試限制見 analysis.md。",
]
path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
lines = ["# Conventional Commits 基本案例比較", "", "| 設定 | 通過率（各三題一次） |", "| --- | --- |"]
for config in ("with_skill", "without_skill"):
    stat = data["run_summary"][config]["pass_rate"]
    lines.append(f"| {config} | {stat['mean']:.0%} |")
lines += ["", *[f"- {note}" for note in data["notes"]]]
root.joinpath("benchmark.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("Removed unmeasured metrics; retained assertion results only.")
