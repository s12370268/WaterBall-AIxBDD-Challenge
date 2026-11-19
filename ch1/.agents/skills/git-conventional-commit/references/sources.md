# 來源索引與查閱路徑

查閱日期：2026-11-18。起點為使用者指定的 Conventional Commits **1.0.0**。核心採定版；GitHub master 與工具網站可變動，實作時應比對本地 lockfile。表中「定位」是原頁章節名或條款號。

| ID | 原始來源 | 定位與用途 | 查閱路徑 |
| --- | --- | --- | --- |
| S1 | [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) | Summary、Examples、Specification 1–16、Why Use、FAQ | 使用者指定起點；已讀正文與 FAQ |
| S2 | [About](https://www.conventionalcommits.org/en/about/) | 淵源與 Tooling for Conventional Commits；工具地圖 | S1 → About |
| S3 | [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) | Specification 1、3–9、FAQ；公開 API 與版本前提 | S1 → SemVer → 2.0.0 |
| S4 | [Angular Commit Guidelines，歷史固定版本](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#commit-message-guidelines) | Commit Message Format、Revert、Type、Scope、Subject、Body、Footer | S1 → Angular convention；讀取同版本原始檔 |
| S5 | [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) | preset 範圍；具體值另查 src/index.ts | S1 → @commitlint/config-conventional |
| S6 | [git-interpret-trailers](https://git-scm.com/docs/git-interpret-trailers) | DESCRIPTION、OPTIONS、CONFIGURATION VARIABLES；trailer 解析 | S1 → git trailer format |
| S7 | [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.txt) | §§1–5；MUST、SHOULD、MAY 的要求強度 | S1 → RFC 2119（原 IETF 連結轉址） |
| S8 | [commitlint Rules](https://commitlint.js.org/reference/rules.html) | header-max-length、type-case、type-enum、breaking-change-exclamation-mark | S5 所屬工具 → 官方 reference；前次研究已讀 |
| S9 | [commitlint Configuration](https://commitlint.js.org/reference/configuration.html) | 設定檔、extends、parserPreset、rules、ignores/defaultIgnores | 同 S8；前次研究已讀 |
| S10 | [Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog) | README；由訊息及 metadata 產生 changelog/release notes | S2 → conventional-changelog |
| S11 | [semantic-release](https://github.com/semantic-release/semantic-release) | README；整體自動版本與發布流程 | S2 → semantic-release |
| S12 | [Commitizen CLI](https://github.com/commitizen/cz-cli) | Commitizen for contributors、Using the command line tool、Making your repo Commitizen friendly | S2 → commitizen/cz-cli；互動提示與 adapter 設定 |
| S13 | [semantic-release commit-analyzer](https://github.com/semantic-release/commit-analyzer) | Configuration、releaseRules、Default rules matching | S11 生態的提交分析元件；前次研究已讀 |
| S14 | [config-conventional 原始設定](https://github.com/conventional-changelog/commitlint/blob/master/%40commitlint/config-conventional/src/index.ts) | parserPreset 與 rules | S5 → src/index.ts；前次研究已讀 |
| S15 | [Conventional Changelog message skill](https://github.com/conventional-changelog/conventional-changelog/blob/master/skills/conventional-commit-message/SKILL.md) | diff、scope、公開契約與本地 preset 的應用 | S10 生態的延伸參考；前次研究已讀 |

## 來源權重與採納方式

- **核心定義**採 S1；版本影響的前提採 S3；規範性用語採 S7。
- **背景與歷史案例**採 S2、S4。S4 是主站連出的歷史版本，不宣稱為 Angular 當前政策，也不將其限制當成 CC 1.0.0 的要求。
- **工具行為**採工具自己的文件與原始設定；網站列入工具目錄不代表每個工具預設相同，也不保證適用本地安裝版本。
- **實務綜合**包含 staged 優先、語意對照、授權邊界與分層檢查；這些是 skill 的操作設計，不冒稱原文逐字規則。

## 研究邊界

此次沿直接相關連結擴充，聚焦訊息結構、版本語意、規範強度與產生／驗證／發布工具。沒有逐一審查 About 工具清單中的所有實作；沒有把舊版 beta 或歷史 Angular 限制套成 1.0.0 的新增要求。外部頁面若更新，保留本次日期並重新查核，不以本文取代原始規範。
