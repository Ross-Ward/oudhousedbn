/* ============================================================
   OUD HOUSE — site behaviour
   ============================================================ */

/* ---------- Mobile nav ---------- */
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

/* ---------- Find-your-scent popup ---------- */
(function () {
  const modal = document.getElementById('finder-modal');
  const frame = document.getElementById('finder-frame');
  if (!modal || !frame) return;
  const open = (src) => {
    frame.src = src;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    modal.hidden = true;
    frame.src = 'about:blank';
    document.body.style.overflow = '';
  };
  document.querySelectorAll('[data-finder]').forEach(btn =>
    btn.addEventListener('click', () => open(btn.dataset.finder)));
  modal.querySelectorAll('[data-finder-close]').forEach(el =>
    el.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
})();

/* ---------- Scroll reveal ---------- */
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ---------- Fragrance card renderer ---------- */
function fragCard(f) {
  return `
    <a class="frag-card reveal visible" href="fragrance.html?id=${f.id}">
      <div class="frag-card-img">
        <img src="${f.image}" alt="${f.name} — Oud House" loading="lazy">
        <span class="frag-badge">${f.type}</span>
        ${f.stock === 'out' ? '<span class="frag-badge stock out">Sold out</span>' : (f.stock === 'order' ? '<span class="frag-badge stock order">Made to order</span>' : '')}
        <button class="wish-btn${isWished(f.id) ? ' on' : ''}" data-wish="${f.id}" aria-label="Save ${f.name}">${isWished(f.id) ? '♥' : '♡'}</button>
      </div>
      <div class="frag-card-body">
        <h3>${f.name}</h3>
        <div class="frag-card-family">${f.family}</div>
        <p class="frag-card-notes">${[...f.notes.top, ...f.notes.heart].slice(0, 4).join(' · ')}</p>
        <div class="frag-card-foot">
          <span class="frag-price">${f.price}</span>
          ${f.stock === 'out'
        ? '<span class="card-soldout">Sold out</span>'
        : `<button class="card-add" data-add="${f.id}" aria-label="Add ${f.name} to cart">+ Add</button>`}
        </div>
      </div>
    </a>`;
}

/* ---------- Directory page (fragrances.html) ---------- */
const gridEl = document.getElementById('frag-grid');
if (gridEl && typeof FRAGRANCES !== 'undefined') {
  const searchEl = document.getElementById('frag-search');
  const chipHost = document.getElementById('family-chips');
  const sortEl = document.getElementById('frag-sort');
  const countEl = document.getElementById('frag-count');
  let activeFamily = 'All';

  /* Family chips come from the catalogue itself so they always match the data */
  if (chipHost) {
    const fams = [...new Set(FRAGRANCES.map(f => f.family).filter(Boolean))].sort();
    chipHost.innerHTML = ['All', ...fams].map((fam, i) =>
      `<button class="chip${i === 0 ? ' active' : ''}" data-family="${fam}">${fam}</button>`).join('');
  }
  const chipEls = document.querySelectorAll('.chip[data-family]');

  const avgOf = f => {
    const rs = (Array.isArray(f.reviews) ? f.reviews : []).map(r => Number(r.rating) || 0).filter(Boolean);
    return rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0;
  };

  function render() {
    const q = (searchEl?.value || '').trim().toLowerCase();
    let list = FRAGRANCES.filter(f => {
      const inFamily = activeFamily === 'All' || f.family === activeFamily;
      const haystack = [f.name, f.family, f.inspiredBy || '', ...f.notes.top, ...f.notes.heart, ...f.notes.base].join(' ').toLowerCase();
      return inFamily && haystack.includes(q);
    });
    const sort = sortEl?.value || 'featured';
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'rated') list = [...list].sort((a, b) => avgOf(b) - avgOf(a));
    else list = [...list].sort((a, b) => (b.featured === true) - (a.featured === true));
    if (countEl) countEl.textContent = `${list.length} oil${list.length === 1 ? '' : 's'}`;
    gridEl.innerHTML = list.length
      ? list.map(fragCard).join('')
      : `<div class="no-results">No fragrances match your search — try a different note or family.<br>
         <button class="btn no-results-reset" id="frag-reset" type="button">Show everything</button></div>`;
  }

  chipEls.forEach(chip => chip.addEventListener('click', () => {
    chipEls.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFamily = chip.dataset.family;
    render();
  }));

  gridEl.addEventListener('click', e => {
    if (!e.target.closest('#frag-reset')) return;
    if (searchEl) searchEl.value = '';
    activeFamily = 'All';
    chipEls.forEach(c => c.classList.toggle('active', c.dataset.family === 'All'));
    render();
  });

  searchEl?.addEventListener('input', render);
  sortEl?.addEventListener('change', render);

  /* Deep-link support: fragrances.html?q=Oud (used by the homepage note chips) */
  const preQ = new URLSearchParams(location.search).get('q');
  if (preQ && searchEl) searchEl.value = preQ;
  render();
}

