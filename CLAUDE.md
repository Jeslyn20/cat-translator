# CLAUDE.md — 貓語翻譯所（Cat Translator）專案規則

> 這份文件是給 AI（Claude、Codex、Cursor 等）閱讀的「專案說明書」。
> 每次新增或修改內容之前，請先完整讀完本文件，並嚴格遵守。
> （`AGENTS.md` 內容指向本文件，兩者規則相同。）

---

## 1. 專案目的與功能

「貓語翻譯所」是一個**貓咪行為圖鑑網站**。每一頁「翻譯」一種貓咪行為，
把貓的肢體語言、叫聲、怪癖，翻成人類聽得懂的話，並附上科學解釋與飼主建議。

- 目標讀者：新手貓奴、想養貓的人、對貓好奇的一般人
- 語氣：**輕鬆、幽默、像貓在吐槽人類**，但「為什麼會這樣」段落必須正確、有根據
- 網站是純靜態網頁（HTML + CSS + 原生 JavaScript），不需要任何建置工具，
  直接放上 GitHub Pages 就能瀏覽

### 功能總覽

| 功能 | 位置 | 資料來源 |
|------|------|---------|
| 卡片牆、搜尋（含線索）、分類篩選、排序 | 首頁 `index.html` | `behaviors.json` |
| ❤️ 收藏、「我的收藏」篩選 | 首頁卡片、行為頁 | localStorage `ct-favs` |
| 已解鎖印章與收集進度條 | 首頁 | localStorage `ct-seen`（打開行為頁時記錄） |
| 🎲 隨機抽一隻（優先抽沒看過的） | 首頁 | `behaviors.json` + `ct-seen` |
| 行為頁：收藏、複製連結、常見線索、閱讀進度條、上一則／下一則 | 每個行為頁 | `behaviors.json` |
| 🔍 貓語解碼器：勾選線索 → 推測行為 | `decoder.html` | `behaviors.json` 的 `clues` |
| 🎓 貓語小測驗：看人話猜行為，記錄最佳成績 | `quiz.html` | `behaviors.json` 的 `summary` |
| 🌙 深色模式 | 所有頁面右上角 | localStorage `ct-theme` |

**核心設計：所有功能都從 `behaviors.json` 自動產生。**
新增一個行為後，它會自動出現在首頁、搜尋、排序、隨機、解碼器和小測驗的題庫裡，
不需要修改任何功能程式碼。

---

## 2. 檔案結構（全部放在同一層，不使用子資料夾）

本專案刻意採用**扁平結構**：所有檔案都放在 repo 根目錄。
這樣可以直接用 GitHub 網頁「Upload files」上傳，不會因為資料夾沒被保留而讓路徑失效。
**不可新增任何子資料夾**。檔案用「命名規則」分類（見下表）。

```
cat-translator/
│  ── 規則與說明 ──
├── CLAUDE.md              ← 本文件（AI 專案規則）
├── AGENTS.md              ← 指向 CLAUDE.md
├── README.md              ← 給人看的專案介紹
├── .nojekyll              ← 讓 GitHub Pages 不經過 Jekyll 處理
│  ── 功能頁 ──
├── index.html             ← 首頁（data-page="home"）
├── decoder.html           ← 貓語解碼器（data-page="decoder"）
├── quiz.html              ← 貓語小測驗（data-page="quiz"）
├── about.html             ← 關於頁（data-page="about"）
│  ── 共用檔（全站各一份）──
├── style.css              ← 全站唯一樣式表（含深色模式）
├── main.js                ← 全站唯一腳本（所有功能都在這裡）
├── behaviors.json         ← ★ 所有行為的「資料庫」，所有功能都靠它
│  ── 行為頁 ──
├── _template.html         ← ★ 新增行為頁時一律複製這個檔案
├── kneading.html
├── slow-blink.html
└── ...（其他 <slug>.html）
```

| 檔名樣式 | 代表 |
|---------|------|
| `index`、`decoder`、`quiz`、`about` | 功能頁，名稱保留，**行為頁的 slug 不可使用這些名字** |
| `_` 開頭 | 模板，不會出現在網站的卡片牆 |
| `<英文小寫-連字號>.html` | 行為頁，一定要在 `behaviors.json` 有對應的一筆 |
| `.css` / `.js` / `.json` | 共用檔，全站各只有一份 |

