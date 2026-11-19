# 驗證與限制

- Skill 已建立於 `.agents/skills/trunk-based-development/`，名稱為 `trunk-based-development`。
- 已由指定首頁沿站內導覽閱讀相關頁面，另查閱 DORA、Martin Fowler、Pete Hodgson 與 Danilo Sato 的相關原始文章。主題索引與研究筆記保留原始連結及查閱日期。
- 已檢查簡單 frontmatter 的唯一欄位、名稱、description 長度、主文件行數、本地 Markdown 連結及三個 eval JSON 案例。
- 原附 quick_validate.py 因缺少 PyYAML 無法執行；改用 trunk_eval_tools.py 做上述有界檢查，並非完整 YAML parser。
- 三個案例各執行 with_skill 與 without_skill；每個設定由同一代理依序完成三題，非逐題隔離。baseline 依工具規則查閱公開原始資料，但未讀本地 skill。
- 未取得 task-level token 與時間量測；不填推估值。一次三題測試不能證明一般化準確率提升。
- 以 skill-creator-ziv 原附 generate_review.py 產生靜態審閱頁，無背景伺服器；可提交人工回饋後再迭代。
- 未執行以 Claude CLI 為依賴的 description optimization，也未將 skill 安裝到全域目錄。
