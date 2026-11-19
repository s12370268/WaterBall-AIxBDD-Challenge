# 開發工作流程

每次開發或修正前，依序讀取並套用以下 skills：
1. `.agents/skills/double-diamond-principle/SKILL.md`
2. `.agents/skills/git-conventional-commit/SKILL.md`
3. `.agents/skills/trunk-based-development/SKILL.md`

以繁體中文溝通。保留既有未提交工作與 README 官方宣告。以小批次交付可執行的功能，執行適當驗證。

## 自動提交

- 每次開發、修正或文件調整完成並通過適當驗證後，直接執行 git commit，不需再詢問確認。
- 提交訊息遵循 Conventional Commits，依實際變更選擇 type 與 scope，描述使用繁體中文。
- 僅暫存與提交本次任務相關的變更，保留其他既有未提交或未追蹤的工作。
- 驗證失敗時先修正；無法完成時回報原因，不將未完成工作宣稱為已驗證。
- 完成後回報 commit hash 與提交訊息；沒有變更時不建立空 commit。
- 不執行 git push。部署須有使用者另外明確授權。

## Skill Usage Reporting

Before starting a task:
- Identify which available skills are relevant.
- Use relevant skills according to their triggering rules.
- Do not invoke unrelated skills.

When reporting progress or results:
- List the skills actually invoked.
- Explain briefly why each skill was used.
- If no skill was invoked, explicitly state "None".
- Never claim a skill was used unless it was actually loaded.

At task completion, include:

### Skill Usage
- Invoked Skills: [names or None]
- Purpose: [brief explanation]
- Validation: [checks performed and results]