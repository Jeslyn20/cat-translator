// 貓語翻譯所 — 全站唯一腳本
// 1) 首頁：讀 data/behaviors.json 產生卡片、搜尋、分類篩選
// 2) 行為頁：依 <body data-slug> 產生分類標籤、難測指數、上一則／下一則

const CATEGORIES = {
  body:   "身體語言",
  sound:  "叫聲",
  quirk:  "怪行為",
  social: "社交互動",
};

const isBehaviorPage = document.body.dataset.slug !== undefined;
const DATA_URL = isBehaviorPage ? "../data/behaviors.json" : "data/behaviors.json";

function mysteryHTML(n) {
  let s = "";
  for (let i = 1; i <= 5; i++) s += i <= n ? "🐾" : '<span class="off">🐾</span>';
  return `<span class="mystery" title="貓心難測指數 ${n}/5">${s}</span>`;
}

function tagHTML(cat) {
  return `<span class="tag tag-${cat}">${CATEGORIES[cat] || cat}</span>`;
}

async function loadData() {
  const res = await fetch(DATA_URL);
  return res.json();
}

/* ---------- 首頁 ---------- */
function renderHome(list) {
  const grid = document.getElementById("card-grid");
  const search = document.getElementById("search");
  const buttons = document.querySelectorAll(".filter-btn");
  const count = document.getElementById("count");
  let activeCat = "all";

  function draw() {
    const q = search.value.trim().toLowerCase();
    const shown = list.filter((b) => {
      const okCat = activeCat === "all" || b.category === activeCat;
      const hay = `${b.name} ${b.en} ${b.summary}`.toLowerCase();
      return okCat && (!q || hay.includes(q));
    });
    count.textContent = shown.length;
    grid.innerHTML = shown.length
      ? shown.map((b) => `
        <a class="card" href="behaviors/${b.slug}.html">
          <div class="emoji">${b.emoji}</div>
          <h3>${b.name}</h3>
          <div class="en">${b.en}</div>
          <p class="summary">「${b.summary}」</p>
          <div class="meta">${tagHTML(b.category)}${mysteryHTML(b.mystery)}</div>
        </a>`).join("")
      : `<p class="empty">找不到這個行為……貓表示：「那不是我做的。」</p>`;
  }

  search.addEventListener("input", draw);
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

/* ---------- 行為頁 ---------- */
function renderBehavior(list) {
  const slug = document.body.dataset.slug;
  const i = list.findIndex((b) => b.slug === slug);
  if (i === -1) return;
  const me = list[i];

  const meta = document.getElementById("hero-meta");
  if (meta) meta.innerHTML = `${tagHTML(me.category)} <span>貓心難測指數 ${mysteryHTML(me.mystery)}</span>`;

  const pager = document.getElementById("pager");
  if (!pager) return;
  const prev = list[i - 1];
  const next = list[i + 1];
  pager.innerHTML =
    (prev ? `<a class="prev" href="${prev.slug}.html"><span class="dir">← 上一則</span>${prev.emoji} ${prev.name}</a>` : "") +
    (next ? `<a class="next" href="${next.slug}.html"><span class="dir">下一則 →</span>${next.emoji} ${next.name}</a>` : "");
}

loadData().then((list) => (isBehaviorPage ? renderBehavior(list) : renderHome(list)));
