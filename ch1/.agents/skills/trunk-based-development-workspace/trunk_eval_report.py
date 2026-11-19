"""Aggregate semantic grading without inventing unavailable usage measurements."""
import json
import statistics
from pathlib import Path

root = Path(__file__).resolve().parents[3]
work = root / '.agents/skills/trunk-based-development-workspace/iteration-1'
report = {'metadata': {'skill_name': 'trunk-based-development', 'evals_run': [1, 2, 3], 'runs_per_configuration': 1}, 'runs': [], 'run_summary': {}, 'notes': ['每個設定由同一代理依序作答三題，並非逐題隔離。', '每題僅一次，提示已明確提供限制；不構成一般準確率提升的證據。', '無可用 task-level token 與 duration 量測，故省略。']}
for directory in sorted(work.iterdir()):
    if not (directory / 'eval_metadata.json').exists():
        continue
    meta = json.loads((directory / 'eval_metadata.json').read_text(encoding='utf-8-sig'))
    for config in ('with_skill', 'without_skill'):
        grade = json.loads((directory / config / 'grading.json').read_text(encoding='utf-8-sig'))
        report['runs'].append({'eval_id': meta['eval_id'], 'eval_name': meta['eval_name'], 'configuration': config, 'run_number': 1, 'result': grade['summary'], 'expectations': grade['expectations']})
for config in ('with_skill', 'without_skill'):
    rates = [r['result']['pass_rate'] for r in report['runs'] if r['configuration'] == config]
    report['run_summary'][config] = {'pass_rate': {'mean': statistics.mean(rates), 'stddev': statistics.stdev(rates), 'min': min(rates), 'max': max(rates)}}
delta = report['run_summary']['with_skill']['pass_rate']['mean'] - report['run_summary']['without_skill']['pass_rate']['mean']
report['run_summary']['delta'] = {'pass_rate': f'{delta:+.2f}'}
out = work / 'benchmark.json'
out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report['run_summary'], ensure_ascii=False))
