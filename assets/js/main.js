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
  const chipEls = document.querySelectorAll('.chip[data-family]');
  let activeFamily = 'All';

  function render() {
    const q = (searchEl?.value || '').trim().toLowerCase();
    const list = FRAGRANCES.filter(f => {
      const inFamily = activeFamily === 'All' || f.family === activeFamily;
      const haystack = [f.name, f.family, f.inspiredBy || '', ...f.notes.top, ...f.notes.heart, ...f.notes.base].join(' ').toLowerCase();
      return inFamily && haystack.includes(q);
    });
    gridEl.innerHTML = list.length
      ? list.map(fragCard).join('')
      : '<p class="no-results">No fragrances match your search — try a different note or family.</p>';
  }

  chipEls.forEach(chip => chip.addEventListener('click', () => {
    chipEls.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFamily = chip.dataset.family;
    render();
  }));

  searchEl?.addEventListener('input', render);
  render();
}

/* ---------- Featured strip on home page ---------- */
const featuredEl = document.getElementById('featured-grid');
if (featuredEl && typeof FRAGRANCES !== 'undefined') {
  const featured = FRAGRANCES.filter(f => f.featured);
  featuredEl.innerHTML = (featured.length ? featured : FRAGRANCES).slice(0, 4).map(fragCard).join('');
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

const WEAR_META = [
  { key: 'winter', label: 'Winter', icon: '❄️', color: '#7ec8e3' },
  { key: 'spring', label: 'Spring', icon: '🌿', color: '#8bc34a' },
  { key: 'summer', label: 'Summer', icon: '⛱️', color: '#f08080' },
  { key: 'fall',   label: 'Fall',   icon: '🍂', color: '#e8c48a' },
  { key: 'day',    label: 'Day',    icon: '☀️', color: '#f5a623' },
  { key: 'night',  label: 'Night',  icon: '🌙', color: '#9db8f0' }
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
            <div class="wear-icon">${m.icon}</div>
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
}

/* ---------- Contact links ---------- */
if (typeof CONTACT !== 'undefined') {
  document.querySelectorAll('[data-contact]').forEach(el => {
    const key = el.dataset.contact;
    if (key === 'email') el.href = 'mailto:' + CONTACT.email;
    else if (CONTACT[key]) el.href = CONTACT[key];
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
    return { key, f, qty, price: ft ? ft.priceEUR : (f.priceEUR || 0), label: ft ? (ft.type + ' ' + ft.size) : (f.size + ' ' + f.type) };
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
      <a class="btn btn-solid" id="cart-checkout-wa" target="_blank" rel="noopener">Checkout on WhatsApp</a>
      <a class="btn" id="cart-checkout-email">Order by Email</a>
      <p class="cart-note">We confirm every order personally and arrange payment &amp; delivery with you directly.</p>
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

  if (typeof CONTACT !== 'undefined' && lines.length) {
    const msg = orderMessage();
    document.getElementById('cart-checkout-wa').href = CONTACT.whatsapp + '?text=' + encodeURIComponent(msg);
    document.getElementById('cart-checkout-email').href =
      'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent('Order — Oud House') + '&body=' + encodeURIComponent(msg);
  }
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
