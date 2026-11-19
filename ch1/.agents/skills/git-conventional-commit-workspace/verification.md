# 交付與驗證記錄

- skill 位置：`../conventional-commits/SKILL.md`。此位置可透過明確指定路徑使用；未安裝到全域技能目錄，也未修改既有的 skill-creator-ziv。
- 範例指令：`請依照 skills/conventional-commits/SKILL.md，根據 staged changes 產生 commit message。`
- 核心規範與延伸資料已查閱官方網站，來源與日期見 skill 的 `references/research.md`。
- 已以獨立代理執行 3 個案例，分別產生 with_skill 與 without_skill，共 6 份輸出；因並行上限，每個代理負責同一設定的三題，各題未完全隔離。
- 已使用 skill-creator-ziv 原附的 `eval-viewer/generate_review.py` 產生靜態審閱頁，無須啟動背景伺服器。
- 原附 `quick_validate.py` 因環境缺少 PyYAML 無法執行；改用 `validate_structure.py` 檢查這份 skill 的簡單 frontmatter 欄位、命名、長度、本地連結與 eval JSON。這不是通用 YAML 驗證器。
- 沒有 task-level 的時間/token 資料，因此 benchmark 不呈現這些欄位。未執行真實專案 Git 操作、commitlint、發布工具或描述觸發率最佳化。
- 使用者尚未審閱；目前交付為可用第一版，未假稱已獲人工回饋或完成多輪改良。
