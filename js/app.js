(() => {
  const CART_KEY = "eli_cart_v1";
  const WA = `https://wa.me/${STORE.whatsapp}`;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const money = (n) =>
    `KES ${Number(n || 0).toLocaleString("en-KE")}`;

  const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || id;

  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const setCart = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount();
    renderDrawer();
  };

  const cartCount = () => getCart().reduce((s, i) => s + i.qty, 0);
  const cartTotal = () => getCart().reduce((s, i) => s + i.price * i.qty, 0);

  function addToCart({ id, sizeId, qty = 1 }) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    const size = p.sizes.find((s) => s.id === sizeId) || p.sizes.find((s) => s.default) || p.sizes[0];
    const key = `${p.id}__${size.id}`;
    const cart = getCart();
    const existing = cart.find((i) => i.key === key);
    if (existing) existing.qty += qty;
    else
      cart.push({
        key,
        id: p.id,
        name: p.name,
        image: p.image,
        sizeId: size.id,
        sizeLabel: size.label,
        price: size.price,
        qty,
      });
    setCart(cart);
    toast(`${p.name} added to bag`);
    openDrawer();
  }

  function updateQty(key, qty) {
    let cart = getCart();
    if (qty < 1) cart = cart.filter((i) => i.key !== key);
    else cart = cart.map((i) => (i.key === key ? { ...i, qty } : i));
    setCart(cart);
  }

  function toast(msg) {
    let wrap = $(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }

  function icon(name) {
    const paths = {
      search: `<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>`,
      bag: `<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>`,
      menu: `<path d="M4 7h16M4 12h16M4 17h16"/>`,
      close: `<path d="M6 6l12 12M18 6L6 18"/>`,
      plus: `<path d="M12 5v14M5 12h14"/>`,
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
  }

  function waIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5A8.5 8.5 0 0 1 7.2 18.4L4 20l1.7-3.1A8.5 8.5 0 1 1 20 11.5zm-8.3 4.6c2.3 0 4.3-1.5 5-3.6.1-.4 0-.6-.4-.7l-1.5-.4c-.3-.1-.5 0-.6.3l-.2.5c-.1.2-.3.3-.5.2-1-.4-1.8-1.2-2.2-2.2-.1-.2 0-.4.2-.5l.5-.3c.3-.2.4-.4.3-.7l-.4-1.5c-.1-.3-.4-.4-.7-.3-2.1.7-3.6 2.7-3.6 5 0 .3 0 .7.1 1 .1.4.2.7.4 1.1.8 1.6 2.2 2.8 3.9 3.3.5.2 1 .2 1.5.2z"/></svg>`;
  }

  function productCard(p) {
    return `
      <article class="card">
        <a class="card__media" href="product.html?id=${p.id}">
          ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </a>
        <div class="card__body">
          <p class="card__cat">${catName(p.category)}</p>
          <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
          <div class="card__row">
            <p class="price">${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ""}</p>
            <button class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button>
          </div>
        </div>
      </article>`;
  }

  function renderHeader() {
    const el = $("#site-header");
    if (!el) return;
    const page = document.body.dataset.page;
    el.innerHTML = `
      <div class="announce" aria-hidden="true">
        <div class="announce__track">
          ${Array(2).fill(`
            <span>Karibu · Floor carpets &amp; mats</span>
            <span>Free Nairobi delivery over ${money(STORE.freeDeliveryFrom)}</span>
            <span>WhatsApp ${STORE.phoneDisplay}</span>
            <span>Pickup at Kamukunji Market</span>
            <span>M-Pesa or cash on confirmation</span>
          `).join("")}
        </div>
      </div>
      <header class="header">
        <div class="wrap header__bar">
          <button class="icon-btn menu-btn" data-open="nav" aria-label="Open menu">${icon("menu")}</button>
          <a class="logo" href="index.html">
            <span class="logo__mark">E</span>
            <span class="logo__text">
              <strong>ELI COLLECTION</strong>
              <small>KAMUKUNJI</small>
            </span>
          </a>
          <nav class="nav">
            <a href="index.html" class="${page === "home" ? "is-active" : ""}">Home</a>
            <a href="shop.html" class="${page === "shop" ? "is-active" : ""}">Shop</a>
            <a href="about.html" class="${page === "about" ? "is-active" : ""}">Our floor</a>
            <a href="contact.html" class="${page === "contact" ? "is-active" : ""}">Contact</a>
          </nav>
          <div class="header__tools">
            <button class="icon-btn" data-open="search" aria-label="Search">${icon("search")}</button>
            <button class="icon-btn" data-open="cart" aria-label="Open bag">
              ${icon("bag")}
              <span class="cart-count">0</span>
            </button>
          </div>
        </div>
      </header>`;
  }

  function renderFooter() {
    const el = $("#site-footer");
    if (!el) return;
    el.innerHTML = `
      <footer class="footer">
        <div class="wrap footer__grid">
          <div>
            <a class="logo" href="index.html">
              <span class="logo__mark">E</span>
              <span class="logo__text"><strong>ELI COLLECTION</strong><small>KAMUKUNJI</small></span>
            </a>
            <p style="margin-top:16px;max-width:36ch">Floor carpets and mats from the heart of Kamukunji Market — Persian rugs, prayer mats, door mats, runners and cut-to-size carpet.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              ${CATEGORIES.slice(0, 6).map((c) => `<li><a href="shop.html?cat=${c.id}">${c.name}</a></li>`).join("")}
            </ul>
          </div>
          <div>
            <h4>Visit</h4>
            <ul>
              <li>${STORE.address}</li>
              <li>${STORE.hours}</li>
              <li><a href="about.html">Our floor</a></li>
              <li><a href="contact.html">Map &amp; hours</a></li>
            </ul>
          </div>
          <div>
            <h4>Talk to us</h4>
            <ul>
              <li><a href="tel:${STORE.phoneLocal}">${STORE.phoneDisplay}</a></li>
              <li><a href="${WA}" target="_blank" rel="noopener">WhatsApp order desk</a></li>
              <li>Pickup or Nairobi delivery</li>
              <li>M-Pesa on confirmation</li>
            </ul>
            <a class="btn btn--wa" style="margin-top:14px" href="${WA}?text=${encodeURIComponent("Hello ELI COLLECTION KAMUKUNJI, I would like help choosing a carpet.")}" target="_blank" rel="noopener">Chat on WhatsApp</a>
          </div>
        </div>
        <div class="wrap footer__base">
          <span>© ${new Date().getFullYear()} ELI COLLECTION KAMUKUNJI</span>
          <span>Nairobi · Kenya</span>
        </div>
      </footer>
      <a class="wa-float" href="${WA}?text=${encodeURIComponent("Hello ELI COLLECTION KAMUKUNJI — I have a question about carpets and mats.")}" target="_blank" rel="noopener" aria-label="WhatsApp">${waIcon()}</a>
      <div class="overlay" data-overlay></div>
      <aside class="drawer" id="cart-drawer" aria-label="Shopping bag">
        <div class="drawer__head">
          <h2 class="display" style="font-size:1.8rem">Your bag</h2>
          <button class="icon-btn" data-close aria-label="Close">${icon("close")}</button>
        </div>
        <div class="drawer__body" id="drawer-body"></div>
        <div class="drawer__foot" id="drawer-foot"></div>
      </aside>
      <div class="search" id="search-panel">
        <div class="wrap">
          <div class="search__head">
            <p class="eyebrow">Search the floor</p>
            <button class="icon-btn" data-close aria-label="Close search">${icon("close")}</button>
          </div>
          <input type="search" id="search-input" placeholder="Try prayer mat, Persian, door mat…" autocomplete="off">
          <div class="search-results" id="search-results"></div>
        </div>
      </div>
      <nav class="mobile-nav" id="mobile-nav">
        <button class="icon-btn" data-close aria-label="Close menu">${icon("close")}</button>
        <a href="index.html">Home</a>
        <a href="shop.html">Shop</a>
        ${CATEGORIES.map((c) => `<a href="shop.html?cat=${c.id}" style="font-size:1.2rem">${c.name}</a>`).join("")}
        <a href="about.html">Our floor</a>
        <a href="contact.html">Contact</a>
      </nav>
    `;
  }

  function updateCartCount() {
    $$(".cart-count").forEach((el) => {
      el.textContent = cartCount();
    });
  }

  function renderDrawer() {
    const body = $("#drawer-body");
    const foot = $("#drawer-foot");
    if (!body || !foot) return;
    const cart = getCart();
    if (!cart.length) {
      body.innerHTML = `<div class="empty">Your bag is empty. The floor is not.</div>`;
      foot.innerHTML = `<a class="btn btn--primary btn--full" href="shop.html">Browse carpets</a>`;
      return;
    }
    body.innerHTML = cart
      .map(
        (i) => `
      <div class="line" style="grid-template-columns:72px 1fr;border:0;padding:10px 0">
        <img src="${i.image}" alt="">
        <div>
          <h3 style="font-size:1.15rem">${i.name}</h3>
          <p class="muted" style="font-size:.8rem">${i.sizeLabel}</p>
          <p>${money(i.price)}</p>
          <div class="qty" style="margin-top:8px">
            <button data-qty="${i.key}" data-d="-1">−</button>
            <span>${i.qty}</span>
            <button data-qty="${i.key}" data-d="1">+</button>
          </div>
        </div>
      </div>`
      )
      .join("");
    const sub = cartTotal();
    const delivery = sub >= STORE.freeDeliveryFrom ? 0 : STORE.nairobiFee;
    foot.innerHTML = `
      <div class="sum-row"><span>Subtotal</span><span>${money(sub)}</span></div>
      <a class="btn btn--primary btn--full" href="cart.html" style="margin-top:12px">Checkout</a>
      <a class="btn btn--ghost btn--full" href="shop.html" style="margin-top:8px">Continue shopping</a>
    `;
  }

  function openDrawer() {
    $("#cart-drawer")?.classList.add("is-open");
    $("[data-overlay]")?.classList.add("is-open");
  }
  function closeAll() {
    $$(".is-open").forEach((el) => {
      if (el.classList.contains("overlay") || el.classList.contains("drawer") || el.classList.contains("search") || el.classList.contains("mobile-nav")) {
        el.classList.remove("is-open");
      }
    });
    $("[data-overlay]")?.classList.remove("is-open");
  }

  function bindChrome() {
    document.body.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        e.preventDefault();
        addToCart({ id: add.dataset.add, qty: 1 });
      }
      const open = e.target.closest("[data-open]");
      if (open) {
        const what = open.dataset.open;
        if (what === "cart") openDrawer();
        if (what === "search") {
          $("#search-panel")?.classList.add("is-open");
          setTimeout(() => $("#search-input")?.focus(), 50);
        }
        if (what === "nav") {
          $("#mobile-nav")?.classList.add("is-open");
          $("[data-overlay]")?.classList.add("is-open");
        }
      }
      if (e.target.closest("[data-close]") || e.target.matches("[data-overlay]")) closeAll();
      const q = e.target.closest("[data-qty]");
      if (q) {
        const item = getCart().find((i) => i.key === q.dataset.qty);
        if (item) updateQty(item.key, item.qty + Number(q.dataset.d));
        if (document.body.dataset.page === "cart") renderCartPage();
      }
      const rm = e.target.closest("[data-remove]");
      if (rm) {
        updateQty(rm.dataset.remove, 0);
        if (document.body.dataset.page === "cart") renderCartPage();
      }
    });

    $("#search-input")?.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      const box = $("#search-results");
      if (!q) {
        box.innerHTML = "";
        return;
      }
      const hits = PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          catName(p.category).toLowerCase().includes(q)
      ).slice(0, 8);
      box.innerHTML = hits.length
        ? hits
            .map(
              (p) => `
          <a class="search-hit" href="product.html?id=${p.id}">
            <img src="${p.image}" alt="">
            <div><strong>${p.name}</strong><div class="muted">${catName(p.category)}</div></div>
            <span>${money(p.price)}</span>
          </a>`
            )
            .join("")
        : `<p class="muted">Nothing on the floor matches “${q}”.</p>`;
    });
  }

  function renderHome() {
    const root = $("#home-app");
    if (!root) return;
    const featured = PRODUCTS.filter((p) => p.featured);
    root.innerHTML = `
      <section class="hero">
        <img class="hero__img" src="assets/images/hero.jpg" alt="ELI COLLECTION KAMUKUNJI carpet showroom">
        <div class="hero__shade"></div>
        <div class="wrap hero__content">
          <p class="eyebrow" style="color:var(--gold-soft)">Kamukunji · Nairobi</p>
          <h1>Floors worth coming home to.</h1>
          <p class="lead">Persian rugs, prayer mats, door mats and cut-to-size carpet — chosen on the floor of Kamukunji Market, sent across Nairobi.</p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="shop.html">Shop the collection</a>
            <a class="btn btn--ghost" href="${WA}?text=${encodeURIComponent("Hello ELI COLLECTION, I would like to see what you have in stock today.")}" target="_blank" rel="noopener">WhatsApp ${STORE.phoneDisplay}</a>
          </div>
        </div>
      </section>
      <div class="stats">
        <div class="stat"><b>16+</b><span>Pieces on the floor</span></div>
        <div class="stat"><b>Cut</b><span>Carpet from the roll</span></div>
        <div class="stat"><b>Nairobi</b><span>Delivery &amp; pickup</span></div>
        <div class="stat"><b>${STORE.phoneDisplay}</b><span>WhatsApp desk</span></div>
      </div>
      <section class="section">
        <div class="wrap">
          <div class="section__head">
            <div>
              <p class="eyebrow">Departments</p>
              <h2>What we deal in</h2>
            </div>
            <p>Floor carpets and mats only — no filler, no fashion that does not belong on a Kenyan floor.</p>
          </div>
          <div class="cats">
            ${CATEGORIES.map(
              (c) => `
              <a class="cat" href="shop.html?cat=${c.id}">
                <img src="${c.image}" alt="${c.name}">
                <div class="cat__txt"><h3>${c.name}</h3><p>${c.blurb}</p></div>
              </a>`
            ).join("")}
          </div>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="section__head">
            <div>
              <p class="eyebrow">On the floor now</p>
              <h2>Chosen pieces</h2>
            </div>
            <a class="btn btn--ghost" href="shop.html">View all</a>
          </div>
          <div class="grid">${featured.map(productCard).join("")}</div>
        </div>
      </section>
      <section class="split">
        <img src="assets/images/about-store.jpg" alt="Inside ELI COLLECTION at Kamukunji">
        <div class="split__copy">
          <p class="eyebrow" style="color:var(--gold)">Our floor</p>
          <h2>A Kamukunji yard with a showroom finish.</h2>
          <p>We buy, cut and sell carpets the way this market always has — rolls standing at the back, mats folded on timber benches, prayer rugs stacked by Friday demand.</p>
          <p>Walk in, stand on the piece, take it the same day. Or send a room photo on WhatsApp and we will size it for you.</p>
          <a class="btn btn--ghost" href="about.html">Read the story</a>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <div class="section__head">
            <div>
              <p class="eyebrow">Why ELI</p>
              <h2>Honest trade</h2>
            </div>
          </div>
          <div class="benefits">
            <article class="benefit"><div class="num">01</div><h3>See it, feel it</h3><p>Every piece on this site is the sort of stock we keep on the Kamukunji floor. Come stand on it.</p></article>
            <article class="benefit"><div class="num">02</div><h3>Sized for Kenya</h3><p>We cut broadloom to your room and keep living-room, hallway and prayer sizes that actually fit Nairobi houses.</p></article>
            <article class="benefit"><div class="num">03</div><h3>Delivery that works</h3><p>Pickup at the market, Nairobi drop-off, or a courier quote upcountry — arranged on WhatsApp.</p></article>
            <article class="benefit"><div class="num">04</div><h3>Pay the Kenyan way</h3><p>Confirm on WhatsApp, then M-Pesa or cash. No surprise till numbers in a checkout you cannot trust.</p></article>
          </div>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="section__head">
            <div>
              <p class="eyebrow">From the books</p>
              <h2>Customers, in their words</h2>
            </div>
          </div>
          <div class="quotes">
            ${TESTIMONIALS.map(
              (t) => `<blockquote class="quote"><p>“${t.quote}”</p><b>${t.name}</b><span>${t.place}</span></blockquote>`
            ).join("")}
          </div>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="section__head">
            <div>
              <p class="eyebrow">The yard</p>
              <h2>From the shop floor</h2>
            </div>
            <a class="btn btn--ghost" href="contact.html">Find us</a>
          </div>
          <div class="mosaic">
            <a href="shop.html"><img src="assets/images/hero.jpg" alt="Showroom"></a>
            <a href="shop.html?cat=shag"><img src="assets/images/folded-mats.jpg" alt="Folded mats"></a>
            <a href="shop.html?cat=prayer"><img src="assets/images/prayer-alnoor.jpg" alt="Prayer mat"></a>
            <a href="shop.html?cat=door"><img src="assets/images/doormat-coir.jpg" alt="Door mat"></a>
            <a href="shop.html?cat=modern"><img src="assets/images/rolled-carpets.jpg" alt="Rolled carpets"></a>
          </div>
        </div>
      </section>
    `;
  }

  function renderShop() {
    const root = $("#shop-app");
    if (!root) return;
    const params = new URLSearchParams(location.search);
    let cat = params.get("cat") || "all";
    let sort = params.get("sort") || "featured";
    const q = (params.get("q") || "").toLowerCase();

    const apply = () => {
      let list = PRODUCTS.slice();
      if (cat !== "all") list = list.filter((p) => p.category === cat);
      if (q) list = list.filter((p) => (p.name + p.summary + p.category).toLowerCase().includes(q));
      if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
      if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
      if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
      $("#product-grid").innerHTML = list.length
        ? list.map(productCard).join("")
        : `<div class="empty" style="grid-column:1/-1">No pieces in this filter. <a href="shop.html">Clear</a></div>`;
      $("#shop-count").textContent = `${list.length} piece${list.length === 1 ? "" : "s"}`;
      $$("[data-cat]").forEach((b) => b.classList.toggle("is-active", b.dataset.cat === cat));
    };

    root.innerHTML = `
      <div class="wrap page-hero">
        <p class="eyebrow">The collection</p>
        <h1>Shop carpets &amp; mats</h1>
        <p class="muted" style="margin-top:8px;max-width:48ch">Filter by department. Sizes and final prices confirm on the product — or WhatsApp us a room photo.</p>
      </div>
      <div class="wrap shop-layout" style="padding-bottom:80px">
        <aside class="filters">
          <h3>Department</h3>
          <button class="filter-btn" data-cat="all">All pieces</button>
          ${CATEGORIES.map((c) => `<button class="filter-btn" data-cat="${c.id}">${c.name}</button>`).join("")}
        </aside>
        <div>
          <div class="shop-toolbar">
            <p class="muted" id="shop-count"></p>
            <select class="nice" id="sort">
              <option value="featured">Featured</option>
              <option value="price-asc">Price · low to high</option>
              <option value="price-desc">Price · high to low</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div class="grid" id="product-grid"></div>
        </div>
      </div>
    `;
    $("#sort").value = sort;
    $("#sort").addEventListener("change", (e) => {
      sort = e.target.value;
      apply();
    });
    $$("[data-cat]").forEach((b) =>
      b.addEventListener("click", () => {
        cat = b.dataset.cat;
        history.replaceState({}, "", cat === "all" ? "shop.html" : `shop.html?cat=${cat}`);
        apply();
      })
    );
    apply();
  }

  function renderProduct() {
    const root = $("#product-app");
    if (!root) return;
    const id = new URLSearchParams(location.search).get("id");
    const p = PRODUCTS.find((x) => x.id === id) || PRODUCTS[0];
    document.title = `${p.name} · ELI COLLECTION KAMUKUNJI`;
    let size = p.sizes.find((s) => s.default) || p.sizes[0];
    let qty = 1;
    let img = p.image;
    let tab = "story";

    const paint = () => {
      const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
      root.innerHTML = `
        <div class="wrap pdp">
          <div class="gallery">
            <div class="gallery__main"><img src="${img}" alt="${p.name}"></div>
            <div class="thumbs">
              ${p.images
                .map(
                  (src) =>
                    `<button class="${src === img ? "is-active" : ""}" data-img="${src}"><img src="${src}" alt=""></button>`
                )
                .join("")}
            </div>
          </div>
          <div class="pdp__info">
            <p class="eyebrow">${catName(p.category)}</p>
            <h1>${p.name}</h1>
            <p class="pdp__price price">${money(size.price)}${p.compareAt && size.default ? `<s>${money(p.compareAt)}</s>` : ""}</p>
            <p class="lead">${p.summary}</p>
            <p class="eyebrow">Size</p>
            <div class="size-row">
              ${p.sizes
                .map(
                  (s) =>
                    `<button class="${s.id === size.id ? "is-active" : ""}" data-size="${s.id}">${s.label} · ${money(s.price)}</button>`
                )
                .join("")}
            </div>
            <p class="eyebrow">Quantity</p>
            <div class="qty-row">
              <div class="qty">
                <button data-dq="-1">−</button>
                <span>${qty}</span>
                <button data-dq="1">+</button>
              </div>
              <span class="muted" style="align-self:center">${p.stock} on the floor</span>
            </div>
            <div class="pdp__actions">
              <button class="btn btn--primary" id="add-pdp">Add to bag</button>
              <a class="btn btn--wa" target="_blank" rel="noopener" href="${WA}?text=${encodeURIComponent(
                `Hello ELI COLLECTION KAMUKUNJI, I am interested in the ${p.name} (${size.label}) at ${money(size.price)}. Is it available?`
              )}">Ask on WhatsApp</a>
            </div>
            <div class="meta-list">
              <div><b>Material</b> — ${p.material}</div>
              <div><b>Pile</b> — ${p.pile}</div>
              <div><b>Origin</b> — ${p.origin}</div>
              <div><b>Colours</b> — ${p.colors.join(" · ")}</div>
            </div>
            <div class="tabs">
              <button data-tab="story" class="${tab === "story" ? "is-active" : ""}">The piece</button>
              <button data-tab="care" class="${tab === "care" ? "is-active" : ""}">Care</button>
              <button data-tab="ship" class="${tab === "ship" ? "is-active" : ""}">Delivery</button>
            </div>
            <div class="tab-panel">
              ${
                tab === "story"
                  ? p.description
                  : tab === "care"
                  ? p.care
                  : `Pickup at Kamukunji Market is free. Nairobi delivery is ${money(
                      STORE.nairobiFee
                    )}, or free on orders over ${money(
                      STORE.freeDeliveryFrom
                    )}. Upcountry goes by courier — we quote on WhatsApp after you share a location. Confirm stock, then pay by M-Pesa or cash.`
              }
            </div>
          </div>
        </div>
        <div class="wrap" style="padding-bottom:80px">
          <div class="section__head"><div><p class="eyebrow">More from this department</p><h2>Related</h2></div></div>
          <div class="grid">${(related.length ? related : PRODUCTS.slice(0, 4)).map(productCard).join("")}</div>
        </div>
      `;
      $$("[data-img]").forEach((b) =>
        b.addEventListener("click", () => {
          img = b.dataset.img;
          paint();
        })
      );
      $$("[data-size]").forEach((b) =>
        b.addEventListener("click", () => {
          size = p.sizes.find((s) => s.id === b.dataset.size);
          paint();
        })
      );
      $$("[data-dq]").forEach((b) =>
        b.addEventListener("click", () => {
          qty = Math.max(1, qty + Number(b.dataset.dq));
          paint();
        })
      );
      $$("[data-tab]").forEach((b) =>
        b.addEventListener("click", () => {
          tab = b.dataset.tab;
          paint();
        })
      );
      $("#add-pdp")?.addEventListener("click", () => addToCart({ id: p.id, sizeId: size.id, qty }));
    };
    paint();
  }

  function deliveryFee(sub) {
    return sub >= STORE.freeDeliveryFrom ? 0 : STORE.nairobiFee;
  }

  function orderMessage(form) {
    const cart = getCart();
    const lines = cart
      .map((i) => `• ${i.qty} × ${i.name} (${i.sizeLabel}) — ${money(i.price * i.qty)}`)
      .join("\n");
    const sub = cartTotal();
    const del = form.fulfillment === "pickup" ? 0 : deliveryFee(sub);
    return `*ELI COLLECTION KAMUKUNJI — NEW ORDER*

${lines}

Subtotal: ${money(sub)}
${form.fulfillment === "pickup" ? "Pickup: Kamukunji Market (free)" : `Nairobi delivery: ${del ? money(del) : "FREE"}`}
*Total: ${money(sub + del)}*

Name: ${form.name}
Phone: ${form.phone}
${form.fulfillment === "pickup" ? "Fulfillment: Pickup" : `Deliver to: ${form.location}`}
Payment: ${form.pay}
${form.notes ? `Notes: ${form.notes}` : ""}

Please confirm stock and payment (M-Pesa / cash).`;
  }

  function renderCartPage() {
    const root = $("#cart-app");
    if (!root) return;
    const cart = getCart();
    const sub = cartTotal();
    const del = deliveryFee(sub);

    if (!cart.length) {
      root.innerHTML = `
        <div class="wrap page-hero" style="padding-bottom:80px;text-align:center">
          <p class="eyebrow">Bag</p>
          <h1>Nothing in the bag yet</h1>
          <p class="muted" style="margin:12px auto 22px;max-width:40ch">The showroom is full. Persian rugs, prayer mats, door mats — start with a department.</p>
          <a class="btn btn--primary" href="shop.html">Shop the collection</a>
        </div>`;
      return;
    }

    root.innerHTML = `
      <div class="wrap page-hero">
        <p class="eyebrow">Bag</p>
        <h1>Review &amp; WhatsApp checkout</h1>
      </div>
      <div class="wrap cart-page">
        <div>
          ${cart
            .map(
              (i) => `
            <div class="line">
              <img src="${i.image}" alt="${i.name}">
              <div>
                <h3>${i.name}</h3>
                <p class="muted">${i.sizeLabel}</p>
                <div class="qty" style="margin-top:8px">
                  <button data-qty="${i.key}" data-d="-1">−</button>
                  <span>${i.qty}</span>
                  <button data-qty="${i.key}" data-d="1">+</button>
                </div>
                <button class="remove" data-remove="${i.key}">Remove</button>
              </div>
              <div class="line__price"><b>${money(i.price * i.qty)}</b></div>
            </div>`
            )
            .join("")}
        </div>
        <aside class="summary">
          <h2>Order</h2>
          <div class="sum-row"><span>Subtotal</span><b>${money(sub)}</b></div>
          <div class="sum-row"><span>Nairobi delivery</span><b>${sub >= STORE.freeDeliveryFrom ? "FREE" : money(del)}</b></div>
          <div class="sum-row total"><span>Total</span><span>${money(sub + del)}</span></div>
          <p class="note">Checkout sends this order to our WhatsApp desk (${STORE.phoneDisplay}). We confirm stock, then you pay by M-Pesa or cash.</p>
          <form id="order-form">
            <div class="field"><label>Full name</label><input name="name" required placeholder="Your name"></div>
            <div class="field"><label>Phone</label><input name="phone" required placeholder="07xx xxx xxx"></div>
            <div class="field">
              <label>Fulfillment</label>
              <select name="fulfillment">
                <option value="delivery">Deliver in Nairobi</option>
                <option value="pickup">Pickup at Kamukunji</option>
              </select>
            </div>
            <div class="field" id="loc-field"><label>Estate / location</label><input name="location" placeholder="e.g. South B, Nairobi"></div>
            <div class="field">
              <label>Payment</label>
              <select name="pay">
                <option>M-Pesa on confirmation</option>
                <option>Cash on delivery / pickup</option>
              </select>
            </div>
            <div class="field"><label>Notes</label><textarea name="notes" rows="3" placeholder="Room size, colour preference, landmark…"></textarea></div>
            <button class="btn btn--wa btn--full" type="submit">Send order on WhatsApp</button>
          </form>
        </aside>
      </div>
    `;
    const form = $("#order-form");
    form.fulfillment.addEventListener("change", () => {
      $("#loc-field").style.display = form.fulfillment.value === "pickup" ? "none" : "grid";
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const msg = orderMessage(data);
      window.open(`${WA}?text=${encodeURIComponent(msg)}`, "_blank");
      toast("Opening WhatsApp with your order");
    });
  }

  function renderAbout() {
    const root = $("#about-app");
    if (!root) return;
    root.innerHTML = `
      <div class="wrap page-hero">
        <p class="eyebrow">Our floor</p>
        <h1>ELI COLLECTION, Kamukunji.</h1>
      </div>
      <div class="wrap about-grid" style="padding-bottom:72px">
        <img src="assets/images/about-store.jpg" alt="Inside the Kamukunji carpet yard">
        <div class="about-copy">
          <p>We deal in floor carpets and mats. That is the whole sentence. Persian and oriental rugs for sitting rooms, kilims and tribal weaves, shag for bedrooms, prayer mats for home and musalla, coir for the door, foam for the bath, runners for the cooker line, and broadloom cut from the roll when a room needs wall-to-wall.</p>
          <p>Kamukunji is where Nairobi still bargains with its hands. Our yard keeps that — rolls at the back, benches of folded mats, a gallery of hanging runners — and we finish it so you can choose without shouting over the aisle.</p>
          <p>Send a WhatsApp to <a href="${WA}" target="_blank" rel="noopener"><b>${STORE.phoneDisplay}</b></a>. Tell us the room. We will tell you the size, the fibre, and whether it is on the floor today.</p>
          <p class="muted">${STORE.hours}<br>${STORE.address}</p>
          <a class="btn btn--primary" href="shop.html">Browse the collection</a>
        </div>
      </div>
    `;
  }

  function renderContact() {
    const root = $("#contact-app");
    if (!root) return;
    root.innerHTML = `
      <div class="wrap page-hero">
        <p class="eyebrow">Kamukunji, Nairobi</p>
        <h1>Come stand on it.</h1>
      </div>
      <div class="wrap contact-grid">
        <div>
          <p class="muted" style="margin-bottom:22px">The fastest way to buy is WhatsApp. The best way to choose is to visit the floor.</p>
          <div class="benefit" style="margin-bottom:14px">
            <h3>WhatsApp / call</h3>
            <p><a href="tel:${STORE.phoneLocal}"><b>${STORE.phoneDisplay}</b></a></p>
            <p><a href="${WA}" target="_blank" rel="noopener">wa.me/${STORE.whatsapp}</a></p>
          </div>
          <div class="benefit" style="margin-bottom:14px">
            <h3>Yard</h3>
            <p>${STORE.address}</p>
            <p>${STORE.hours}</p>
          </div>
          <div class="benefit">
            <h3>How orders work</h3>
            <p>Add pieces to your bag, send the order on WhatsApp, we confirm stock, you pay M-Pesa or cash, we pack for pickup or Nairobi delivery.</p>
          </div>
          <a class="btn btn--wa" style="margin-top:22px" href="${WA}?text=${encodeURIComponent("Hello ELI COLLECTION KAMUKUNJI, I would like directions / to check stock.")}" target="_blank" rel="noopener">Message the desk</a>
        </div>
        <iframe class="map" title="Kamukunji Market map" src="https://maps.google.com/maps?q=Kamukunji%20Market%20Nairobi&t=&z=15&ie=UTF8&iwloc=&output=embed"></iframe>
      </div>
    `;
  }

  renderHeader();
  renderFooter();
  bindChrome();
  updateCartCount();
  renderDrawer();

  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "shop") renderShop();
  if (page === "product") renderProduct();
  if (page === "cart") renderCartPage();
  if (page === "about") renderAbout();
  if (page === "contact") renderContact();
})();
