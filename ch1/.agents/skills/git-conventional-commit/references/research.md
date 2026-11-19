# 研究筆記與來源

查閱日期：2026-11-18。本文為摘要與實務建議；核心規範採 1.0.0，工具文件屬查閱當日狀態。

## 核心觀念

提交訊息同時服務讀者與自動化。前綴方便分類，但內容仍應準確說明改變。原規範保留擴充空間，所以需分開判斷語法相容性、團隊限制與工具解析結果。

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)：核心語法、16 條規則與 FAQ。繁體中文譯本可由官方語言選單取得；有疑義時比對英文定版。
- 核心規範原文採 [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)；本 skill 的說明與範例為重新整理，未收錄整份原文。

## 與 SemVer 的關係

[Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) 的前提是有定義公開 API。穩定版以相容修補、相容功能新增及不相容 API 變更區分 patch/minor/major。判定契約時不能只看程式碼路徑：文件承諾、CLI 行為、套件 exports、支援環境都可能影響使用者。

`0.y.z` 屬初期開發，公開 API 尚不穩定，不能直接保證「帶 ! 就會由 0.x.y 升到 1.0.0」。prerelease 也需考慮所在發布分支、既有標籤與工具設定。版本升級後低位歸零，例如穩定版 2.4.7 新增相容功能通常為 2.5.0。

## 邊界案例的處理原則

以下是本 skill 的實務建議：

| 情境 | 處理 |
| --- | --- |
| 修正功能並補測試 | 同一個 fix 可以涵蓋必要測試，不必只因有測試檔而拆分 |
| 文件錯字加上獨立新功能 | 建議拆成 docs 與 feat；若要求 squash 就保留整體功能意圖 |
| 移除最低 Node 支援版本 | 查公開支援契約；不能因只改 package.json 就認定無破壞性影響 |
| 內部 helper 改名 | 確認無對外影響後可用 refactor |
| 新增自訂 type | 先檢查本地 type-enum；語法可相容，工具也可能拒絕 |
| revert | 讀回復範圍與原始 SHA，再查發布工具；勿假設一定抵銷升版 |
| squash merge | 檢查最終進入主線的訊息；原 PR 內的小提交訊息不一定是發布依據 |

## 延伸閱讀與採納範圍

- [commitlint 設定](https://commitlint.js.org/reference/configuration.html)：可自訂 extends、parserPreset、rules、忽略條件；設定可在獨立檔或 package.json。採納「先讀設定再驗證」的工作順序。
- [commitlint 規則](https://commitlint.js.org/reference/rules.html)：長度、大小寫、scope 等均可調整。例如 `breaking-change-exclamation-mark` 若啟用，可要求 ! 與 breaking footer 同時出現；這比核心規範嚴格。
- [config-conventional 原始設定](https://github.com/conventional-changelog/commitlint/blob/master/%40commitlint/config-conventional/src/index.ts)：查閱時標題上限為 100 並限制小寫 type 與 type 清單；這是該 preset 的設定，不是所有專案的現況。
- [semantic-release commit-analyzer](https://github.com/semantic-release/commit-analyzer)：parser preset 與 releaseRules 會影響升版；自訂規則可讓特定 docs/refactor 也觸發發版。需要按實際設定驗證。
- [Git trailers](https://git-scm.com/docs/git-interpret-trailers)：理解訊息末尾的結構化資料。Git trailer parser 與 Conventional Commits footer 規則相關但不完全相同，不能以 Git 解析結果取代 CC 檢查。
- [Conventional Changelog 官方 message skill](https://github.com/conventional-changelog/conventional-changelog/blob/master/skills/conventional-commit-message/SKILL.md)：參考其 staged diff、scope 與公開契約檢查流程。該專案對 visible/hidden 類型、依賴更新及 changelog 的偏好屬本地規則，本 skill 不將其泛化。