/* ---------- Featured strip on home page ---------- */
const featuredEl = document.getElementById('featured-grid');
if (featuredEl && typeof FRAGRANCES !== 'undefined') {
  const featured = FRAGRANCES.filter(f => f.featured);
  featuredEl.innerHTML = (featured.length ? featured : FRAGRANCES).slice(0, 4).map(fragCard).join('');
}

/* ---------- Shop by note (home page) ---------- */
const noteCloudEl = document.getElementById('note-cloud');
if (noteCloudEl && typeof FRAGRANCES !== 'undefined') {
  const freq = {};
  FRAGRANCES.forEach(f => ['top', 'heart', 'base'].forEach(t =>
    (f.notes[t] || []).forEach(n => { freq[n] = (freq[n] || 0) + 1; })));
  /* House signatures lead, then whatever the catalogue uses most */
  const SIGNATURE = ['Oud', 'Rose', 'Amber', 'Musk', 'Saffron', 'Vanilla'];
  const lead = SIGNATURE.filter(n => freq[n]);
  const rest = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([n]) => n).filter(n => !lead.includes(n));
  noteCloudEl.innerHTML = [...lead, ...rest].slice(0, 14).map(note =>
    `<a class="note-chip" href="fragrances.html?q=${encodeURIComponent(note)}">${note}</a>`).join('');
}

/* ---------- What people say (home page) ---------- */
const homeRevEl = document.getElementById('home-reviews');
if (homeRevEl && typeof FRAGRANCES !== 'undefined') {
  const escT = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pool = [];
  FRAGRANCES.forEach(f => (Array.isArray(f.reviews) ? f.reviews : []).forEach(r => {
    if (r && r.text && (Number(r.rating) || 0) >= 5) pool.push({ f, r });
  }));
  /* one review per fragrance, prefer the longest (most substantial) */
  const seen = new Set();
  const picks = pool.sort((a, b) => b.r.text.length - a.r.text.length)
    .filter(({ f }) => !seen.has(f.id) && seen.add(f.id)).slice(0, 3);
  homeRevEl.innerHTML = picks.map(({ f, r }) => `
    <div class="review">
      <div class="review-head">
        <span class="review-author">${escT(r.author) || 'Verified buyer'}</span>
        <span class="stars small">${'★'.repeat(Math.min(5, Math.round(Number(r.rating) || 5)))}</span>
      </div>
      <p class="review-text">${escT(r.text)}</p>
      <a class="review-product" href="fragrance.html?id=${f.id}">on ${f.name}</a>
    </div>`).join('');
}

/* ---------- Wishlist (localStorage) ---------- */
const WISH_KEY = 'oudhouse_wishlist';
function getWish() { try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch { return []; } }
function isWished(id) { return getWish().indexOf(id) >= 0; }
function toggleWish(id) {
  const a = getWish(); const i = a.indexOf(id);
  if (i >= 0) a.splice(i, 1); else a.push(id);
  try { localStorage.setItem(WISH_KEY, JSON.stringify(a)); } catch { /* private mode */ }
  return i < 0;
}
const wishGridEl = document.getElementById('wishlist-grid');
function renderWishlist() {
  if (!wishGridEl || typeof FRAGRANCES === 'undefined') return;
  const saved = getWish().map(id => FRAGRANCES.find(f => f.id === id)).filter(Boolean);
  wishGridEl.innerHTML = saved.length
    ? saved.map(fragCard).join('')
    : '<p class="no-results">No saved fragrances yet — tap the heart on any oil to save it here.</p>';
}
if (wishGridEl) renderWishlist();

