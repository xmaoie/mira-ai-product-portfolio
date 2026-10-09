/* ============================================================
   IKEA Lighting · 手机屏 Demo
   - 入口 PLP：直接铺满用户提供的截图
   - 点击右下角 FAB 进入「灯光实景对比」视图（2 列网格）
   - 状态：mode = day | night；light = on | off
   - Day → 官图；Night → nightOn / nightOff；整页 .app.night 变暗
   ============================================================ */
(function () {
  'use strict';

  var PRODUCTS = window.LIGHTING_PRODUCTS || [];
  /* 16 款已审核通过的产品数据。 */
  /*
    {
      slug: 'barlast',
      name: 'BARLAST 巴勒思',
      desc: '落地灯，150 厘米',
      price: 49.99,
      day: 'assets/barlast/barlast-floor-lamp-black-white__0957677_pe805131_s5.jpg',
      nightOn: 'assets/barlast/barlast-night-on.png',
      nightOff: 'assets/barlast/barlast-night-off.png'
    },
    {
      slug: 'isjakt',
      name: 'ISJAKT 伊思雅',
      desc: 'LED 落地灯/阅读灯，180 厘米',
      price: 499,
      day: 'assets/isjakt/isjakt-led-floor-uplighter-reading-lamp-dimmable-nickel-plated__1012273_pe828818_s5.jpg',
      nightOn: 'assets/isjakt/isjakt-night-on.png',
      nightOff: 'assets/isjakt/isjakt-night-off.png'
    },
    {
      slug: 'nymane',
      name: 'NYMÅNE 纽墨奈',
      desc: '落地灯/阅读灯',
      price: 279,
      day: 'assets/nymane/nymane-floor-reading-lamp-white__0879736_pe711963_s5.jpg',
      nightOn: 'assets/nymane/nymane-night-on.png',
      nightOff: 'assets/nymane/nymane-night-off.png'
    },
    {
      slug: 'nymane-3',
      name: 'NYMÅNE 纽墨奈',
      desc: '3 灯头落地灯',
      price: 399,
      day: 'assets/nymane-3/nymane-floor-lamp-with-3-spotlights-white__0810834_pe771432_s5.jpg',
      nightOn: 'assets/nymane-3/nymane-3-night-on.png',
      nightOff: 'assets/nymane-3/nymane-3-night-off.png'
    },
    {
      slug: 'pilskott',
      name: 'PILSKOTT 菲斯寇',
      desc: 'LED 落地灯',
      price: 599,
      day: 'assets/pilskott/pilskott-led-floor-lamp-smart-black__1077628_pe856959_s5.jpg',
      nightOn: 'assets/pilskott/pilskott-night-on.png',
      nightOff: 'assets/pilskott/pilskott-night-off.png'
    },
    {
      slug: 'vidja',
      name: 'VIDJA 维迪亚',
      desc: '落地灯，138 厘米',
      price: 399,
      day: 'assets/vidja/vidja-floor-lamp-white__0879632_pe611371_s5.jpg',
      nightOn: 'assets/vidja/vidja-night-on.png',
      nightOff: 'assets/vidja/vidja-night-off.png'
    },
    {
      slug: 'stockholm',
      name: 'STOCKHOLM 2025 斯德哥尔摩',
      desc: '落地灯，159 厘米',
      price: 599,
      day: 'assets/stockholm/stockholm-2025-floor-lamp-white-textile-brass-plated__1426323_ph203274_s5.jpg',
      nightOn: 'assets/stockholm/stockholm-night-on.png',
      nightOff: 'assets/stockholm/stockholm-night-off.png'
    },
    {
      slug: 'nyfors',
      name: 'NYFORS 耐福斯',
      desc: '落地灯',
      price: 599,
      day: 'assets/nyfors/nyfors-floor-lamp-nickel-plated-white__0879993_pe611350_s5.jpg',
      nightOn: 'assets/nyfors/nyfors-night-on.png',
      nightOff: 'assets/nyfors/nyfors-night-off.png'
    }
  ]; */

  /* ---------- DOM ---------- */
  var app       = document.getElementById('app');
  var viewPlp   = document.getElementById('viewPlp');
  var viewCompare = document.getElementById('viewCompare');
  var cmpPages = document.getElementById('cmpPages');
  var fabEnter  = document.getElementById('fabEnter');
  var btnBack   = document.getElementById('btnBack');
  var swMode    = document.getElementById('swMode');
  var swLight   = document.getElementById('swLight');

  /* ---------- 状态 ---------- */
  var mode  = 'day';   // day | night
  var light = 'on';    // on  | off
  var hasEnteredNight = false;
  var stateRequest = 0;
  var imageReady = Object.create(null);

  /* ---------- 工具 ---------- */
  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }

  function formatPrice(n) {
    return '¥' + (Number.isInteger(n) ? n : n.toFixed(2));
  }

  /* 图片层：0 = day · 1 = nightOn · 2 = nightOff */
  function mediaEl(p) {
    var wrap = el('div', 'media');
    [p.day, p.nightOn, p.nightOff].forEach(function (src, i) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = p.name + ' ' + (i === 0 ? '场景' : i === 1 ? '开灯' : '关灯');
      img.loading = 'lazy';
      img.decoding = 'async';
      wrap.appendChild(img);
    });
    return wrap;
  }

  function infoEl(p, withDesc) {
    var box = el('div', 'info');
    var name = el('h2', 'pname');
    name.textContent = p.name;
    box.appendChild(name);
    if (withDesc) {
      var d = el('p', 'pdesc');
      d.textContent = p.desc;
      box.appendChild(d);
    }
    var price = el('p', 'pprice');
    price.textContent = formatPrice(p.price);
    box.appendChild(price);
    return box;
  }

  /* 产品卡：上方 1:1 场景大图，下方稳定信息区（名称 / 简介 / 价格） */
  function buildCmpCard(p) {
    var card = el('article', 'product-card');
    card.dataset.product = p.slug;
    card.appendChild(mediaEl(p));
    card.appendChild(infoEl(p, true));
    return card;
  }

  /* ---------- 渲染：8 张产品卡连续排列，支持自然滚动 ---------- */
  function render() {
    cmpPages.innerHTML = '';
    if (!PRODUCTS.length) {
      var empty = el('p', 'empty-state');
      empty.textContent = '审核通过的灯具会显示在这里';
      cmpPages.appendChild(empty);
      return;
    }
    PRODUCTS.forEach(function (p) {
      cmpPages.appendChild(buildCmpCard(p));
    });
  }

  function loadImage(src) {
    if (!src) return Promise.resolve();
    if (imageReady[src]) return imageReady[src];

    imageReady[src] = new Promise(function (resolve) {
      var img = new Image();
      var finish = function () {
        if (typeof img.decode === 'function') {
          img.decode().then(resolve, resolve);
        } else {
          resolve();
        }
      };
      img.onload = finish;
      img.onerror = resolve;
      img.decoding = 'async';
      img.src = src;
      if (img.complete && img.naturalWidth) finish();
    });

    return imageReady[src];
  }

  function stateSources(nextMode, nextLight) {
    var key = nextMode === 'day' ? 'day' : nextLight === 'on' ? 'nightOn' : 'nightOff';
    return PRODUCTS.map(function (p) { return p[key]; });
  }

  function preloadState(nextMode, nextLight) {
    return Promise.all(stateSources(nextMode, nextLight).map(loadImage));
  }

  function preload() {
    // 先准备首屏状态；其余状态在用户切换前再准备，避免启动时一次解码全部素材。
    preloadState('day', 'on');
  }

  /* ---------- 状态 → UI ---------- */
  function syncTheme() {
    // 整页 dark：mode === night 时 .app 加 night，所有 CSS 变量联动
    app.classList.toggle('night', mode === 'night');

    // 开关位置：data-v 决定 pill 与图标高亮
    swMode.setAttribute('data-v', mode);
    swLight.setAttribute('data-v', mode === 'night' ? light : 'on');

    // Day 模式下 Light 无意义 → 置灰禁用
    swLight.classList.toggle('is-disabled', mode !== 'night');
    swLight.setAttribute('aria-disabled', mode !== 'night' ? 'true' : 'false');
  }

  function updateImages() {
    var target = mode === 'day' ? 0 : (light === 'on' ? 1 : 2);
    var cards = document.querySelectorAll('#cmpPages .product-card');
    cards.forEach(function (card) {
      var imgs = card.querySelectorAll('.media img');
      imgs.forEach(function (img, i) {
        img.classList.toggle('active', i === target);
      });
    });
  }

  function commitState(nextMode, nextLight, requestId) {
    if (requestId !== stateRequest) return;
    mode = nextMode;
    light = nextLight;
    requestAnimationFrame(function () {
      if (requestId !== stateRequest) return;
      syncTheme();
      updateImages();
    });
  }

  function applyState(nextMode, nextLight, onCommitted) {
    var requestId = ++stateRequest;
    preloadState(nextMode, nextLight).then(function () {
      if (requestId !== stateRequest) return;
      commitState(nextMode, nextLight, requestId);
      if (onCommitted) onCommitted();
    });
  }

  /* ---------- 视图切换 ---------- */
  function goCompare() {
    app.dataset.view = 'compare';
    viewPlp.classList.remove('active');
    viewCompare.classList.add('active');
  }

  function goPlp() {
    app.dataset.view = 'plp';
    viewCompare.classList.remove('active');
    viewPlp.classList.add('active');
  }

  /* ---------- 事件 ---------- */
  fabEnter.addEventListener('click', function () {
    // 每次重新进入灯光实景对比页，都开启一段新的交互会话。
    mode = 'day';
    light = 'on';
    hasEnteredNight = false;
    goCompare();
    applyState('day', 'on');
  });
  btnBack.addEventListener('click', goPlp);

  // Day / Night 左半边 = night，右半边 = day
  swMode.querySelectorAll('.half').forEach(function (h) {
    h.addEventListener('click', function () {
      var nextMode = h.getAttribute('data-val');
      // 只有第一次进入 Night 时默认关灯；之后保留用户上一次的选择。
      var enteringNight = nextMode === 'night' && mode !== 'night';
      var nextLight = enteringNight && !hasEnteredNight ? 'off' : light;
      applyState(nextMode, nextLight, function () {
        if (enteringNight) hasEnteredNight = true;
      });
    });
  });

  // Light On / Off：仅夜间模式生效
  swLight.querySelectorAll('.half').forEach(function (h) {
    h.addEventListener('click', function () {
      if (mode !== 'night') return;
      applyState('night', h.getAttribute('data-val'));
    });
  });

  /* ---------- 深链：location.hash 直接进入指定状态 ----------
     支持标记：compare(进对比页) / night / on|off（示例：#compare-night-off） */
  function applyHash() {
    var h = location.hash || '';
    if (h.indexOf('compare') > -1) goCompare();
    if (h.indexOf('night') > -1) {
      applyState('night', h.indexOf('on') > -1 ? 'on' : 'off', function () {
        hasEnteredNight = true;
      });
    } else {
      applyState('day', 'on');
    }
  }

  /* ---------- 启动 ---------- */
  preload();
  render();
  applyHash();
  window.addEventListener('hashchange', applyHash);
})();
