// Safe DOM helper: all text goes through textContent, so JSON data can never inject HTML.
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

function pic(item, cls) {
  const box = h("div", { class: cls || "pic" }, h("img", { src: item.image, alt: item.name || "", loading: "lazy" }));
  if (item.card) { box.classList.add("zoom"); box.title = "View full card"; box.addEventListener("click", () => lightbox(item.card, item.name)); }
  return box;
}

function toast(msg) {
  const t = h("div", { class: "toast" }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 2200);
}

function randomHex(bytes) {
  const a = new Uint8Array(bytes);
  (window.crypto || { getRandomValues: (x) => x.map(() => Math.random() * 256) }).getRandomValues(a);
  return "0x" + Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Clean line icons for accessories (static constant markup, never user data).
const ICONS = {
  chefhat: '<path d="M7 17h10v3H7zM7 17c-3-1-4-5-1-7 0-3 4-5 6-3 2-2 6 0 6 3 3 2 2 6-1 7"/>',
  crown: '<path d="M3 18h18M4 18 3 7l5 4 4-6 4 6 5-4-1 11z"/>',
  cap: '<path d="M4 15c0-5 3-8 8-8s8 3 8 8zM4 15h17l2 2H4z"/>',
  shades: '<path d="M2 10h20M3 10c0 4 1 6 4 6s4-2 4-5m2 0c0 3 1 5 4 5s4-2 4-6"/>',
  specs: '<circle cx="7" cy="13" r="4"/><circle cx="17" cy="13" r="4"/><path d="M11 13h2M3 12 1 9M21 12l2-3"/>',
  bowtie: '<path d="M12 12 3 7v10zM12 12l9-5v10z"/><circle cx="12" cy="12" r="2"/>',
  medal: '<path d="M8 2l4 7 4-7"/><circle cx="12" cy="15" r="6"/><path d="m12 12 1 2h2l-1.5 1.5.5 2-2-1-2 1 .5-2L9 14h2z"/>',
  mic: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
  brush: '<path d="M14 3l7 7-8 8-7-7zM6 11l-3 7 4 3 6-3"/>',
  chars: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 4-7 8-7s8 2 8 7"/>',
  city: '<path d="M3 21V9l6-4v16M9 21V3h8v18M17 21V11h4v10M2 21h20"/>',
  ward: '<path d="M12 4a2 2 0 1 1 2 2c-1 0-2 1-2 2L3 15h18l-9-7"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  chain: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18c2 0 2-2 1-3s0-3 2-3h2a4 4 0 0 0 4-4c0-5-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="16" cy="8" r="1"/>',
  game: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 13h.01"/>',
};
function icon(name, color, size) {
  const s = document.createElement("span");
  s.className = "ico";
  s.innerHTML = '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) + '" fill="none" stroke="' + (color || "currentColor") + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || "") + "</svg>";
  return s;
}
function lightbox(src, alt) {
  const lb = document.getElementById("lightbox");
  lb.textContent = ""; lb.append(h("img", { src, alt: alt || "" }), h("span", { class: "close" }, "×"));
  lb.hidden = false; lb.onclick = () => { lb.hidden = true; };
}