/* Hearts toggled inside the Scent Finder / quiz popup (same-origin iframe)
   write the same localStorage key; the storage event keeps this page's
   hearts and wishlist grid in step without a reload. */
window.addEventListener('storage', e => {
  if (e.key && e.key !== WISH_KEY) return;
  document.querySelectorAll('[data-wish]').forEach(el => {
    const on = isWished(el.dataset.wish);
    el.classList.toggle('on', on);
    el.textContent = on ? '♥' : '♡';
  });
  renderWishlist();
});

/* ---------- Accord colours (Fragrantica-style semantic palette) ---------- */
const ACCORD_COLORS = {
  'oud':          '#3f2c19',
  'woody':        '#774414',
  'amber':        '#c47b27',
  'smoky':        '#5a5a5a',
  'incense':      '#6e6558',
  'leather':      '#5e3a1e',
  'earthy':       '#6d5c3f',
  'balsamic':     '#52403a',
  'warm spicy':   '#b05038',
  'fresh spicy':  '#8bc34a',
  'sweet':        '#bf3f3f',
  'vanilla':      '#ede1c5',
  'powdery':      '#c4b6ab',
  'musky':        '#b9a8c0',
  'rose':         '#e05a75',
  'floral':       '#e88fb1',
  'white floral': '#f5f0fa',
  'honey':        '#d9a441',
  'citrus':       '#f7ef48',
  'fresh':        '#7fd6c2',
  'green':        '#1f7d1f',
  'aromatic':     '#3e8e7e'
};

/* Pick dark or light text depending on how bright the bar colour is */
function accordTextColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.55 ? '#1a1a1a' : '#f0ede6';
}

/* Inline SVG line icons (stroke follows the season colour via currentColor) */
const wearSvg = inner =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

