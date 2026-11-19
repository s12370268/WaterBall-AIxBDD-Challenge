# 工具與版本

## 找出專案的實際規則

用 `rg --files --hidden` 搜尋 `commitlint.config.*`、`.commitlintrc*`、`package.json`、`release.config.*`、`.releaserc*`、CONTRIBUTING 與 lockfile；排除 .git 與 node_modules 大型目錄，避免漏掉隱藏設定。讀取 package.json 的 commitlint、release、scripts 欄位。若設定引用 preset 或動態程式，僅靜態讀取不足以保證有效設定已解析；以本地工具結果為準。

讀取近期訊息可了解語言與 scope 習慣，但歷史錯誤不能覆蓋明確設定。沒有設定可讀時，標註採用核心規範與 skill 的寫作建議。

## commitlint

使用專案已安裝的版本。將完整訊息以 UTF-8 寫入暫存檔，再使用本地 CLI 的 `--edit <檔案>` 檢查，可避免多行訊息在 shell 中被重組。Windows 通常使用 `node_modules/.bin/commitlint.cmd`，其他平台使用 `node_modules/.bin/commitlint`。具體參數以該版本 `--help` 為準。記錄退出碼與有意義的錯誤；確認訊息是否被預設 ignores 跳過，再聲稱驗證成功。

不要把「lint exit 0」當成「變更語意已驗證」；需要人工對照 diff。未安裝時不自動執行可能連網下載的 npx。若使用者要求安裝 hooks 或 CI，另依專案套件管理器與既有工作流程實作，而非只貼通用設定。

## 發布分析

分開回答：

1. **規範語意**：這個提交表示什麼影響？
2. **工具結果**：目前的 parser、releaseRules 與分支配置會如何處理？

semantic-release commit-analyzer 的預設規則包含 breaking → major、feat → minor、fix/perf → patch。這不代表規範賦予 perf 固定升版語意。自訂規則優先匹配，沒有匹配才回退預設；匹配到多條規則時取最高 release type。整批提交通常也取最高影響，仍需考慮忽略、revert 與實際工具設定。

如果 ! 沒有被工具辨識，檢查 preset、版本與 parser 設定；不要宣稱核心規範禁止 !。lint 與 release analyzer 可能用不同 parser，兩者都要確認。

## 常見診斷

| 訊息或情境 | 判斷方向 |
| --- | --- |
| `Feat(api): 新增篩選` | 核心大小寫可接受，本地 type-case 可能不接受 |
| `feat(api)!: 移除舊篩選參數` | ! 已標記 breaking；若本地要求雙標記，再加 footer |
| `fix:修正空值` | 冒號後缺空格 |
| `docs: 更新說明` 後一行直接 body | 缺少 header/body 間空行 |
| `BREAKING CHANGE: ...` 作為第一行 | 缺少一般 type header，應移至 footer 或改用 ! |
| 全小寫 `breaking change:` | 不是有效的 breaking token，不可視為已標記 |
| 有型別與 scope，但內容與 diff 不符 | 格式通過仍須修正語意 |
