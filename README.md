# 🐱 貓語翻譯所 Cat Translator

把貓咪的怪行為翻譯成人話的**貓咪行為圖鑑**網站。

- 🌐 網站：https://jeslyn20.github.io/cat-translator/
- 📘 AI 協作規則：[`CLAUDE.md`](./CLAUDE.md)（`AGENTS.md` 指向同一份）

## 特色
- 12 種貓咪行為，每個行為一頁，7 個固定區塊：貓語 → 人話、為什麼、怎麼分辨、鏟屎官怎麼做、冷知識…
- 首頁：卡片牆、即時搜尋、分類篩選、排序、❤️ 收藏、已解鎖進度、🎲 隨機抽一隻
- 🔍 貓語解碼器：勾選看到的線索，推測貓咪的意思
- 🎓 貓語小測驗：看人話猜行為，記錄最佳成績
- 🌙 深色模式
- 所有功能都由 `behaviors.json` 自動產生；純 HTML / CSS / JavaScript，直接部署 GitHub Pages

## 新增一個行為
1. 複製 `_template.html` → `<slug>.html`，填入內容
2. 在 `behaviors.json` 最後加一筆（記得填 `clues` 線索）
3. 完成！首頁、解碼器、小測驗會自動更新

或直接對 AI 說：「請依照 CLAUDE.md，新增一個貓咪行為：喵喵叫要飯」。

## 本機預覽
```bash
python3 -m http.server 8000
# 打開 http://localhost:8000
```