const WEAR_META = [
  { key: 'winter', label: 'Winter', color: '#7ec8e3',
    icon: wearSvg('<path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5l-15.6 11M12 2l-2 2.5M12 2l2 2.5M12 22l-2-2.5M12 22l2-2.5"/>') },
  { key: 'spring', label: 'Spring', color: '#8bc34a',
    icon: wearSvg('<path d="M6 21C6 12.5 12.5 5 21 4c-.8 8.8-6.6 15.4-15 17z"/><path d="M6 21c2.6-5.8 6.6-10.4 12-14"/>') },
  { key: 'summer', label: 'Summer', color: '#f08080',
    icon: wearSvg('<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 3v17"/><path d="M12 20h3.5"/>') },
  { key: 'fall',   label: 'Fall',   color: '#e8c48a',
    icon: wearSvg('<path d="M3 8h9.5a2.8 2.8 0 1 0-2.8-2.8"/><path d="M3 12h13.5a2.8 2.8 0 1 1-2.8 2.8"/><path d="M3 16h6"/>') },
  { key: 'day',    label: 'Day',    color: '#f5a623',
    icon: wearSvg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.7M12 18.8v2.7M2.5 12h2.7M18.8 12h2.7M5.3 5.3l1.9 1.9M16.8 16.8l1.9 1.9M18.7 5.3l-1.9 1.9M7.2 16.8l-1.9 1.9"/>') },
  { key: 'night',  label: 'Night',  color: '#9db8f0',
    icon: wearSvg('<path d="M20.6 13.2A8.5 8.5 0 1 1 10.8 3.4a7 7 0 0 0 9.8 9.8z"/>') }
];

/* ---------- Detail page (fragrance.html) ---------- */
const detailEl = document.getElementById('frag-detail');
if (detailEl && typeof FRAGRANCES !== 'undefined') {
  const id = new URLSearchParams(location.search).get('id');
  const f = FRAGRANCES.find(x => x.id === id) || FRAGRANCES[0];
  document.title = `${f.name} — Oud House | بيت العود`;
  const hasFmts = f.formats && f.formats.length;
  const f0 = hasFmts ? f.formats[0] : null;

  const tier = (label, cls, notes) => `
    <div class="note-tier ${cls}">
      <div class="note-tier-label">${label}</div>
      <div class="note-pills">${notes.map(n => `<span class="note-pill ${cls}">${n}</span>`).join('')}</div>
    </div>`;

  const accordsHtml = !f.accords ? '' : `
    <div class="accords">
      <h2>Main Accords</h2>
      ${f.accords.map(a => {
        const bg = ACCORD_COLORS[a.name.toLowerCase()] || '#8a7326';
        const w = Math.max(28, Math.min(100, a.strength));
        return `<div class="accord-bar" style="width:${w}%;background:${bg};color:${accordTextColor(bg)}">${a.name}</div>`;
      }).join('')}
    </div>`;

  const wearHtml = !f.wear ? '' : `
    <div class="wear">
      <h2>When To Wear</h2>
      <div class="wear-grid">
        ${WEAR_META.map(m => `
          <div class="wear-item">
            <div class="wear-icon" style="color:${m.color}">${m.icon}</div>
            <div class="wear-label">${m.label}</div>
            <div class="wear-track"><div class="wear-fill" style="width:${f.wear[m.key] || 0}%;background:${m.color}"></div></div>
          </div>`).join('')}
      </div>
    </div>`;

  /* Reviews (owner-curated, published from the Studio) */
  const escHtml = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reviews = (Array.isArray(f.reviews) ? f.reviews : []).filter(r => r && r.text);
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length : 0;
  const stars = n => { const full = Math.round(n); return '★'.repeat(Math.max(0, Math.min(5, full))) + '☆'.repeat(Math.max(0, 5 - full)); };
  const ratingHtml = reviews.length
    ? `<div class="detail-rating"><span class="stars" aria-label="${avgRating.toFixed(1)} out of 5">${stars(avgRating)}</span> <span class="rating-num">${avgRating.toFixed(1)}</span> <span class="rating-count">(${reviews.length} review${reviews.length === 1 ? '' : 's'})</span></div>`
    : '';
  const reviewsHtml = !reviews.length ? '' : `
    <section class="reviews container">
      <span class="eyebrow">What people say</span>
      <h2 class="section-title">Reviews <span class="rev-agg"><span class="stars">${stars(avgRating)}</span> ${avgRating.toFixed(1)} · ${reviews.length}</span></h2>
      <div class="review-grid">
        ${reviews.map(r => `
          <div class="review">
            <div class="review-head">
              <span class="review-author">${escHtml(r.author) || 'Verified buyer'}</span>
              <span class="stars small" aria-label="${Number(r.rating) || 0} out of 5">${stars(Number(r.rating) || 0)}</span>
              ${r.date ? `<span class="review-date">${escHtml(r.date)}</span>` : ''}
            </div>
            <p class="review-text">${escHtml(r.text)}</p>
          </div>`).join('')}
      </div>
    </section>`;

  detailEl.innerHTML = `
    <div class="detail-img reveal visible">
      <img src="${f.image}" alt="${f.name} — Oud House">
    </div>
    <div class="detail-info">
      <span class="eyebrow">Oud House · ${f.type}</span>
      <h1>${f.name}</h1>
      <div class="detail-family">${f.family}</div>
      ${ratingHtml}
      ${f.stock === 'out' ? '<div class="stock-note out">Currently sold out — check back soon.</div>' : (f.stock === 'order' ? '<div class="stock-note order">Handcrafted to order — allow a few days.</div>' : '')}
      <p class="detail-desc">${f.desc}</p>

      <div class="detail-meta">
        <div><span>Price</span><strong id="d-price">${f0 ? '€' + f0.priceEUR : f.price}</strong></div>
        <div><span>Size</span><strong id="d-size">${f0 ? f0.size : f.size}</strong></div>
        <div><span>Longevity</span><strong>${f.longevity}</strong></div>
        <div><span>Concentration</span><strong id="d-conc">${f0 ? f0.type : f.type}</strong></div>
      </div>

      ${hasFmts && f.formats.length > 1 ? `
      <div class="format-select">
        <h2>Choose your format</h2>
        <div class="format-opts">
          ${f.formats.map((ft, i) => `<button type="button" class="format-opt${i === 0 ? ' active' : ''}" data-fmt="${i}">
            <span class="fo-type">${ft.type}</span><span class="fo-size">${ft.size}</span><span class="fo-price">€${ft.priceEUR}</span></button>`).join('')}
        </div>
      </div>` : ''}

      ${accordsHtml}

      <div class="pyramid">
        <h2>Perfume Pyramid</h2>
        ${tier('Top Notes', 'top', f.notes.top)}
        ${tier('Heart Notes', 'heart', f.notes.heart)}
        ${tier('Base Notes', 'base', f.notes.base)}
      </div>

      ${wearHtml}

      <div class="detail-actions">
        <div class="qty-picker qty-lg">
          <button id="qty-minus" aria-label="Decrease quantity">−</button>
          <span id="qty-val">1</span>
          <button id="qty-plus" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn-solid" id="detail-add"${f.stock === 'out' ? ' disabled' : ''}>${f.stock === 'out' ? 'Sold out' : `Add to Cart — €${f0 ? f0.priceEUR : f.priceEUR}`}</button>
        <button class="wish-btn wish-lg${isWished(f.id) ? ' on' : ''}" data-wish="${f.id}" aria-label="Save ${f.name}">${isWished(f.id) ? '♥' : '♡'}</button>
      </div>
      <a class="back-link" href="fragrances.html">← Back to all fragrances</a>
    </div>`;

  /* Reviews section, then "You may also like" — nearest oils by shared notes + family */
  (function () {
    let anchor = detailEl;
    if (reviewsHtml) { detailEl.insertAdjacentHTML('afterend', reviewsHtml); anchor = detailEl.nextElementSibling; }
    const nset = x => new Set([...(x.notes.top || []), ...(x.notes.heart || []), ...(x.notes.base || [])].map(n => n.toLowerCase()));
    const base = nset(f);
    const sim = FRAGRANCES.filter(x => x.id !== f.id).map(x => {
      const s = nset(x); let shared = 0; base.forEach(n => { if (s.has(n)) shared++; });
      return { x, score: shared + (x.family === f.family ? 1.5 : 0) };
    }).filter(o => o.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    if (sim.length) {
      anchor.insertAdjacentHTML('afterend',
        `<section class="you-may container"><span class="eyebrow">Discover more</span>` +
        `<h2 class="section-title">You may also like</h2>` +
        `<div class="frag-grid">${sim.map(o => fragCard(o.x)).join('')}</div></section>`);
    }
  })();

  let qty = 1, currentFmt = 0;
  const price = () => hasFmts ? f.formats[currentFmt].priceEUR : (f.priceEUR || 0);
  const qtyVal = document.getElementById('qty-val');
  const detailAdd = document.getElementById('detail-add');
  const soldOut = f.stock === 'out';
  const syncQty = () => {
    qtyVal.textContent = qty;
    if (!soldOut) detailAdd.textContent = `Add to Cart — €${qty * price()}`;
  };
  document.getElementById('qty-minus').addEventListener('click', () => { if (qty > 1) { qty--; syncQty(); } });
  document.getElementById('qty-plus').addEventListener('click', () => { if (qty < 20) { qty++; syncQty(); } });
  detailAdd.addEventListener('click', () => { if (soldOut) return; addToCart(f.id, hasFmts ? currentFmt : 0, qty); openCart(); });
  detailEl.querySelectorAll('.format-opt').forEach(btn => btn.addEventListener('click', () => {
    detailEl.querySelectorAll('.format-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFmt = Number(btn.dataset.fmt);
    const ft = f.formats[currentFmt];
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('d-price', '€' + ft.priceEUR); set('d-size', ft.size); set('d-conc', ft.type);
    syncQty();
  }));

  /* Sticky add-to-cart bar (small screens only, mirrors the main button) */
  const sticky = document.createElement('div');
  sticky.className = 'detail-stickybar';
  sticky.innerHTML = soldOut
    ? `<span class="sb-name">${f.name}</span><span class="sb-soldout">Sold out</span>`
    : `<span class="sb-name">${f.name}</span><button class="btn btn-solid sb-add" type="button"></button>`;
  document.body.appendChild(sticky);
  const sbAdd = sticky.querySelector('.sb-add');
  if (sbAdd) {
    const syncSb = () => { sbAdd.textContent = detailAdd.textContent; };
    syncSb();
    new MutationObserver(syncSb).observe(detailAdd, { childList: true, characterData: true, subtree: true });
    sbAdd.addEventListener('click', () => detailAdd.click());
  }
}

/* ---------- Contact links ----------
   A channel that isn't configured yet must never render a dead button:
   fall back to the element's data-contact-fallback channel, or hide it. */
function contactHref(key) {
  if (typeof CONTACT === 'undefined') return '';
  if (key === 'email') return CONTACT.email ? 'mailto:' + CONTACT.email : '';
  return CONTACT[key] || '';
}
if (typeof CONTACT !== 'undefined') {
  document.querySelectorAll('[data-contact]').forEach(el => {
    const href = contactHref(el.dataset.contact);
    if (href) { el.href = href; return; }
    const fb = el.dataset.contactFallback && contactHref(el.dataset.contactFallback);
    if (fb) {
      el.href = fb;
      if (el.dataset.contactFallbackLabel) el.textContent = el.dataset.contactFallbackLabel;
    } else {
      el.style.display = 'none';
    }
  });
}

/* ============================================================
   Cart — localStorage-backed, checkout via WhatsApp or email
   ============================================================ */

const CART_KEY = 'oudhouse_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; }
}

function setCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* private mode */ }
  renderCartBadge();
  renderCartDrawer();
}

