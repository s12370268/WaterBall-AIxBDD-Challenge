# 發布、修補與遷移

## 發布決策

有能力按需部署時，從通過驗證的主幹 commit/tag 建立可追溯產物，採 rollout、觀測與適合的回退／fix-forward。未完成功能透過相容增量與必要的 flags 隱藏。不要要求所有團隊立即自動部署正式環境。

需維護已發布版本、商店審核或特定交付週期時，可在必要時從已知良好 commit/tag 切 release branch；不一定是當下 HEAD。主幹持續開發，release branch 不接新功能；維護有明確支援期限與責任人，期滿才按政策清理。

## Hotfix

預設先在主幹重現問題，加回歸測試，修復並取得 CI 驗證；再選擇性 cherry-pick/backport 到受影響的維護版本，各自重新驗證。避免把整條主幹合到舊版，帶入未打算發布的變更。

主幹已無法重現舊版問題時，允許在受影響版本修復。同步建立有 owner 的主幹適用性檢查／forward-port 工作：主幹若仍受影響，修正或加入對應回歸測試；若已解決，記錄證據。不可機械式套用已不相容的 patch。

來源差異：DORA 的概述也描述 release 修補回流主幹；本 skill 採官方專門章節「先修主幹再 backport」為預設，並保留其明載的無法重現例外。這是降低遺漏修正的操作選擇，不宣稱文獻只有單一箭頭。

## 從 GitFlow 遷移的示範階段

以下是實作建議，依團隊能力調整，沒有固定週數要求。

| 階段 | 行動 | 退出條件 |
| --- | --- | --- |
| 建立基線 | 盤點 develop/main、支援版本、CI、審查等待與未整合變更 | 有可信的現況資料與主幹選擇理由 |
| 建立安全網 | 修復不穩定測試、建立快速驗證、確保審查可及時完成 | 小步整合可被可靠驗證，紅燈有恢復流程 |
| 試點 | 一組人改用短命 PR；把大型功能拆成相容增量 | 持續每日整合、沒有把功能完成當 merge 前提 |
| 收斂 | 依相依順序整合或保留未完成分支工作，逐步停止 develop 接收新開發 | 新功能只進共同主幹，舊線的處理可追溯 |
| 維持 | 回顧延遲、整合失敗及過期 flags；按支援政策處理 release 線 | 整合節奏與品質穩定，沒有回到長命團隊分支 |

不要用刪除 develop 或重新命名分支當作完成標準。只有使用者要求實作，才修改設定或程式。

## 量測

- 整合頻率：統計變更實際進入共同主幹，而非功能分支的 push 次數。
- branch 生命週期：從開始隔離工作到整合，納入 review 與 queue 等待；Git 缺乏可靠建立時間時標示限制，可輔以 PR 事件。
- CI 回饋：由提交驗證到可信結果；分開 queue 與執行時間，可看 p50/p95。
- 主幹恢復：紅燈到恢復可信綠燈；追蹤 flaky 與忽略失敗情形。
- 配合追蹤交付 lead time、變更失敗與服務恢復，避免只追求 merge 次數。

來源：[Branch for release](https://trunkbaseddevelopment.com/branch-for-release/)、[Release from trunk](https://trunkbaseddevelopment.com/release-from-trunk/)、[DORA](https://dora.dev/capabilities/trunk-based-development/)、[Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html)。
