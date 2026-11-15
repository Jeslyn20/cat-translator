# 🐱 貓語翻譯所 Cat Translator

把貓咪的怪行為翻譯成人話的**貓咪行為圖鑑**網站。

- 🌐 網站：https://jeslyn20.github.io/cat-translator/
- 📘 AI 協作規則：[`CLAUDE.md`](./CLAUDE.md)（`AGENTS.md` 指向同一份）

## 特色
- 每個行為一頁，7 個固定區塊：貓語 → 人話、為什麼、怎麼分辨、鏟屎官怎麼做、冷知識…
- 首頁卡片牆、即時搜尋、分類篩選，全部由 `behaviors.json` 自動產生
- 純 HTML / CSS / JavaScript，無需建置，直接部署 GitHub Pages

## 新增一個行為
1. 複製 `_template.html` → `<slug>.html`，填入內容
2. 在 `behaviors.json` 最後加一筆
3. 完成！首頁與上下頁會自動更新

或直接對 AI 說：「請依照 CLAUDE.md，新增一個貓咪行為：喵喵叫要飯」。

## 本機預覽
```bash
python3 -m http.server 8000
# 打開 http://localhost:8000
```
