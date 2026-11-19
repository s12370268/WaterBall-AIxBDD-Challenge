# 主題整理

本文件將原文概念轉成操作指南。來源編號可在 [來源索引](sources.md) 回到原始章節；「實務整理」是本 skill 的綜合方法，不是另一份官方規範。

## 一、關鍵字

| 關鍵字 | 意義與用途 | 依據 |
| --- | --- | --- |
| Conventional Commits | 在 Git 訊息加入可供人與工具理解的結構 | S1 Summary |
| type / scope / description | 變更種類、程式區域、簡短結果 | S1 Specification 1–5 |
| body / footer | 補充原因與結構化追蹤資訊 | S1 Specification 6–10；S6 |
| breaking change / ! | 對既有使用方式造成不相容的變更訊號 | S1 Specification 11–13、16 |
| public API / compatibility | 判定版本影響前，先界定對外承諾 | S3 Specification 1、4–8 |
| SemVer / major / minor / patch | 用版號表達相容性影響 | S3 Summary、Specification |
| MUST / SHOULD / MAY | 必要要求、原則性建議、可選項目 | S7 §§1–5 |
| preset / parser / lint rule | 工具如何解析與限制訊息 | S5、S8、S9 |
| changelog / release notes | 由歷史訊息衍生的發布說明 | S10 |
| squash / revert | 最終整合訊息與回復變更；效果需看工作流程及工具 | S1 FAQ；S4 Revert |

## 二、方法論：三層判斷、兩種驗證

以下為實務整理：

1. **核心規範層**：訊息是否滿足 1.0.0 的結構及語意要求？先用 S1 判定。
2. **專案政策層**：團隊是否額外限制 type、scope、大小寫或字數？讀 CONTRIBUTING 與工具設定；S4 的 Angular 慣例是案例，不是通用要求。
3. **自動化層**：lint、changelog、release 是否採用相容的 parser 與 preset？格式相容仍可能被本地工具拒絕，或沒有觸發預期發布。依 S8–S11 核對。

驗證時分開做「訊息格式與本地政策檢查」及「內容對照 diff 的語意檢查」。前者不能證明後者；只靠 type 無法發現漏寫的使用者遷移成本。

## 三、執行步驟

下列流程綜合 S1、S4、S8–S12，供實作使用：

1. **界定輸入**：辨識 staged、unstaged、指定 commit range 或使用者摘要，避免混用不同範圍。
2. **載入政策**：讀專案指南、近期訊息、lint 與 release 設定；記錄未知項目。
3. **盤點意圖**：對每個邏輯目的寫出「改變什麼、為何需要、誰受影響」。
4. **檢查相容性**：比較改動前後的公開介面、CLI、設定及執行環境；不只看檔名。
5. **決定提交邊界**：一個目的可含實作、測試與必要文件；獨立目的建議拆分。必須 squash 時整理完整影響。
6. **組合訊息**：選 type、可選 scope、摘要；必要時補 body、遷移資訊及已知追蹤參照。
7. **雙重驗證**：逐項對照 diff，再用已安裝的本地 lint 工具驗證；清楚標記未執行的檢查。
8. **交付與回顧**：回傳可複製訊息或最小修正版。若要求分析發布，再依實際設定及版本階段說明，勿保證未知版號。

## 四、規則查核表

避免把完整原文重抄成另一份規範；依以下索引查閱 S1 的對應條款，操作摘要見 SKILL.md：

| 核對項目 | 原文定位 | 檢查重點 |
| --- | --- | --- |
| 前綴及描述 | S1 Specification 1–5 | type、可選 scope/!、必要分隔與摘要；功能／修正分類 |
| 多行結構 | S1 Specification 6–7 | body 的分段與空行 |
| 結構化尾註 | S1 Specification 8–10 | token、separator、多行值及下一個 token 的邊界 |
| 不相容變更 | S1 Specification 11–13、16 | 標記位置、說明與兩種 breaking token |
| 擴充及大小寫 | S1 Specification 14–15 | 允許其他 type；一般大小寫與 breaking token 的差異 |
| 規範強度 | S7 §§1–5 | 區分必要、建議與可選，不把 MAY 寫成 MUST |
| 本地限制 | S4、S5、S8 | 額外規則需有專案依據，不能冒稱核心要求 |

## 五、適用條件

以下為依 S1 Why Use、S2 Tooling 及 S3–S12 整理的選用判準：

- 想提高歷史可讀性、讓審查者辨識意圖：可先採結構化訊息，無須先導入發版工具。
- 想自動產生 changelog：需要一致訊息及適合的 parser/preset，並決定哪些提交會出現在紀錄中。
- 想自動升版／發布：先界定公開契約、發布基準、分支與工具設定；命名慣例本身不會完成發布。
- 多套件 repo：scope 可幫助讀者定位，但各套件的版本策略及影響範圍需另由發布流程決定。
- 只想代寫訊息：可直接用變更摘要，不強迫安裝 Commitizen、commitlint 或 semantic-release。
- 任務只有 branch、push、合併衝突或一般除錯：不因涉及 Git 就套用完整提交流程。

## 六、例外與易混淆情境

| 情境 | 處理方式與界線 | 依據 |
| --- | --- | --- |
| Angular 規則與 CC 不同 | 使用 Angular 專案規則時說清適用範圍；不把字數與寫作風格泛化 | S4 |
| type 不在常見清單 | 分開看核心相容性與本地允許清單，不自動判錯 | S1 §14；S5 |
| 大寫 type 或僅用 ! | 不因風格偏好誤判；工具另有要求時另列 | S1 §§13、15；S8 |
| 初期開發／0.x | 仍應清楚描述影響；版號規則要考慮不穩定階段 | S1 FAQ；S3 §4 |
| prerelease | 加上所在發布分支、既有標籤及發布工具的判斷 | S3 §9；S11 |
| revert | 確認原始 SHA 與實際回復內容，不預設會抵銷一次發布 | S1 FAQ；S4 Revert |
| squash merge | 檢查最終留下的 commit；PR 標題是否變成提交訊息依平台／設定決定 | S1 FAQ |
| Git trailer 解析成功 | 不等於已滿足 CC footer；兩套語法並非完全相同 | S1 §8；S6 DESCRIPTION |
| 錯誤分類已發布 | 不靠改寫既有版本內容掩蓋問題；另作修正並按發布政策處理 | S1 FAQ；S3 §3 |
| 工具忽略 merge/revert | lint 無錯誤可能因忽略條件而未檢查，要檢視實際設定 | S9 ignores/defaultIgnores |

## 回到來源核對

從 [來源索引](sources.md) 的「查閱路徑」可重走本次研究。主張如屬本 skill 綜合方法已標明；有衝突時，先核對 S1 定版與專案實際安裝版本，再決定是否調整操作建議。