**禁止**新增其他 CSS / JS 檔、禁止在 HTML 裡寫 `<style>` 或 inline `style=""`、
禁止引入 React、Tailwind、jQuery 等框架或 CDN 套件（Google Fonts 除外）。
（唯一例外：`main.js` 可以用 `style.width` 設定進度條這類「依數字變化的寬度」。）

---

## 3. 新增一個行為頁：標準流程（最重要）

當使用者說「新增一個貓咪行為：XXX」時，依序完成以下 5 步，缺一不可：

1. **決定 slug（檔名）**
   - 用英文小寫、單字之間用連字號 `-`，例如 `head-bump`、`chirping`
   - 檔案直接放在根目錄：`<slug>.html`（不要放進子資料夾）
2. **複製 `_template.html`** 成新檔，填入所有 `{{ }}` 佔位內容，
   並把 `<body data-page="behavior" data-slug="">` 的 slug 填好。不可刪減或調換區塊順序。
3. **在 `behaviors.json` 最後面新增一筆**（格式見第 5 節）。
   陣列順序 = 首頁預設順序 = 上一則／下一則順序。
4. **填寫 `clues`（線索）**：從第 6 節的線索字典挑 2–5 個最能辨認這個行為的代碼。
   若字典裡沒有合適的線索，依第 6 節的方式新增。
5. **檢查相關行為連結**：新頁的「相關行為」只能連到 `behaviors.json` 裡已存在的 slug；
   如果新行為和舊頁面高度相關，也可在舊頁面的「相關行為」補上新頁連結。

完成後回報：新增了哪個檔案、JSON 新增了哪一筆（含 clues）、改了哪些舊頁面。

---

## 4. 行為頁的固定區塊（順序不可變）

每個行為頁都由以下 7 個區塊組成，class 名稱必須與模板一致：

| # | 區塊 | class | 內容規則 |
|---|------|-------|---------|
| 1 | 頁首 | `.behavior-hero` | emoji、中文名稱、英文名稱。下方 3 個空容器由 `main.js` 自動填入（見下） |
| 2 | 貓語 → 人話 | `.translate-box` | 左邊「貓的動作」（客觀描述）、右邊「翻成人話」＝ JSON 的 `summary` |
| 3 | 為什麼會這樣？ | `.section-why` | 2–3 段，說明科學／行為學原因。**必須正確**，不確定的事寫「可能」「一般認為」 |
| 4 | 怎麼分辨？ | `.section-read` | 3–4 個 `<li>`，格式 `<strong>情境</strong>：代表的意思` |
| 5 | 鏟屎官該怎麼做 | `.section-do` | `.do-list`（✅ 建議 2–3 條）＋ `.dont-list`（❌ 避免 1–2 條）；涉及健康時加 `.vet-note` |
| 6 | 冷知識 | `.fun-fact` | 1 則，一兩句話，越意外越好；提到研究時寫出年份或地點 |
| 7 | 相關行為 | `.related` | 1–3 個連到其他行為頁的連結，格式 `emoji 中文名稱` |

以下部分由 `main.js` 依 `behaviors.json` 自動產生，**HTML 裡只留空容器，不要手寫內容**：

| 容器 id | 自動產生的內容 |
|--------|--------------|
| `#site-header`、`#site-footer` | 導覽列（含深色模式按鈕）、頁尾 |
| `#hero-meta` | 分類標籤＋貓心難測指數 |
| `#hero-actions` | ❤️ 收藏、🔗 複製連結按鈕 |
| `#clue-chips` | 常見線索（點了會開啟解碼器並預先勾選） |
| `#pager` | 上一則／下一則 |
| （自動加在 body） | 頂部閱讀進度條 |

---

## 5. `behaviors.json` 格式

```json
{
  "slug": "kneading",
  "name": "踩踩",
  "en": "Kneading",
  "category": "body",
  "mystery": 2,
  "emoji": "🍞",
  "summary": "揉麵團不是我的副業，是我從小到大的本能。",
  "clues": ["paws-push", "purr", "on-you"]
}
```

