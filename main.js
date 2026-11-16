// 貓語翻譯所 — 全站唯一腳本
// 依 <body data-page="..."> 決定要執行哪一段：
//   home     首頁：卡片牆、搜尋、分類／收藏篩選、排序、隨機、解鎖進度
//   behavior 行為頁：分類標籤、難測指數、收藏、分享、線索、閱讀進度條、上下則
//   decoder  貓語解碼器：勾選觀察到的線索 → 推測行為
//   quiz     貓語小測驗：看人話猜行為
//   about    關於頁（只需要共用的導覽列與頁尾）
// 所有頁面共用：導覽列、頁尾、深色模式。

/* ========== 設定（新增分類／線索／導覽項目只改這裡）========== */

const CATEGORIES = {
  body:   "身體語言",
  sound:  "叫聲",
  quirk:  "怪行為",
  social: "社交互動",
};

// 線索字典：behaviors.json 的 clues 只能使用這裡的代碼
const CLUES = {
  tail:  { label: "🐈 尾巴", items: {
    "tail-up": "尾巴豎直", "tail-puff": "尾巴炸毛", "tail-twitch": "尾巴甩動、尾尖抽動" } },
  face:  { label: "👀 眼睛與耳朵", items: {
    "eyes-slow": "慢慢眨眼", "eyes-wide": "瞳孔放大", "eyes-stare": "專注盯著某處",
    "look-at-you": "一直看著你", "ears-back": "耳朵往後壓" } },
  body:  { label: "🐾 身體動作", items: {
    "paws-push": "前腳一壓一放", "belly": "翻肚躺著", "rub": "用頭或臉蹭",
    "arched": "弓起背", "running": "狂奔亂跳", "hide": "躲進箱子或小空間" } },
  sound: { label: "🔊 聲音", items: {
    "purr": "呼嚕呼嚕", "meow": "對你喵喵叫", "hiss": "哈氣、嘶嘶聲", "chatter": "咔咔聲" } },
  when:  { label: "🕒 時機與地點", items: {
    "greet": "你剛回家時", "night": "半夜或清晨", "food-time": "接近吃飯時間",
    "window": "在窗邊", "on-table": "在桌上", "on-you": "窩在你身上", "walk-to-you": "主動走向你" } },
};

// 導覽列：新增功能頁時在這裡加一筆
const NAV = [
  { href: "index.html",   label: "行為圖鑑", page: ["home", "behavior"] },
  { href: "decoder.html", label: "解碼器",   page: ["decoder"] },
  { href: "quiz.html",    label: "小測驗",   page: ["quiz"] },
  { href: "about.html",   label: "關於",     page: ["about"] },
];

// localStorage 的鍵名（全部以 ct- 開頭）
const KEYS = { favs: "ct-favs", seen: "ct-seen", theme: "ct-theme", quizBest: "ct-quiz-best" };

/* ========== 共用工具 ========== */

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 無痕模式等情況，忽略 */ }
  },
};

const ALL_CLUES = Object.values(CLUES).reduce((acc, g) => Object.assign(acc, g.items), {});
const page = document.body.dataset.page;
const $ = (sel) => document.querySelector(sel);
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

const getSet = (key) => new Set(store.get(key, []));
const saveSet = (key, set) => store.set(key, [...set]);
function toggleFav(slug) {
  const favs = getSet(KEYS.favs);
  favs.has(slug) ? favs.delete(slug) : favs.add(slug);
  saveSet(KEYS.favs, favs);
  return favs.has(slug);
}

function mysteryHTML(n) {
  let s = "";
  for (let i = 1; i <= 5; i++) s += i <= n ? "🐾" : '<span class="off">🐾</span>';
  return `<span class="mystery" title="貓心難測指數 ${n}/5">${s}</span>`;
}
const tagHTML = (cat) => `<span class="tag tag-${cat}">${CATEGORIES[cat] || cat}</span>`;

/* ========== 深色模式 ========== */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = $("#theme-btn");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}
applyTheme(store.get(KEYS.theme, "light"));

/* ========== 導覽列與頁尾 ========== */