function addToCart(id, fmtIdx = 0, qty = 1) {
  const cart = getCart();
  const key = fmtIdx ? id + '~~' + fmtIdx : id;
  cart[key] = (cart[key] || 0) + qty;
  setCart(cart);
}

function fmtOf(f, i) { return (f.formats && f.formats.length) ? (f.formats[i] || f.formats[0]) : null; }

function cartLines() {
  if (typeof FRAGRANCES === 'undefined') return [];
  return Object.entries(getCart()).map(([key, qty]) => {
    const sep = key.indexOf('~~');
    const id = sep >= 0 ? key.slice(0, sep) : key;
    const fi = sep >= 0 ? Number(key.slice(sep + 2)) : 0;
    const f = FRAGRANCES.find(x => x.id === id);
    if (!f) return null;
    const ft = fmtOf(f, fi);
    return { key, f, fi, qty, price: ft ? ft.priceEUR : (f.priceEUR || 0), label: ft ? (ft.type + ' ' + ft.size) : (f.size + ' ' + f.type) };
  }).filter(Boolean);
}

function cartTotal(lines) {
  return lines.reduce((sum, l) => sum + l.price * l.qty, 0);
}

/* Pre-typed order message for WhatsApp / email checkout */
function orderMessage() {
  const lines = cartLines();
  let msg = "Hi Oud House! I'd like to place an order:\n\n";
  lines.forEach(l => {
    msg += `• ${l.qty} × ${l.f.name} (${l.label}) — €${l.price * l.qty}\n`;
  });
  msg += `\nTotal: €${cartTotal(lines)}\n\nName:\nDelivery address (Dublin / Ireland):\n\nAny custom blend requests:`;
  return msg;
}