| 欄位 | 規則 | 被哪些功能使用 |
|------|------|-------------|
| `slug` | 與檔名相同（不含 `.html`） | 所有連結 |
| `name` | 中文名稱，2–6 字 | 卡片、測驗選項、解碼結果 |
| `en` | 英文名稱，首字大寫 | 卡片、搜尋 |
| `category` | 只能是下表四種之一 | 分類篩選、標籤顏色 |
| `mystery` | 貓心難測指數，整數 1–5（1 = 一看就懂，5 = 貓自己也不知道） | 🐾 顯示、排序、解碼器同分時排序 |
| `emoji` | 1 個代表 emoji | 卡片、頁首、測驗選項 |
| `summary` | 貓的第一人稱、30 字內、要好笑；**不可出現行為名稱本身**（否則測驗會洩題） | 卡片、翻成人話、測驗題目 |
| `clues` | 2–5 個線索代碼，只能用第 6 節字典裡的代碼 | 解碼器、搜尋、行為頁線索 |

### 分類（category）

| 代碼 | 中文 | 顏色變數 |
|------|------|---------|
| `body` | 身體語言 | `--cat-body` |
| `sound` | 叫聲 | `--cat-sound` |
| `quirk` | 怪行為 | `--cat-quirk` |
| `social` | 社交互動 | `--cat-social` |

若要新增分類：必須同時 (1) 在本表新增一列、(2) 在 `style.css` 的 `:root` 新增顏色變數與
`.tag-<代碼>` 樣式、(3) 在 `main.js` 的 `CATEGORIES` 物件新增一筆、(4) 在 `index.html` 的篩選按鈕新增一顆。

---

## 6. 線索字典（clues）

線索是「飼主看得到的現象」，用來讓解碼器反推行為。定義在 `main.js` 最上方的 `CLUES` 物件，
**`behaviors.json` 只能使用這裡已有的代碼**。

| 群組 | 代碼 → 顯示文字 |
|------|----------------|
| 🐈 尾巴 `tail` | `tail-up` 尾巴豎直、`tail-puff` 尾巴炸毛、`tail-twitch` 尾巴甩動、尾尖抽動 |
| 👀 眼睛與耳朵 `face` | `eyes-slow` 慢慢眨眼、`eyes-wide` 瞳孔放大、`eyes-stare` 專注盯著某處、`look-at-you` 一直看著你、`ears-back` 耳朵往後壓 |
| 🐾 身體動作 `body` | `paws-push` 前腳一壓一放、`belly` 翻肚躺著、`rub` 用頭或臉蹭、`arched` 弓起背、`running` 狂奔亂跳、`hide` 躲進箱子或小空間 |
| 🔊 聲音 `sound` | `purr` 呼嚕呼嚕、`meow` 對你喵喵叫、`hiss` 哈氣、嘶嘶聲、`chatter` 咔咔聲 |
| 🕒 時機與地點 `when` | `greet` 你剛回家時、`night` 半夜或清晨、`food-time` 接近吃飯時間、`window` 在窗邊、`on-table` 在桌上、`on-you` 窩在你身上、`walk-to-you` 主動走向你 |

新增線索時：(1) 在 `main.js` 的 `CLUES` 對應群組加一筆 `"代碼": "顯示文字"`、(2) 更新本表。
代碼用英文小寫＋連字號；顯示文字要是飼主一眼就能觀察到的現象，不可以是解讀（✅「耳朵往後壓」 ❌「很生氣」）。

---

## 7. `main.js` 的架構（修改功能前必讀）

- 每個 HTML 的 `<body>` 都有 `data-page`，`main.js` 依它決定要執行哪個函式：

  | data-page | 函式 | 頁面 |
  |-----------|------|------|
  | `home` | `renderHome` | `index.html` |
  | `behavior` | `renderBehavior` | 所有行為頁 |
  | `decoder` | `renderDecoder` | `decoder.html` |
  | `quiz` | `renderQuiz` | `quiz.html` |
  | `about` | （只有共用導覽列與頁尾） | `about.html` |

- 檔案最上方的「設定區」是唯一需要常改的地方：`CATEGORIES`、`CLUES`、`NAV`（導覽列）、`KEYS`
- **localStorage 鍵名一律以 `ct-` 開頭**，並登記在 `KEYS`；讀寫一律透過 `store.get / store.set`
  （已包 try/catch，無痕模式也不會壞）。目前使用：`ct-favs`、`ct-seen`、`ct-theme`、`ct-quiz-best`
- 解碼器網址可帶參數預先勾選線索：`decoder.html?clues=tail-up,purr`