function renderChrome() {
  const header = $("#site-header");
  if (header) {
    header.innerHTML = `
      <div class="wrap header-inner">
        <a class="logo" href="index.html">🐱 貓語<span>翻譯所</span></a>
        <nav class="main-nav">
          ${NAV.map((n) => `<a href="${n.href}" class="${n.page.includes(page) ? "active" : ""}">${n.label}</a>`).join("")}
          <button id="theme-btn" class="theme-btn" aria-label="切換深色模式"></button>
        </nav>
      </div>`;
    $("#theme-btn").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      store.set(KEYS.theme, next);
      applyTheme(next);
    });
    applyTheme(document.documentElement.dataset.theme);
  }
  const footer = $("#site-footer");
  if (footer) footer.innerHTML = "貓語翻譯所 · 翻譯僅供參考，最終解釋權歸貓所有 🐾";
}

/* ========== 首頁 ========== */

function renderHome(list) {
  const grid = $("#card-grid");
  const search = $("#search");
  const sortSel = $("#sort");
  const buttons = document.querySelectorAll(".filter-btn");
  let activeCat = "all";

  // 分類按鈕加上數量
  buttons.forEach((btn) => {
    const c = btn.dataset.cat;
    if (CATEGORIES[c]) btn.insertAdjacentHTML("beforeend", ` <span class="count">${list.filter((b) => b.category === c).length}</span>`);
  });

  // 解鎖進度
  const seen = getSet(KEYS.seen);
  const unlocked = list.filter((b) => seen.has(b.slug)).length;
  $("#count").textContent = list.length;
  $("#progress-text").textContent = `已解鎖 ${unlocked} / ${list.length} 種貓語`;
  $("#progress-fill").style.width = `${(unlocked / list.length) * 100}%`;

  // 隨機抽一隻：優先抽還沒看過的
  $("#random-btn").addEventListener("click", () => {
    const pool = list.filter((b) => !seen.has(b.slug));
    const pick = shuffle(pool.length ? pool : list)[0];
    location.href = `${pick.slug}.html`;
  });

  function sorted(items) {
    const s = sortSel.value;
    const copy = [...items];
    if (s === "mystery-desc") copy.sort((a, b) => b.mystery - a.mystery);
    if (s === "mystery-asc") copy.sort((a, b) => a.mystery - b.mystery);
    if (s === "name") copy.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
    return copy;
  }

  function draw() {
    const q = search.value.trim().toLowerCase();
    const favs = getSet(KEYS.favs);
    const shown = sorted(list.filter((b) => {
      const okCat = activeCat === "all" || (activeCat === "fav" ? favs.has(b.slug) : b.category === activeCat);
      const clueText = (b.clues || []).map((c) => ALL_CLUES[c]).join(" ");
      const hay = `${b.name} ${b.en} ${b.summary} ${clueText}`.toLowerCase();
      return okCat && (!q || hay.includes(q));
    }));

    $("#result-info").textContent = q || activeCat !== "all" ? `找到 ${shown.length} 種` : "";
    grid.innerHTML = shown.length
      ? shown.map((b) => {
          const fav = favs.has(b.slug);
          return `
        <article class="card ${seen.has(b.slug) ? "seen" : ""}">
          <button class="fav-btn ${fav ? "on" : ""}" data-slug="${b.slug}" aria-label="收藏">${fav ? "❤️" : "🤍"}</button>
          <div class="emoji">${b.emoji}</div>
          <h3><a class="card-link" href="${b.slug}.html">${b.name}</a></h3>
          <div class="en">${b.en}</div>
          <p class="summary">「${b.summary}」</p>
          <div class="meta">${tagHTML(b.category)}${mysteryHTML(b.mystery)}</div>
          ${seen.has(b.slug) ? '<span class="seen-stamp">已解鎖</span>' : ""}
        </article>`;
        }).join("")
      : activeCat === "fav"
        ? `<p class="empty">還沒有收藏……點卡片右上角的 🤍，就能把喜歡的貓語收進來。</p>`
        : `<p class="empty">找不到這個行為……貓表示：「那不是我做的。」</p>`;

    grid.querySelectorAll(".fav-btn").forEach((btn) =>
      btn.addEventListener("click", () => { toggleFav(btn.dataset.slug); draw(); })
    );
  }

  search.addEventListener("input", draw);
  sortSel.addEventListener("change", draw);
  buttons.forEach((btn) =>
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCat = btn.dataset.cat;
      draw();
    })
  );
  draw();
}

/* ========== 行為頁 ========== */

