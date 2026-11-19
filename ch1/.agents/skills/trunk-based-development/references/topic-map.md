# 主題索引：關鍵字、方法、規則與例外

查閱日期：2026-11-18。先讀[指定首頁](https://trunkbaseddevelopment.com/)，再沿其導覽閱讀下列站內頁面；延伸查閱首頁與相關文章引用的 Fowler 網站內容及 DORA 研究整理。

## 關鍵字

| 詞彙 | 定義與連結 |
| --- | --- |
| Trunk / Mainline | 全體開發者共同整合的主線，名稱不限；見[五分鐘概覽](https://trunkbaseddevelopment.com/5-min-overview/)。 |
| Integration distance | 尚未合回主幹的變更與其他人工作之間的距離；用小批次縮短。見[概覽](https://trunkbaseddevelopment.com/5-min-overview/)。 |
| Short-lived feature branch | 供小範圍變更與審查使用、迅速合回的分支，等待也計時；見[短命分支](https://trunkbaseddevelopment.com/short-lived-feature-branches/)。 |
| CI / Continuous Integration | 頻繁整合及自動驗證的共同實踐；見[站內 CI](https://trunkbaseddevelopment.com/continuous-integration/)。 |
| Continuous Delivery / Deployment | 保持可按需發布／每個符合條件的變更自動部署；見[Fowler CI](https://martinfowler.com/articles/continuousIntegration.html)。 |
| Feature flag / toggle | 控制行為開放，讓未就緒工作能增量整合；見[站內 flags](https://trunkbaseddevelopment.com/feature-flags/)。 |
| Branch by abstraction | 在程式抽象後並存新舊實作，逐步替換；見[站內方法](https://trunkbaseddevelopment.com/branch-by-abstraction/)。 |
| Expand–migrate–contract | 先擴充相容介面，再搬移使用者，最後移除舊介面；見[Parallel Change](https://martinfowler.com/bliki/ParallelChange.html)。 |
| Merge queue | 在繁忙主幹上排隊驗證候選整合結果；見[決策因素](https://trunkbaseddevelopment.com/deciding-factors/)。 |
| Backport / cherry-pick | 選取特定修正帶往維護版本，避免帶入整批新功能；見[release branch](https://trunkbaseddevelopment.com/branch-for-release/)。 |

## 方法論與執行步驟

1. **掌握現況**：辨識共同主線、變更大小、實際合回頻率、審查等待與驗證速度。
2. **拆小工作**：以可獨立驗證的行為、相容介面或預設關閉的新路徑逐步整合。
3. **縮短回饋**：本地驗證、即時審查、驗證候選合併結果，保持主幹可信。
4. **控制功能開放**：依需要以 flags 或抽象隔離未就緒路徑，另外決定發布時機。
5. **處理交付**：選主幹發布或必要的維護線；為每條受支援版本驗證修補。
6. **持續改善**：追蹤分支與 PR 等待、建置時間、主幹恢復及 flags 清理。

此順序是本 skill 的綜合操作流程。方法依據：[概覽](https://trunkbaseddevelopment.com/5-min-overview/)、[審查](https://trunkbaseddevelopment.com/continuous-review/)、[建置](https://trunkbaseddevelopment.com/fast-green-builds/)、[DORA](https://dora.dev/capabilities/trunk-based-development/)。細節見 patterns.md 與 delivery.md。

## 規則、適用條件與例外

| 原則 | 適用條件／例外 | 來源 |
| --- | --- | --- |
| 以一條主線頻繁整合 | 可保留短命審查分支；每日拉主幹進長命 branch 不等於合回 | [短命分支](https://trunkbaseddevelopment.com/short-lived-feature-branches/) |
| 維持綠燈與可發布 | 需要快速可信測試；失敗先修復或 revert。可發布不等於每次自動部署 | [CI](https://martinfowler.com/articles/continuousIntegration.html) |
| 優先完成小步審查 | 成員數不是唯一依據；大量 agents 增加寫入與審查流量 | [決策因素](https://trunkbaseddevelopment.com/deciding-factors/)、[審查](https://trunkbaseddevelopment.com/continuous-review/) |
| 避免長期功能分支 | 長期需求用抽象與相容增量切分；flags 有管理成本，不是每項變更都必需 | [抽象替換](https://trunkbaseddevelopment.com/branch-by-abstraction/)、[flags](https://trunkbaseddevelopment.com/feature-flags/) |
| 主幹發布或晚切 release branch | 維護交付可保留受控 release 線，但不承接一般功能開發 | [兩種發布](https://trunkbaseddevelopment.com/release-from-trunk/) |
| 修正先進主幹再 backport | 舊版缺陷無法在主幹重現時可反向處理，明確追蹤主幹適用性，避免回歸 | [修補與例外](https://trunkbaseddevelopment.com/branch-for-release/) |

導入不能只改 branch 名稱。常見失敗是開發線長期隔離、頻繁同步卻延後整合，以及缺乏讓中間狀態可驗證的設計；對照[反例](https://trunkbaseddevelopment.com/youre-doing-it-wrong/)。
