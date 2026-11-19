"""Validate the simple skill structure and prepare human-reviewed eval metadata."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SKILL = ROOT / '.agents/skills/trunk-based-development'
WORK = SKILL.parent / 'trunk-based-development-workspace/iteration-1'
CHECKS = {
    'gitflow-transition': [
        '判斷目前兩週功能分支與每天拉 develop 不符合每日回到共同主幹的整合。',
        '提供四週分階段計畫，處理三天 review 等待及四十分鐘 CI 的瓶頸。',
        '保留必要品質檢查，並區分每月發布與每日整合。',
    ],
    'payment-refactor': [
        '以抽象、新舊實作並存與逐步切換將三週付款重構拆成可每日合併的步驟。',
        '姓名欄位變更採 expand/migrate/contract，處理舊新版並存及不可可靠拆姓名的情形。',
        '說明付款副作用、驗證與資料回復限制，不把 flag 關閉當成撤回交易。',
    ],
    'release-hotfix': [
        '允許無法在 main 重現時先修受影響版本，並追蹤 main 適用性與回歸證據。',
        '使用選擇性 backport 並分別判斷 1.9 是否受影響，避免整條 release merge 回 main。',
        '保留分支保護及必要驗證，不執行 Git 寫入。',
    ],
}

def main():
    text = (SKILL / 'SKILL.md').read_text(encoding='utf-8')
    front = text.split('---', 2)[1]
    fields = re.findall(r'^(\w+): (.+)$', front, re.M)
    assert len(fields) == len(dict(fields)), 'duplicate metadata fields'
    assert dict(fields)['name'] == 'trunk-based-development'
    assert 20 < len(dict(fields)['description']) < 1024
    assert len(text.splitlines()) < 500
    for md in SKILL.rglob('*.md'):
        for target in re.findall(r'\]\(([^)]+)\)', md.read_text(encoding='utf-8')):
            if not target.startswith(('https://', 'http://', '#')):
                assert (md.parent / target).exists(), (md, target)
    evals = []
    for case, assertions in CHECKS.items():
        path = WORK / case / 'eval_metadata.json'
        item = json.loads(path.read_text(encoding='utf-8-sig'))
        item['assertions'] = assertions
        path.write_text(json.dumps(item, ensure_ascii=False, indent=2), encoding='utf-8')
        evals.append({'id': item['eval_id'], 'prompt': item['prompt'], 'expected_output': '具體方案；符合以下 assertions 並保留來源。', 'files': [], 'assertions': assertions})
    (SKILL / 'evals').mkdir(exist_ok=True)
    (SKILL / 'evals/evals.json').write_text(json.dumps({'skill_name': 'trunk-based-development', 'evals': evals}, ensure_ascii=False, indent=2), encoding='utf-8')
    print('PASS: unique metadata, name, description, length, local links and three eval cases')

if __name__ == '__main__':
    main()