/* ---------- Drawer markup (injected on every page) ---------- */
const cartHost = document.createElement('div');
cartHost.innerHTML = `
  <div class="cart-overlay" id="cart-overlay"></div>
  <aside class="cart-drawer" id="cart-drawer" aria-label="Shopping cart">
    <div class="cart-head">
      <h3>Your Order</h3>
      <button class="cart-close" id="cart-close" aria-label="Close cart">×</button>
    </div>
    <div class="cart-items" id="cart-items"></div>
    <div class="cart-foot" id="cart-foot">
      <div class="cart-total">Total <strong id="cart-total">€0</strong></div>
      <div id="cart-actions">
        <button class="btn btn-solid" id="cart-place" type="button">Place order</button>
        <a class="btn btn-solid" id="cart-signin" href="account.html">Sign in to order online</a>
        <a class="btn btn-solid" id="cart-checkout-wa" target="_blank" rel="noopener">Checkout on WhatsApp</a>
        <a class="btn btn-solid" id="cart-checkout-ig" target="_blank" rel="noopener">Order via Instagram DM</a>
        <a class="btn" id="cart-checkout-email">Order by Email</a>
        <button class="btn" id="cart-copy" type="button">Copy order message</button>
        <p class="cart-note">We confirm every order personally and arrange payment &amp; delivery with you directly.</p>
      </div>
      <form id="cart-checkout" hidden>
        <label class="co-label">Phone<input id="co-phone" type="tel" maxlength="40" autocomplete="tel" placeholder="For delivery questions"></label>
        <label class="co-label">Delivery address<textarea id="co-address" rows="2" maxlength="400" required placeholder="Street, area, Dublin / Ireland"></textarea></label>
        <label class="co-label">Note <span class="co-opt">(optional)</span><textarea id="co-note" rows="2" maxlength="500" placeholder="Custom blend requests, preferred delivery time…"></textarea></label>
        <button class="btn btn-solid" type="submit" id="co-confirm">Confirm order</button>
        <button class="btn" type="button" id="co-back">Back</button>
        <p class="cart-err" id="co-err" hidden></p>
      </form>
    </div>
    <div class="cart-done" id="cart-done" hidden>
      <p class="cart-done-title">Thank you.</p>
      <p>Order <b id="cart-done-id"></b> received.<br>We confirm every order personally and arrange payment &amp; delivery with you directly.</p>
      <a class="btn btn-solid" href="account.html">View my orders</a>
      <button class="btn" id="cart-done-close" type="button">Close</button>
    </div>
  </aside>`;
