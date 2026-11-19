"""Prepare review metadata without fabricating executor measurements."""
import json
from pathlib import Path

workspace = Path(__file__).resolve().parent
skill = workspace.parent / 'double-diamond-principle'
path = skill / 'evals/evals.json'
data = json.loads(path.read_text(encoding='utf-8'))
expectations = {
    1: [
        '將聊天機器人列為待驗證方案，而非已證實能降低流失的結論。',
        '明確標示缺乏訪談及漏斗證據，沒有杜撰研究發現或基準數值。',
        '提出至少三種不同介入方向，並說明各自要驗證的假設或機制。',
        '提出未鎖定聊天機器人的暫定問題定義，並安排蒐證以檢查它。',
        '測試計畫包含觀察指標及繼續、修改或淘汰的可辨識決策條件。'
    ],
    2: [
        '保留 6/8 完成、3 位證明文件困惑及電話瓶頸說法，未把小樣本推廣為普遍因果。',
        '提出回到 Discover 或 Define 的具體理由，保留不同瓶頸的競爭解釋。',
        '安排兩天內可操作的行動與產物，沒有擴張成完整研究專案。',
        '測試包含至少兩個不同瓶頸的介入或比較方式及可觀察指標。',
        '說明根據測試結果如何選擇下一步，並明確列出目前不能下的結論。'
    ]
}
for item in data['evals']:
    item['expectations'] = expectations[item['id']]
    directory = workspace / 'iteration-1' / f"eval-{item['id']}-{item['name']}"
    directory.mkdir(parents=True, exist_ok=True)
    metadata = {'eval_id': item['id'], 'eval_name': item['name'],
                'prompt': item['prompt'], 'assertions': item['expectations']}
    (directory / 'eval_metadata.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Prepared two evals and ten expectations.')
