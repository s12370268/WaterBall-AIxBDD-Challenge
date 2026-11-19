# 小批次整合的實作模式

## 短命 PR

從最新主幹取得一個小範圍變更，先在本地驗證，及早取得審查，再驗證與主幹整合後的結果並合入。降低同時進行工作量；review 排隊過久時優先改善審查節奏與變更大小。反覆 rebase 不會重設真正的等待時間。merge、squash、rebase 的選擇遵循 repo 規範，TBD 不要求固定 commit 圖形。

多個 PR 各自測試成功仍可能在一起失敗。高流量時以 merge queue 驗證候選整合結果；主幹移動後依平台語意重新驗證。不要把長時間等待 queue 當成已整合。

## Feature flags

用 flag 分離「整合／部署」與「功能開放」。記錄 owner、用途、預設狀態、目標對象、回退方式、清理條件與期限。針對實際預計發布的 on/off 組態及重要互動測試，不要求窮舉所有旗標組合。release flag 多半是暫時的；ops、experiment、permission flags 的生命週期不同，不要套同一過期政策。

實作建議：集中決策邏輯；確認關閉狀態仍維持既有行為。隱藏 UI 不等於後端阻止副作用，更不能替代權限檢查。flag 關閉不會自動撤回已寫入資料或完成的外部交易，需另外設計補償與回復。

## Branch by abstraction

1. 替既有實作建立穩定抽象與行為測試，先維持原有路徑。
2. 在主幹以小步加入新的實作，尚未就緒時不接管正式流量。
3. 驗證兩種實作並逐步切換，必要時用 flag 控制。
4. 觀察結果與回退能力，確認後移除舊實作及臨時切換；抽象若仍有設計價值可保留。

這是程式內的過渡策略，不是長命 Git branch。不要為每個小改動新增旗標或抽象；能直接相容整合就保持簡單。

## Expand → migrate → contract

對 API、事件與 schema 先增加相容介面，再逐步搬移使用者，最後在沒有舊版依賴後移除。資料庫的應用建議：

| 階段 | 小步範例 | 驗證／退出條件 |
| --- | --- | --- |
| Expand | 新增可選欄位或新表；保留舊結構 | 舊程式可繼續運作；評估 DDL lock 與執行時間 |
| Migrate | 部署相容讀寫；分批可重試 backfill；逐步切換讀取 | 舊新版本並存測試、資料一致性、失敗重試與觀測 |
| Contract | 舊版本退場及回退窗口結束後才移除舊結構 | 無舊讀寫依賴；備份／回復與資料保留條件確認 |

依資料流選擇是否需要 dual-write；若使用，交代部分失敗與一致性策略。不要假設把程式 rollback 就能回復不可逆 schema/data migration。

## 快速且可信的建置

把快速、穩定的編譯、單元與必要整合測試放入關鍵回饋路徑。較昂貴檢查可以分層執行，但列明覆蓋缺口、發布前必要條件與失敗處理。依證據使用快取、平行化、測試分割；測試選擇需處理漏測風險。flaky test 要有修復 owner，隔離也要追蹤，不能靜默跳過。

來源：[短命分支](https://trunkbaseddevelopment.com/short-lived-feature-branches/)、[快速綠燈建置](https://trunkbaseddevelopment.com/fast-green-builds/)、[Branch by Abstraction](https://trunkbaseddevelopment.com/branch-by-abstraction/)、[Pete Hodgson：Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)、[Danilo Sato：Parallel Change](https://martinfowler.com/bliki/ParallelChange.html)。資料庫與操作細節是將模式套用到交付流程的實作建議。