document.body.append(...cartHost.children);

const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');

function openCart() {
  renderCartDrawer();
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
}

document.getElementById('cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
document.getElementById('cart-open')?.addEventListener('click', openCart);

function renderCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const count = Object.values(getCart()).reduce((a, b) => a + b, 0);
  badge.textContent = count;
  badge.classList.toggle('empty', count === 0);
}

function renderCartDrawer() {
  const itemsEl = document.getElementById('cart-items');
  const lines = cartLines();

  if (!lines.length) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.<br>Explore the collection to begin.</p>';
  } else {
    itemsEl.innerHTML = lines.map(l => `
      <div class="cart-item">
        <img src="${l.f.image}" alt="${l.f.name}">
        <div class="cart-item-info">
          <h4>${l.f.name}</h4>
          <div class="cart-item-meta">${l.label} · €${l.price} each</div>
          <div class="cart-item-row">
            <div class="qty-picker">
              <button data-cart-q="-1" data-cart-id="${l.key}" aria-label="Decrease">−</button>
              <span>${l.qty}</span>
              <button data-cart-q="1" data-cart-id="${l.key}" aria-label="Increase">+</button>
            </div>
            <span class="frag-price">€${l.price * l.qty}</span>
          </div>
        </div>
        <button class="cart-remove" data-cart-remove="${l.key}" aria-label="Remove ${l.f.name}">✕</button>
      </div>`).join('');
  }

  document.getElementById('cart-total').textContent = '€' + cartTotal(lines);
  document.getElementById('cart-foot').style.display = lines.length ? '' : 'none';

  /* Only offer checkout channels that are actually configured.
     Online ordering (account required) leads when the shop API is set up;
     Instagram DM (plus a copyable order message) covers the gap until
     WhatsApp/email are set in the Studio. */
  if (typeof CONTACT !== 'undefined' && lines.length) {
    const msg = orderMessage();
    const place = document.getElementById('cart-place');
    const signin = document.getElementById('cart-signin');
    const wa = document.getElementById('cart-checkout-wa');
    const ig = document.getElementById('cart-checkout-ig');
    const em = document.getElementById('cart-checkout-email');
    const cp = document.getElementById('cart-copy');
    const acct = window.OH_ACCOUNT;
    const canApi = !!(acct && acct.API);
    const signedIn = canApi && !!acct.getAuth();
    place.style.display = signedIn ? '' : 'none';
    signin.style.display = (canApi && !signedIn) ? '' : 'none';
    const hasWa = !!CONTACT.whatsapp, hasEm = !!CONTACT.email, hasIg = !!CONTACT.instagram;
    wa.style.display = hasWa ? '' : 'none';
    em.style.display = hasEm ? '' : 'none';
    ig.style.display = (!hasWa && hasIg) ? '' : 'none';
    cp.style.display = (!hasWa && hasIg) ? '' : 'none';
    if (hasWa) wa.href = CONTACT.whatsapp + '?text=' + encodeURIComponent(msg);
    if (hasEm) em.href = 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent('Order — Oud House') + '&body=' + encodeURIComponent(msg);
    if (hasIg) ig.href = CONTACT.instagram;
  }
}

