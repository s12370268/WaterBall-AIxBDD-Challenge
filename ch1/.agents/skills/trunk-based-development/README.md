# trunk-based-development

專案 skill 入口：[SKILL.md](SKILL.md)。

使用範例：

```text
/trunk-based-development 檢查目前開發與發布流程，提出導入計畫。
/trunk-based-development 把這個三週重構拆成可每日整合的小步。
```

也可以明確指定：`請依照 .agents/skills/trunk-based-development/SKILL.md，規劃我們的主幹開發流程。`

閱讀順序：

1. [主題索引](references/topic-map.md)：關鍵字、方法論、步驟、規則、適用條件與例外。
2. [實作模式](references/patterns.md)：短命 PR、flags、抽象替換與相容資料搬移。
3. [發布與遷移](references/delivery.md)：發布選擇、hotfix、backport 與量測。
4. [研究來源](references/research.md)：原始網址、查閱日期與解讀限制。

這份 skill 提供操作方法，不自動授權 push、merge 或部署。測試案例在 evals/evals.json；實際執行結果與評分置於相鄰的 trunk-based-development-workspace。
