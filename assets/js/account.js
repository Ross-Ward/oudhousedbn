/* ============================================================
   OUD HOUSE — customer accounts (talks to the Oud House Studio
   /shop API when CONTACT.apiBase is configured; degrades to a
   friendly notice when it isn't, or when the service is offline)
   ============================================================ */

(function () {
  const API = (typeof CONTACT !== 'undefined' && CONTACT.apiBase)
    ? String(CONTACT.apiBase).replace(/\/+$/, '') : '';
  const AUTH_KEY = 'oudhouse_auth';

  function getAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; } catch { return null; }
  }
  function setAuth(a) {
    try { a ? localStorage.setItem(AUTH_KEY, JSON.stringify(a)) : localStorage.removeItem(AUTH_KEY); } catch { /* private mode */ }
  }

  async function shopApi(path, opts = {}) {
    if (!API) { const e = new Error('offline'); e.offline = true; throw e; }
    const auth = getAuth();
    let res;
    try {
      res = await fetch(API + path, {
        method: opts.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1',
          ...(auth && auth.token ? { Authorization: 'Bearer ' + auth.token } : {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    } catch { const e = new Error('offline'); e.offline = true; throw e; }
    let data = null;
    try { data = await res.json(); } catch { const e = new Error('offline'); e.offline = true; throw e; }
    if (!res.ok) {
      const e = new Error((data && data.error) || 'Something went wrong — please try again.');
      e.status = res.status;
      throw e;
    }
    return data;
  }

  /* main.js (cart checkout) uses this */
  window.OH_ACCOUNT = { API, getAuth, setAuth, shopApi };

  /* ---------- account page ---------- */
  const root = document.getElementById('acct-root');
  if (!root) return;
  const titleEl = document.getElementById('acct-title');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function offlineNotice(headline) {
    if (titleEl) titleEl.textContent = 'Your Account';
    root.innerHTML = `
      <div class="acct-card">
        <p>${esc(headline)}</p>
        <p class="acct-sub">You can still browse the collection and order directly through Instagram${(typeof CONTACT !== 'undefined' && CONTACT.whatsapp) ? ' or WhatsApp' : ''} — we confirm every order personally.</p>
        <div class="acct-actions">
          <a class="btn btn-solid" href="fragrances.html">Browse fragrances</a>
          <a class="btn" href="index.html#contact">Contact us</a>
        </div>
      </div>`;
  }

  function authView(mode, msg, prefillEmail) {
    if (titleEl) titleEl.textContent = mode === 'register' ? 'Create your account' : 'Sign in';
    root.innerHTML = `
      <div class="acct-card">
        <div class="acct-tabs">
          <button type="button" class="acct-tab${mode === 'login' ? ' on' : ''}" data-mode="login">Sign in</button>
          <button type="button" class="acct-tab${mode === 'register' ? ' on' : ''}" data-mode="register">Create account</button>
        </div>
        ${msg ? `<p class="acct-msg">${esc(msg)}</p>` : ''}
        <form class="acct-form" id="acct-form">
          ${mode === 'register' ? '<label>Your name<input name="name" required maxlength="80" autocomplete="name"></label>' : ''}
          <label>Email<input name="email" type="email" required maxlength="120" autocomplete="email" value="${esc(prefillEmail || '')}"></label>
          <label>Password${mode === 'register' ? ' <span class="acct-hint">(at least 8 characters)</span>' : ''}<input name="pass" type="password" required minlength="8" autocomplete="${mode === 'register' ? 'new-password' : 'current-password'}"></label>
          <button class="btn btn-solid" type="submit">${mode === 'register' ? 'Create account' : 'Sign in'}</button>
          <p class="acct-err" id="acct-err" hidden></p>
        </form>
        <p class="acct-sub">Your account keeps your orders in one place. We never share your details.</p>
      </div>`;
    root.querySelectorAll('.acct-tab').forEach(t =>
      t.addEventListener('click', () => authView(t.dataset.mode, '', '')));
    document.getElementById('acct-form').addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target;
      const errEl = document.getElementById('acct-err');
      const btn = f.querySelector('button[type="submit"]');
      btn.disabled = true;
      errEl.hidden = true;
      try {
        const body = { email: f.email.value.trim(), pass: f.pass.value };
        if (mode === 'register') body.name = f.name.value.trim();
        const r = await shopApi(mode === 'register' ? '/shop/register' : '/shop/login', { method: 'POST', body });
        setAuth({ token: r.token, name: r.name, email: r.email });
        ordersView();
      } catch (err) {
        if (err.offline) { offlineNotice('Our online ordering service is not reachable right now.'); return; }
        errEl.textContent = err.message;
        errEl.hidden = false;
        btn.disabled = false;
      }
    });
  }

  const STATUS_LABELS = {
    new: 'Received', confirmed: 'Confirmed', dispatched: 'On its way', done: 'Delivered', cancelled: 'Cancelled',
  };
  const fmtDate = ms => new Date(ms).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });

  async function ordersView() {
    const auth = getAuth();
    if (titleEl) titleEl.textContent = 'My Orders';
    root.innerHTML = '<div class="acct-card"><p class="acct-sub">Loading your orders…</p></div>';
    let data;
    try {
      data = await shopApi('/shop/orders');
    } catch (err) {
      if (err.status === 401) { setAuth(null); authView('login', 'Your session expired — please sign in again.', auth && auth.email); return; }
      if (err.offline) { offlineNotice('Our online ordering service is not reachable right now, so orders can\'t be shown.'); return; }
      root.innerHTML = `<div class="acct-card"><p class="acct-err">${esc(err.message)}</p></div>`;
      return;
    }
    const orders = data.orders || [];
    const orderCard = o => `
      <div class="order-card">
        <div class="order-head">
          <b>${esc(o.id)}</b>
          <span class="order-date">${fmtDate(o.createdAt)}</span>
          <span class="order-status ${esc(o.status)}">${esc(STATUS_LABELS[o.status] || o.status)}</span>
        </div>
        <div class="order-lines">
          ${o.lines.map(l => `<div class="order-line"><span>${l.qty} × ${esc(l.name)} <span class="order-fmt">${esc(l.fmtLabel)}</span></span><span>€${l.priceEUR * l.qty}</span></div>`).join('')}
        </div>
        <div class="order-total">Total <b>€${o.totalEUR}</b></div>
      </div>`;
    root.innerHTML = `
      <div class="acct-bar">
        <span>Signed in as <b>${esc(auth && auth.name)}</b> <span class="acct-hint">${esc(auth && auth.email)}</span></span>
        <button class="btn" id="acct-out" type="button">Sign out</button>
      </div>
      ${orders.length
        ? `<div class="order-list">${orders.map(orderCard).join('')}</div>`
        : `<div class="acct-card"><p>No orders yet.</p><p class="acct-sub">Add oils to your cart and place your first order — it will appear here with its status.</p>
           <div class="acct-actions"><a class="btn btn-solid" href="fragrances.html">Browse fragrances</a></div></div>`}`;
    document.getElementById('acct-out').addEventListener('click', () => { setAuth(null); authView('login', '', ''); });
  }

  if (!API) offlineNotice('Online accounts are coming soon.');
  else if (getAuth()) ordersView();
  else authView('login', '', '');
})();