/* ---------- online checkout (signed-in customers, shop API) ---------- */
(function () {
  const drawer = document.getElementById('cart-drawer');
  const actions = () => document.getElementById('cart-actions');
  const form = document.getElementById('cart-checkout');
  const done = document.getElementById('cart-done');
  if (!drawer || !form) return;

  document.getElementById('cart-place').addEventListener('click', () => {
    actions().hidden = true;
    form.hidden = false;
    document.getElementById('co-address').focus();
  });
  document.getElementById('co-back').addEventListener('click', () => {
    form.hidden = true;
    actions().hidden = false;
  });
  document.getElementById('cart-done-close').addEventListener('click', () => {
    done.hidden = true;
    drawer.classList.remove('done');
    closeCart();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const acct = window.OH_ACCOUNT;
    if (!acct || !acct.API) return;
    const errEl = document.getElementById('co-err');
    const btn = document.getElementById('co-confirm');
    errEl.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Placing order…';
    try {
      const order = await acct.shopApi('/shop/orders', { method: 'POST', body: {
        lines: cartLines().map(l => ({ id: l.f.id, fmtIdx: l.fi, qty: l.qty })),
        phone: document.getElementById('co-phone').value.trim(),
        address: document.getElementById('co-address').value.trim(),
        note: document.getElementById('co-note').value.trim(),
      } });
      setCart({});
      form.hidden = true;
      document.getElementById('cart-done-id').textContent = order.id;
      drawer.classList.add('done');
      done.hidden = false;
    } catch (err) {
      if (err.status === 401) {
        acct.setAuth(null);
        errEl.textContent = 'Your session expired — please sign in again from the Account page.';
      } else if (err.offline) {
        errEl.textContent = 'Our ordering service is unreachable right now — press Back and order through Instagram or WhatsApp instead.';
      } else {
        errEl.textContent = err.message;
      }
      errEl.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirm order';
    }
  });
})();

/* Copy the pre-typed order message (for Instagram DM checkout) */
document.addEventListener('click', e => {
  const btn = e.target.closest('#cart-copy');
  if (!btn) return;
  const done = () => {
    const prev = btn.textContent;
    btn.textContent = 'Copied — paste it in your DM';
    setTimeout(() => { btn.textContent = prev; }, 2200);
  };
  const msg = orderMessage();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).then(done).catch(() => fallbackCopy(msg, done));
  } else {
    fallbackCopy(msg, done);
  }
});

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch { /* nothing more we can do */ }
  ta.remove();
}

/* One delegated handler for every add / qty / remove button */
document.addEventListener('click', e => {
  const wishEl = e.target.closest('[data-wish]');
  if (wishEl) {
    e.preventDefault();
    e.stopPropagation();
    const on = toggleWish(wishEl.dataset.wish);
    wishEl.classList.toggle('on', on);
    wishEl.textContent = on ? '♥' : '♡';
    renderWishlist();
    return;
  }
  const addEl = e.target.closest('[data-add]');
  if (addEl) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(addEl.dataset.add, 0, 1);
    openCart();
    return;
  }
  const qtyEl = e.target.closest('[data-cart-q]');
  if (qtyEl) {
    const cart = getCart();
    const id = qtyEl.dataset.cartId;
    cart[id] = (cart[id] || 0) + Number(qtyEl.dataset.cartQ);
    if (cart[id] <= 0) delete cart[id];
    setCart(cart);
    return;
  }
  const removeEl = e.target.closest('[data-cart-remove]');
  if (removeEl) {
    const cart = getCart();
    delete cart[removeEl.dataset.cartRemove];
    setCart(cart);
  }
});

renderCartBadge();
renderCartDrawer();

/* ---------- Footer year ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
