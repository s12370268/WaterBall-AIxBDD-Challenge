"""Record inline human-readable grading; validate this skill and render official viewer."""
import json
import re
import statistics
import subprocess
import sys
from pathlib import Path

workspace = Path(__file__).resolve().parent
skill = workspace.parent / 'double-diamond-principle'
iteration = workspace / 'iteration-1'
creator = workspace.parent / 'skill-creator-ziv'
data = json.loads((skill / 'evals/evals.json').read_text(encoding='utf-8'))

# Narrow checks for this skill's plain scalar frontmatter; not a general YAML parser.
content = (skill / 'SKILL.md').read_text(encoding='utf-8')
assert content.startswith('---\n')
fields = dict(line.split(': ', 1) for line in content.split('---\n', 2)[1].strip().splitlines())
assert set(fields) == {'name', 'description'}
assert fields['name'] == skill.name == data['skill_name']
assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', fields['name'])
assert 0 < len(fields['description']) <= 1024
assert len(content.splitlines()) < 500
for file in skill.rglob('*.md'):
    text = file.read_text(encoding='utf-8')
    assert '\ufffd' not in text, file
    for target in re.findall(r'\]\(([^)]+)\)', text):
        if '://' not in target:
            assert (file.parent / target).is_file(), (file, target)

# Content judgments from direct inspection of the four outputs; quoted evidence below.
evidence = {
    (1, 'with_skill'): [
        (True, 'AI 聊天機器人先列候選方案。'),
        (True, '以下是待執行計畫，尚無研究結果；未知，基準待量測。'),
        (True, '情境清單依賴閱讀、人工導入彈性高但人力貴、AI 答疑可能答錯且未必解決設定。'),
        (True, '假設新客在首次設定時缺乏可行指引；尚無資料支持因果。依卡點頻率、影響與反例重定義。'),
        (True, '記錄獨立完成、耗時、錯誤、求助及客服工時；重大誤導停測；未改善任務則淘汰或修改。')
    ],
    (1, 'without_skill'): [
        (True, '列為待驗證假設；聊天機器人只是候選解法。'),
        (True, '缺資料先補最少埋點，不拿猜測當基準；訪談與事件盤點均寫為未來行動。'),
        (True, '設定清單、人工主動協助、聊天助理；以管理員不知道設定資料的候選問題測任務完成。機制說明較簡略。'),
        (True, '例如「管理員不知道完成設定所需的資料」；先整理證據、反例與未知，並訪談不同狀態客戶。'),
        (True, '獨立完成率、耗時、錯誤與求助次數；沒有改善便回看問題定義。擴大前先以同任務原型篩選。')
    ],
    (2, 'with_skill'): [
        (True, '保留 8 人中 6 人完成、其中 3 人的文件困惑與第一線電話瓶頸說法，並明言未能推廣或推論因果。'),
        (True, '回 Discover／Define；區分文件不清、表單負擔與諮詢量能。'),
        (True, '第一天回看卡點與電話紀錄，第二天共看三案並測低成本原型；兩天後記錄證據與取捨。'),
        (True, '文件清單＋範例、表單提示、預約回電；觀察列對證明、完成任務、耗時及求助負擔。'),
        (True, '文件辨識改善且未增加負擔則保留；仍誤解則修改；卡在等待則回 Define；列出四項不能下的結論。')
    ],
    (2, 'without_skill'): [
        (True, '保留 6/8 與證明困惑；先確認 3 位是否已完成；第一線說法先當線索。'),
        (True, '回到定義問題做小幅補查；表單長度、證明準備不清、電話等待三個假設並列。'),
        (True, '第一天上午回看紀錄、下午製作版本；第二天做任務並檢查送件品質。'),
        (True, '證明清單與範例、諮詢分流入口；記錄耗時、求助和補件。'),
        (False, '有列不能下的結論，也說當日決定保留、修正或撤回，但未交代哪些觀察結果分別導向哪個決策。')
    ]
}

runs = []
for item in data['evals']:
    for config in ['with_skill', 'without_skill']:
        directory = iteration / f"eval-{item['id']}-{item['name']}" / config
        answer = (directory / 'outputs/response.md').read_text(encoding='utf-8')
        chars = len(re.sub(r'\s', '', answer))
        assert chars <= (800 if item['id'] == 1 else 500), (directory, chars)
        judgments = evidence[item['id'], config]
        expectations = [{'text': text, 'passed': passed, 'evidence': reason}
                        for text, (passed, reason) in zip(item['expectations'], judgments)]
        passed = sum(result['passed'] for result in expectations)
        summary = {'passed': passed, 'failed': 5 - passed, 'total': 5, 'pass_rate': passed / 5}
        grading = {'expectations': expectations, 'summary': summary,
                   'execution_metrics': {'output_chars_without_whitespace': chars},
                   'eval_feedback': {'overall': '流程可用性檢查；樣本少，且由 skill 作者評閱，不是盲測。'}}
        (directory / 'grading.json').write_text(json.dumps(grading, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        runs.append({'eval_id': item['id'], 'eval_name': item['name'], 'configuration': config,
                     'run_number': 1, 'result': summary, 'expectations': expectations})

run_summary = {}
for config in ['with_skill', 'without_skill']:
    values = [r['result']['pass_rate'] for r in runs if r['configuration'] == config]
    run_summary[config] = {'pass_rate': {'mean': statistics.mean(values), 'stddev': statistics.stdev(values),
                                        'min': min(values), 'max': max(values)}}
run_summary['delta'] = {'pass_rate': f"{run_summary['with_skill']['pass_rate']['mean'] - run_summary['without_skill']['pass_rate']['mean']:+.2f}"}
notes = [
    '兩個案例各一輪，兩位獨立代理分別執行有 skill／無 skill，各自依序回答兩題；受並行槽位限制，未逐題另開代理。',
    '10 項檢查中有 skill 10 項通過、無 skill 9 項通過；多數項目雙方都通過，辨識力有限。差異集中在第二題的結果到決策規則。',
    '評閱由 skill 作者依實際輸出逐項進行，未做盲測；不可將此結果解讀成可靠的整體效能提升。',
    '代理只有批次時間、沒有每題 token 統計；benchmark 不將缺失資料填成零，也不比較時間或 token。',
    '使用者新增的文獻閱讀與追溯規則已寫入，但未另以獨立案例測其網頁研究行為。',
    '尚未取得人工使用回饋，也未執行描述觸發率最佳化。'
]
benchmark = {'metadata': {'skill_name': skill.name, 'skill_path': str(skill), 'timestamp': '2026-11-18',
                           'evals_run': [1, 2], 'runs_per_configuration': 1},
             'runs': runs, 'run_summary': run_summary, 'notes': notes}
(iteration / 'benchmark.json').write_text(json.dumps(benchmark, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(iteration / 'benchmark.md').write_text('# 第一輪檢查\n\n| 設定 | 通過項目 |\n|---|---|\n| with_skill | 10/10 |\n| without_skill | 9/10 |\n\n' + '\n\n'.join(notes) + '\n', encoding='utf-8')
subprocess.run([sys.executable, '-X', 'utf8', str(creator / 'eval-viewer/generate_review.py'),
                str(iteration), '--skill-name', skill.name, '--benchmark', str(iteration / 'benchmark.json'),
                '--static', str(iteration / 'review.html')], check=True)
print('PASS: name, scalar frontmatter, description length, body length, local links, UTF-8, eval JSON and output length limits.')
print('Grading recorded and official static viewer generated. No fabricated timing/token comparisons.')
