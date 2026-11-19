---
name: git-conventional-commit
description: 撰寫、檢查及修正符合 Conventional Commits 1.0.0 的 Git commit message。當使用者要求 /git-conventional-commit、根據 diff 或 staged changes 產生提交訊息、選擇 type/scope、標示 breaking change、檢查 commitlint 錯誤、規劃拆分提交或 squash merge 訊息時使用，即使未提及 Conventional Commits。也適用於說明提交的 SemVer 影響；不因單純提到 Git、branch、push 或一般程式修改而觸發。
---

# Git Conventional Commit

依據實際變更產生可直接使用的提交訊息，並區分「1.0.0 規範」「專案規則」「寫作建議」。用繁體中文解釋；訊息語言依使用者要求，其次依專案慣例；兩者皆無時用繁體中文，保留 type 與機器辨識 token。

## 知識與來源

需要解釋本主題、導入方法或核對例外時，先讀 [主題整理](references/topic-guide.md)：包含關鍵字、方法論、執行步驟、規則、適用條件與例外。需要追查出處時讀 [研究筆記](references/research.md) 與 [來源索引及查閱路徑](references/sources.md)。

引用規則時指出屬於核心規範、特定專案／工具規則，或本 skill 的實務建議。解釋或研究型回覆附上支持該項主張的原始連結與章節；純訊息輸出不把來源塞進 commit message。補查新議題時，先讀指定原文，再沿其直接相關連結查閱；保留實際讀取頁面、來源之間的連結路徑、版本或查閱日期。未讀取或無法取得的頁面不能標成已核對。

## 工作流程

1. 確認任務是撰寫、檢查、拆分，還是分析版本影響。有足夠描述時直接完成；不要為了選擇措辭反覆詢問。
2. 讀取適用的 AGENTS.md、CONTRIBUTING、commitlint 設定及 release 設定。以使用者明確要求為先；若與規範或專案限制衝突，點出差異，勿悄悄聲稱全部相容。
3. 使用者要求依目前變更撰寫時，執行唯讀檢查：

   ```text
   git status --short
   git diff --cached --stat
   git diff --cached
   git log -8 --format=%s
   ```

   優先只描述 staged changes。若沒有 staged changes，再讀取 `git diff --stat`、`git diff`，並註明草稿依據尚未暫存的變更。未追蹤檔不在 diff 內，需讀取相關檔案才可描述；不要自動全部暫存。有明確指定範圍時依該範圍處理。非 Git 目錄或無工具時，使用提供的資料；資料不足就要求摘要或 diff，不杜撰內容。
4. 根據變更目的與對外契約選 type，不只看副檔名。判斷是否改變 API、CLI、設定格式、預設行為或最低執行環境。依本地慣例選 scope；不確定時省略可選 scope。
5. 一個目的搭配其測試、文件可是一個 commit。互不相干的目的先建議拆分，分別提供訊息。若使用者明確要 squash 成單一提交，涵蓋整體目的並保留所有破壞性影響。
6. 組合訊息後，依下列核對事項檢查。有工具設定或版本問題時讀 [工具與版本](references/tooling.md)；需要理由、邊界案例及來源時讀 [研究筆記](references/research.md)。

## 語法與語意核對

格式：

```text
type(scope)!: description

body

Footer-Token: value
```

scope、`!`、body、footer 都可省略。冒號後要有空格及簡短描述；body/footer 前留空行。新增功能用 `feat`，修正錯誤用 `fix`。任何 type 均可帶破壞性變更：以冒號前的 `!` 或大寫 `BREAKING CHANGE: 說明` footer 標記；footer 的 `BREAKING-CHANGE` 等價。`!` 單獨使用時描述須交代不相容變更。

一般 footer token 以連字號代替空白，分隔符可為 `: ` 或 ` #`，值可跨行。除破壞性 token 的大寫要求外，規範不強制大小寫。檢查細節以 [官方 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) 為準。

實務分類建議（非規範強制清單）：

| Type | 選擇依據 |
| --- | --- |
| feat | 新增功能 |
| fix | 修正既有行為的錯誤 |
| docs | 只改文件或說明 |
| style | 只改排版、空白等，不改行為 |
| refactor | 重整實作，維持行為與契約 |
| perf | 效能改善 |
| test | 只新增或調整測試 |
| build | 建置、打包或相依管理 |
| ci | CI 工作流程 |
| chore | 不屬於更具體類別的維護 |
| revert | 回復既有變更，附已知 SHA；效果依工具判斷 |

不要為了避免發版而把功能或 bug fix 改標為 chore/refactor。相依更新應先看實際影響：開發工具更新可為 build；修補執行期漏洞可為 fix；移除支援的 runtime 即使只改 metadata，也可能是 breaking change。

## 撰寫與驗證

- 描述具體結果及對象，避免「update files」「修正問題」等無法辨識內容的摘要。body 補充必要的原因、前後行為與遷移方式，不逐檔重述 diff。
- 小寫 type、英文祈使句、無結尾句點、50/72/100 字元等皆可能是團隊規則或風格；沒有設定就不要當作規範錯誤。自訂 type 也不能只因不在常見清單就判定違規。
- 只加入已知且相關的 issue、SHA、遷移資訊與驗證結果。使用者要關閉 issue 時才用 closing footer；一般關聯可用 `Refs: #123`。
- 對 breaking change，優先提供具體舊用法、新用法與必要遷移。資訊足夠時建議同時用 `!` 和 footer 幫助讀者；檢查時接受規範允許的單獨標記。
- 已安裝 commitlint 時，用完整候選訊息及本地設定檢查。優先本地 CLI，保持多行及 UTF-8；不要為了驗證自動下載套件。未執行時明說是人工檢查，不聲稱 lint 已通過。
- 格式檢查不等於內容正確：逐項對照 diff，確認沒有漏掉 breaking change，也沒有捏造測試通過或效能數字。
- 此 skill 的預設產物是訊息與建議。只有使用者另有明確要求時才執行 commit、暫存、amend、rebase、push 或修改工具設定；既有授權可以沿用。

## 回覆格式

**撰寫**：輸出一個 `text` 程式碼區塊，內容只有可複製的完整訊息。只有存在重要假設、拆分建議或驗證限制時才在區塊外簡述。使用者要求「只給訊息」時，省略區塊外說明。

**檢查**：分別列出規範判定、專案規則判定（未知就寫未知）、語意問題，再提供最小修正版。沒有問題時直接說明符合哪些已檢查項目。勿為了風格擅自改變原意。

**版本分析**：對穩定版公開 API，通常 fix 對應 patch、feat 對應 minor、不相容變更對應 major；其他 type 不由規範保證升版。註明這是語意預期，實際發版依 release 設定、parser、版本階段及整段提交歷史決定。未提供目前版本時不編造下個版號。

## 原創範例

新增匯出功能：

```text
feat(report): 新增 CSV 匯出
```

錯誤修正並含回歸測試：

```text
fix(cart): 避免重試結帳時重複建立訂單
```

移除舊公開參數且已知遷移方式：

```text
feat(client)!: 移除 timeoutMs 參數

BREAKING CHANGE: timeoutMs 已移除，請改以 timeout 設定逾時毫秒數。
```

## 維護

核心目標版本固定為 1.0.0。研究日期與官方延伸來源列在 references；需要更新工具整合時重新查閱官方文件與專案 lockfile，不將網路上的新版設定直接套到舊專案。
