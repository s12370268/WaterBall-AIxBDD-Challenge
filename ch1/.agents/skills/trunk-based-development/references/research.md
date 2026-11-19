# 研究筆記與來源

查閱日期：2026-11-18。以下為原創摘要與跨來源實作整理，不是全文翻譯。離線使用可依本地筆記；需要最新平台語法、保護規則或工具功能時，再查相應官方文件，勿把查閱日當成文章發布日。

| 一手來源 | 重點與用途 |
| --- | --- |
| [Trunk Based Development：Introduction](https://trunkbaseddevelopment.com/) | 一條共同主幹，抵抗長期分離的開發線；允許直接提交與短命 PR 兩種模式。 |
| [Short-Lived Feature Branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/) | 審查等待計入 branch 壽命；短命約一至兩天，並行 writer 與提交流量比硬性人數門檻更有意義。worktree 不能解決工作長期未整合。 |
| [Continuous Integration](https://trunkbaseddevelopment.com/continuous-integration/) | CI 不只是建置伺服器；開發者整合習慣、整合前驗證與共享主幹都重要。 |
| [Fast, Green Builds](https://trunkbaseddevelopment.com/fast-green-builds/) | 建置速度影響整合節奏；本地和 CI 的可靠回饋相輔相成。 |
| [Feature flags](https://trunkbaseddevelopment.com/feature-flags/) | 讓未完成功能可在主幹存在而不立即開放，支援不同功能的發布順序。 |
| [Branch by Abstraction](https://trunkbaseddevelopment.com/branch-by-abstraction/) | 長期替換工作透過抽象與新舊實作並存切小步，而非隔離到長命 branch。 |
| [Branch for release](https://trunkbaseddevelopment.com/branch-for-release/) | 必要時晚切 release 線、限制修補；先在 trunk 修正再 backport，有無法重現的例外。 |
| [Release from trunk](https://trunkbaseddevelopment.com/release-from-trunk/) | 高頻交付可不設 release branch；必要時也可從歷史 tag 建立修補線。 |
| [DORA：Trunk-based development](https://dora.dev/capabilities/trunk-based-development/) | 小批次、至少每日合回主幹；維護綠燈，改善沉重審查。2016/2017 資料觀察到較少活躍分支、每日整合、無凍結／整合階段與較佳交付表現相關。 |
| [Martin Fowler：Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html) | 自動建置測試、每天整合、立即修復失敗與快速回饋；區分 CI、Continuous Delivery 與 Continuous Deployment。 |
| [Pete Hodgson：Feature Toggles](https://martinfowler.com/articles/feature-toggles.html) | release、experiment、ops、permissioning flags 的用途與生命週期不同，需管理測試負擔與清理成本。 |
| [Danilo Sato：Parallel Change](https://martinfowler.com/bliki/ParallelChange.html) | expand、migrate、contract 是讓介面不相容變更逐步過渡的模式。 |

## 解讀邊界

「至少每日整合」是方向；一至兩天是短命分支文獻的寬鬆外緣，不能據此鼓勵固定隔天才合。DORA 的「三個或更少活躍分支」是研究觀察，不是所有 repo 的硬上限；不要用刪除支援版本線去湊數，也不要宣稱這些關聯能保證因果效果。

本 skill 的表格、逐步遷移、量測方式與資料庫操作細節是根據上述文獻綜合的實作建議。來源有情境差異時說明取捨，數字目標依團隊能力設定；不要偽裝成通用規範。