function renderBehavior(list) {
  const slug = document.body.dataset.slug;
  const i = list.findIndex((b) => b.slug === slug);
  if (i === -1) return;
  const me = list[i];

  // 記錄為已解鎖
  const seen = getSet(KEYS.seen);
  seen.add(slug);
  saveSet(KEYS.seen, seen);

  const meta = $("#hero-meta");
  if (meta) meta.innerHTML = `${tagHTML(me.category)} <span>貓心難測指數 ${mysteryHTML(me.mystery)}</span>`;

  // 收藏與分享
  const actions = $("#hero-actions");
  if (actions) {
    const favLabel = (on) => (on ? "❤️ 已收藏" : "🤍 收藏");
    actions.innerHTML = `
      <button class="action-btn" id="fav-btn">${favLabel(getSet(KEYS.favs).has(slug))}</button>
      <button class="action-btn" id="share-btn">🔗 複製連結</button>`;
    $("#fav-btn").addEventListener("click", (e) => { e.currentTarget.textContent = favLabel(toggleFav(slug)); });
    $("#share-btn").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(location.href); btn.textContent = "✅ 已複製！"; }
      catch { btn.textContent = "請複製網址列的連結"; }
      setTimeout(() => (btn.textContent = "🔗 複製連結"), 1800);
    });
  }

  // 可觀察線索（點了會帶到解碼器）
  const clueBox = $("#clue-chips");
  if (clueBox && me.clues && me.clues.length) {
    clueBox.innerHTML = `<span class="clue-label">常見線索</span>` +
      me.clues.map((c) => `<a class="chip" href="decoder.html?clues=${c}">${ALL_CLUES[c] || c}</a>`).join("");
  }

  // 閱讀進度條
  const bar = document.createElement("div");
  bar.className = "read-progress";
  document.body.appendChild(bar);
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 100}%`;
  };
  addEventListener("scroll", update, { passive: true });
  update();

  // 上一則／下一則
  const pager = $("#pager");
  if (!pager) return;
  const prev = list[i - 1];
  const next = list[i + 1];
  pager.innerHTML =
    (prev ? `<a class="prev" href="${prev.slug}.html"><span class="dir">← 上一則</span>${prev.emoji} ${prev.name}</a>` : "") +
    (next ? `<a class="next" href="${next.slug}.html"><span class="dir">下一則 →</span>${next.emoji} ${next.name}</a>` : "");
}

/* ========== 貓語解碼器 ========== */

function renderDecoder(list) {
  const picked = new Set(
    (new URLSearchParams(location.search).get("clues") || "").split(",").filter((c) => ALL_CLUES[c])
  );
  const groupsBox = $("#clue-groups");
  const results = $("#decoder-results");

  groupsBox.innerHTML = Object.values(CLUES).map((g) => `
    <div class="clue-group">
      <h3>${g.label}</h3>
      <div class="chips">
        ${Object.entries(g.items).map(([code, label]) =>
          `<button class="chip ${picked.has(code) ? "on" : ""}" data-code="${code}">${label}</button>`).join("")}
      </div>
    </div>`).join("");

  function draw() {
    if (!picked.size) {
      results.innerHTML = `<p class="empty">👆 先勾選你看到的線索，翻譯所就會開始解讀。</p>`;
      return;
    }
    const ranked = list
      .map((b) => ({ b, hit: (b.clues || []).filter((c) => picked.has(c)) }))
      .filter((r) => r.hit.length)
      .sort((x, y) => y.hit.length - x.hit.length || x.b.mystery - y.b.mystery);

    if (!ranked.length) {
      results.innerHTML = `<p class="empty">這組線索太神秘了，連貓都看不懂。試著少選幾個？</p>`;
      return;
    }
    const top = ranked[0].hit.length;
    results.innerHTML = `<h2>翻譯結果（${ranked.length} 種可能）</h2>` + ranked.map(({ b, hit }) => `
      <a class="result-card ${hit.length === top ? "best" : ""}" href="${b.slug}.html">
        <div class="emoji">${b.emoji}</div>
        <div class="result-body">
          ${hit.length === top ? '<span class="best-badge">最可能</span>' : ""}
          <h3>${b.name} <small>${b.en}</small></h3>
          <p>「${b.summary}」</p>
          <div class="match">符合 ${hit.length} 個線索：${hit.map((c) => ALL_CLUES[c]).join("、")}</div>
        </div>
      </a>`).join("");
  }

  groupsBox.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      const c = chip.dataset.code;
      picked.has(c) ? picked.delete(c) : picked.add(c);
      chip.classList.toggle("on");
      draw();
    })
  );
  $("#reset-btn").addEventListener("click", () => {
    picked.clear();
    groupsBox.querySelectorAll(".chip").forEach((c) => c.classList.remove("on"));
    draw();
  });
  draw();
}

/* ========== 貓語小測驗 ========== */

function renderQuiz(list) {
  const box = $("#quiz");
  const TOTAL = Math.min(8, list.length);
  let questions, idx, score;

  const rank = (r) => (r === 1 ? "🏆 貓語檢定一級" : r >= 0.75 ? "😼 資深貓奴" : r >= 0.4 ? "🐱 見習鏟屎官" : "🙀 貓：你根本不懂我");

  function start() {
    questions = shuffle(list).slice(0, TOTAL).map((answer) => ({
      answer,
      options: shuffle([answer, ...shuffle(list.filter((b) => b.slug !== answer.slug)).slice(0, 3)]),
    }));
    idx = 0;
    score = 0;
    ask();
  }

  function intro() {
    const best = store.get(KEYS.quizBest, null);
    box.innerHTML = `
      <div class="quiz-card center">
        <div class="emoji-big">🎓</div>
        <h2>你聽得懂貓說話嗎？</h2>
        <p>共 ${TOTAL} 題。每題會給你一句「翻成人話」的貓語，猜猜貓正在做什麼。</p>
        ${best !== null ? `<p class="best">目前最佳紀錄：${best} / ${TOTAL}</p>` : ""}
        <button class="btn-primary" id="start-btn">開始測驗</button>
      </div>`;
    $("#start-btn").addEventListener("click", start);
  }

  function ask() {
    const q = questions[idx];
    box.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-top">
          <span>第 ${idx + 1} / ${TOTAL} 題</span><span>得分 ${score}</span>
        </div>
        <div class="quiz-bar"><span style="width:${(idx / TOTAL) * 100}%"></span></div>
        <p class="quiz-label">貓說：</p>
        <p class="quiz-quote">「${q.answer.summary}」</p>
        <p class="quiz-label">牠正在……</p>
        <div class="options">
          ${q.options.map((o) => `<button class="option" data-slug="${o.slug}">${o.emoji} ${o.name}</button>`).join("")}
        </div>
        <div id="feedback"></div>
      </div>`;
    box.querySelectorAll(".option").forEach((btn) =>
      btn.addEventListener("click", () => answer(btn))
    );
  }

  function answer(btn) {
    const q = questions[idx];
    const right = btn.dataset.slug === q.answer.slug;
    if (right) score++;
    box.querySelectorAll(".option").forEach((b) => {
      b.disabled = true;
      if (b.dataset.slug === q.answer.slug) b.classList.add("correct");
    });
    if (!right) btn.classList.add("wrong");
    $("#feedback").innerHTML = `
      <div class="feedback ${right ? "ok" : "no"}">
        <strong>${right ? "答對了！貓勉強點了點頭。" : `答錯了，答案是「${q.answer.name}」。`}</strong>
        <a href="${q.answer.slug}.html" target="_blank">看完整翻譯 ↗</a>
      </div>
      <button class="btn-primary" id="next-btn">${idx + 1 < TOTAL ? "下一題 →" : "看結果"}</button>`;
    $("#next-btn").addEventListener("click", () => { idx++; idx < TOTAL ? ask() : finish(); });
  }

  function finish() {
    const best = Math.max(score, store.get(KEYS.quizBest, 0));
    store.set(KEYS.quizBest, best);
    box.innerHTML = `
      <div class="quiz-card center">
        <p class="quiz-label">你的成績</p>
        <div class="score-big">${score} <small>/ ${TOTAL}</small></div>
        <h2>${rank(score / TOTAL)}</h2>
        <p class="best">最佳紀錄：${best} / ${TOTAL}</p>
        <div class="quiz-actions">
          <button class="btn-primary" id="again-btn">再玩一次</button>
          <a class="btn-ghost" href="index.html">去圖鑑複習</a>
        </div>
      </div>`;
    $("#again-btn").addEventListener("click", start);
  }

  intro();
}

/* ========== 啟動 ========== */

renderChrome();
const RENDER = { home: renderHome, behavior: renderBehavior, decoder: renderDecoder, quiz: renderQuiz };
if (RENDER[page]) {
  fetch("behaviors.json")
    .then((res) => res.json())
    .then((list) => RENDER[page](list))
    .catch(() => {
      const main = document.querySelector("main");
      if (main) main.insertAdjacentHTML("afterbegin", '<p class="empty">資料載入失敗，請用網址（GitHub Pages 或本機伺服器）開啟網站。</p>');
    });
}