### 新增一個功能頁（例如「貓咪年齡換算」）

1. 新增 `<名稱>.html`，複製 `about.html` 的 `<head>`、空的 `#site-header`／`#site-footer` 與 `<script src="main.js">`
2. `<body data-page="<名稱>">`
3. 在 `main.js` 的 `NAV` 加一筆導覽項目，並寫一個 `render<名稱>()` 函式，加進最下方的 `RENDER` 物件
4. 樣式加在 `style.css` 對應的區段註解下，只使用既有的 CSS 變數
5. 更新本文件第 1 節功能表、第 2 節檔案結構、第 7 節表格

---

## 8. 視覺風格

- 整體感覺：**溫暖的手作圖鑑**——米白紙張底色、深咖啡文字、橘貓色重點
- 顏色一律使用 `style.css` 中的 CSS 變數，不可寫死色碼
  - `--paper` 背景、`--ink` 文字、`--ginger` 主色（橘貓橘）、`--line` 邊框、`--white` 卡片底色
  - **深色模式只靠覆寫這些變數**（`[data-theme="dark"]`），所以只要用變數，新元素自動支援深色模式
- 字體：標題 `"Zen Maru Gothic"`（圓體，可愛），內文 `"Noto Sans TC"`
- 卡片與按鈕：圓角、2px 邊框、偏移陰影（像貼紙）；優先沿用 `.card`、`.chip`、`.btn-primary`、`.btn-ghost`、`.action-btn`
- Emoji 可以用，但每個區塊標題最多一個
- 手機版（寬度 < 640px）必須正常閱讀與操作

---

## 9. 寫作規則

- 一律使用**繁體中文（台灣用語）**：例如「飼主」「影片」「網路」，不用「視頻」「網絡」
- 稱呼讀者可用「鏟屎官」「貓奴」「你」
- 幽默只放在「翻成人話」「冷知識」與小標；**科學說明保持正確，不可為了好笑而編造事實**
- 涉及貓咪健康（例如突然常躲起來、過度舔毛、異常叫聲）時，必須加
  `<p class="vet-note">🩺 如果持續或伴隨其他症狀，請帶去給獸醫檢查。</p>`
- 不使用真實存在的卡通角色或品牌貓（例如 Hello Kitty、加菲貓），也不寫商品品牌名稱

---

## 10. AI 修改內容時的守則

1. **先讀再改**：修改前先讀 `CLAUDE.md`、`_template.html`、`behaviors.json`；改功能還要讀 `main.js` 設定區
2. **最小修改**：只改被要求的部分，不要順手重排或重寫其他頁面
3. **不改共用檔，除非被要求**：`style.css`、`main.js`、功能頁的修改需先說明原因
4. **保持一致**：新行為頁的結構必須和現有頁面一模一樣，可用 `kneading.html` 當範例對照
5. **路徑一律直接寫檔名**：例如 `style.css`、`main.js`、`kneading.html`，
   不要加 `/`、`../` 或資料夾名稱（GitHub Pages 的網址有 repo 名稱前綴，用 `/` 開頭會壞掉）
6. **完成後自我檢查**（見第 11 節）

---

## 11. 完成檢查清單

- [ ] 新檔案放在根目錄（沒有子資料夾），檔名為英文小寫 + 連字號
- [ ] `<body data-page="behavior" data-slug="...">` 與檔名、JSON 的 `slug` 三者一致
- [ ] 7 個區塊都在，順序正確，沒有殘留 `{{ }}`
- [ ] `behaviors.json` 是合法 JSON（最後一筆後面沒有逗號），8 個欄位都有
- [ ] `clues` 的每個代碼都存在於 `main.js` 的 `CLUES`
- [ ] `summary` 沒有出現行為名稱（測驗不洩題）
- [ ] 「相關行為」的連結都指向存在的檔案
- [ ] 沒有 inline style、沒有新增 CSS/JS 檔、沒有寫死色碼
- [ ] 在本機預覽確認：首頁出現新卡片、搜尋得到、上下則正確、解碼器勾選線索找得到它、深色模式正常

> 本機預覽：在專案根目錄執行 `python3 -m http.server 8000`，
> 打開 http://localhost:8000 。（直接雙擊 HTML 檔，網頁會因瀏覽器限制讀不到 JSON。）
