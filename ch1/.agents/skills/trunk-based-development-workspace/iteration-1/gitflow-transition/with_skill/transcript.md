# With-skill advisory run: gitflow-transition

## Prompt

我們八人團隊 main/develop 加兩週 feature branches，每天拉 develop，PR 等三天，CI 40 分鐘，每月發布。請判斷是否 TBD 並提出四週轉型計畫，不修改 repo。

## Actual process

Read .agents/skills/trunk-based-development/SKILL.md; initial default-encoding output was garbled, then reread UTF-8. Read references/patterns.md, delivery.md and research.md using UTF-8. This source-loading step was shared across the three hypothetical cases in this worker. Generated this case independently from its prompt and skill sources; did not read baseline outputs or assertions, browse, inspect or modify real repository/settings, execute Git writes, grade, or spawn agents. Initial system-python write failed with exit 1/no output; native PowerShell write was denied by the read-only .agents sandbox. Requested escalation for output-directory creation, which was approved and succeeded, then requested escalation for this artifact write. Per-case timing and tokens were not measured.

## Assistant response

目前不符合 TBD。每天拉 develop 只是把更新帶入個人分支；兩週工作未回到共同主幹。PR 等三天也算分支生命週期。40 分鐘 CI 是回饋瓶頸；每月發布本身不違反 TBD，整合、部署、功能開放可以分開。

只提供方案，不修改 repo。以 main 作未來共同主幹是假設，第一週確認它的用途；不要為名稱改分支。八人不代表必須直接 push，先保留必要審查及保護規則，採短命 PR；merge queue 依並行寫入與提交流量決定。

| 週次／負責角色 | 行動 | 退出條件 |
| --- | --- | --- |
| 第 1 週：技術、發布負責人與全體 | 盤點 main/develop 差異、支援版本、未整合工作及 owner，量測 review、CI queue／執行基線。選一功能拆數小時至一天增量，補既有行為測試與紅燈責任。 | 有共同整合點決策、未整合工作清單、可信基線；不拿最後 commit 時間猜分支建立時間。 |
| 第 2 週：CI owner、review 輪值、試點 | 依量測用快取、平行化、測試分割改善 pipeline。快速路徑保留必要建置、單元及整合測試，慢檢查明列發布門檻與失敗處置。優先審小 PR、限制在製工作。 | 試點每日實際合入共同主幹；回饋可信、flaky 有修復 owner，必要審查未跳過。 |
| 第 3 週：全體與 reviewer | 擴大短命 PR，未完成功能用必要的預設關閉旗標或抽象逐步整合。驗證 PR 與最新主幹整合結果；主幹移動則重驗，高競爭時評估 merge queue。舊長命分支按相依順序拆小步。 | 每位活躍開發者每日整合；review／queue 不再普遍拖過一天；不等功能全部完成才 merge。 |
| 第 4 週：技術及發布負責人 | 停止 develop 接新開發，逐項收斂或記錄殘留工作。不批次刪分支或重寫歷史。月發布可維持，從驗證過的 main commit/tag 建產物；必要時晚切只收修補的 release 線。 | 新開發只有共同主幹；殘留工作有 owner 且可追溯；發布及回退演練完成，節奏穩定。 |

可先約定 review 首次回應 2 工作小時內、快速 CI p95 10 分鐘內、主幹紅燈 15 分鐘內修復或 revert。這些是示範試點目標，依基線調整，並非通用規範。至少每日整合是方向；短命分支文獻約一至兩天的外緣包含等待，不能拿來鼓勵固定隔天才合。

每週量測每人實際合入主幹的頻率、隔離工作至整合的分支生命週期、review 等待、CI queue／執行 p50/p95、紅燈至可信綠燈時間，搭配交付 lead time、變更失敗及服務恢復。PR 事件可補 Git 缺少分支建立時間的限制。主幹紅燈優先恢復，短時間修不好就一般 revert、保留歷史，不能忽略測試維持表面綠燈。

驗收看行為，不以刪掉 develop 算完成。遠端保護規則、測試覆蓋及 CI 組成未知；以上未實際查核或驗證。
