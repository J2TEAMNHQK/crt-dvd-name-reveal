/* ============================================
   CRT DVD NAME REVEAL — Animation Engine
   State machine + particle system + CRT FX
   With customization panel & URL sharing
   ============================================ */

;(function () {
  'use strict';

  // ── Configuration ──────────────────────────
  const CONFIG = {
    freeMoveDuration: 15000,
    assembleDuration: 2200,
    holdDuration: 5000,
    disperseDuration: 1400,
    colorInterval: 1000,
    baseSpeed: 1.2,
    speedVariance: 0.6,
    wordGap: 0.55,
    glitchChance: 0.003,
    flickerChance: 0.001,
    interferenceChance: 0.0008
  };

  // Curated vivid color palette
  const PALETTE = [
    '#FF3366', '#FF6B2B', '#FFD23F', '#44FF88',
    '#00FFCC', '#33CCFF', '#6B5BFF', '#CC44FF',
    '#FF4488', '#FFAA22', '#22FFAA', '#44AAFF',
    '#FF5577', '#BBFF44', '#FF77CC', '#77DDFF'
  ];

  // Default words
  const DEFAULT_WORDS = [
    { text: 'NGUYỄN', color: null },
    { text: 'HỒ',     color: null },
    { text: 'QUANG',  color: null },
    { text: 'KHẢI',   color: null }
  ];

  // Preset configurations
  const PRESETS = {
    'nguyen-ho-quang-khai': [
      { text: 'NGUYỄN', color: null },
      { text: 'HỒ',     color: null },
      { text: 'QUANG',  color: null },
      { text: 'KHẢI',   color: null }
    ],
    'john-doe': [
      { text: 'JOHN', color: null },
      { text: 'DOE',  color: null }
    ],
    'tanaka': [
      { text: '田中', color: null },
      { text: '太郎', color: null }
    ],
    'kim': [
      { text: '김', color: null },
      { text: '민수', color: null }
    ]
  };

  // ── State Machine ──────────────────────────
  const State = Object.freeze({
    FREE: 'free',
    ASSEMBLING: 'assembling',
    HOLDING: 'holding',
    DISPERSING: 'dispersing'
  });

  let currentState = State.FREE;
  let stateStartTime = 0;
  let lastColorChange = 0;
  let animFrameId = null;

  // ── DOM References ─────────────────────────
  const stage = document.getElementById('stage');
  const grainCanvas = document.getElementById('grain');
  const grainCtx = grainCanvas.getContext('2d');
  const statusLabel = document.querySelector('.status-label');
  const statusText = document.querySelector('.status-text');
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsClose = document.getElementById('settingsClose');
  const wordInputsContainer = document.getElementById('wordInputs');
  const addWordBtn = document.getElementById('addWord');
  const applyBtn = document.getElementById('applySettings');
  const shareLinkBtn = document.getElementById('shareLink');
  const shareToast = document.getElementById('shareToast');

  // ── Viewport ───────────────────────────────
  let vw = window.innerWidth;
  let vh = window.innerHeight;

  // ── Particle Data ──────────────────────────
  let particles = [];
  let wordConfigs = []; // { text, color (null = auto) }

  // ── Utility Functions ──────────────────────

  function pickDistinctColors(count) {
    const shuffled = [...PALETTE].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ── Parse URL Parameters ───────────────────
  function parseURLConfig() {
    const params = new URLSearchParams(window.location.search);
    const wordsParam = params.get('words');
    const colorsParam = params.get('colors');

    if (wordsParam) {
      const texts = wordsParam.split(',').map(w => decodeURIComponent(w.trim())).filter(Boolean);
      const colors = colorsParam
        ? colorsParam.split(',').map(c => {
            const decoded = decodeURIComponent(c.trim());
            return decoded && decoded !== 'auto' ? decoded : null;
          })
        : [];

      if (texts.length > 0) {
        return texts.map((text, i) => ({
          text,
          color: colors[i] || null
        }));
      }
    }
    return null;
  }

  function buildShareURL() {
    const base = window.location.origin + window.location.pathname;
    const texts = wordConfigs.map(w => encodeURIComponent(w.text)).join(',');
    const colors = wordConfigs.map(w => w.color ? encodeURIComponent(w.color) : 'auto').join(',');
    return `${base}?words=${texts}&colors=${colors}`;
  }

  // ── Create Particles from Config ───────────
  function createParticles(configs) {
    // Cancel animation
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    wordConfigs = configs;

    // Clear existing
    stage.innerHTML = '';
    particles = [];

    // Create DOM elements and particle data
    configs.forEach((cfg, i) => {
      const el = document.createElement('span');
      el.className = 'particle';
      el.dataset.index = i;
      el.textContent = cfg.text;
      stage.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const speed = CONFIG.baseSpeed + Math.random() * CONFIG.speedVariance;

      particles.push({
        el,
        word: cfg.text,
        index: i,
        fixedColor: cfg.color,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        width: 0,
        height: 0,
        color: cfg.color || PALETTE[i % PALETTE.length],
        targetX: 0,
        targetY: 0,
        originX: 0,
        originY: 0,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmpX: 0.3 + Math.random() * 0.5,
        floatAmpY: 0.2 + Math.random() * 0.4
      });
    });

    // Wait a frame for DOM measurement
    requestAnimationFrame(() => {
      measureParticles();
      particles.forEach(p => {
        p.x = Math.random() * Math.max(0, vw - p.width);
        p.y = Math.random() * Math.max(0, vh - p.height);
        p.el.style.color = p.color;
      });

      currentState = State.FREE;
      stateStartTime = performance.now();
      lastColorChange = stateStartTime;
      updateStatusLabel(State.FREE);
      setTimeout(() => statusLabel.classList.add('visible'), 300);
      animFrameId = requestAnimationFrame(tick);
    });
  }

  // ── Measure Particles ──────────────────────
  function measureParticles() {
    particles.forEach(p => {
      const rect = p.el.getBoundingClientRect();
      p.width = rect.width;
      p.height = rect.height;
    });
  }

  // ── Compute Centered Assembly Positions ────
  function computeAssemblyTargets() {
    measureParticles();
    if (particles.length === 0) return;

    const gap = particles[0].height * CONFIG.wordGap;
    const totalWidth = particles.reduce((sum, p) => sum + p.width, 0) +
                       gap * (particles.length - 1);
    const lineHeight = Math.max(...particles.map(p => p.height));

    const availableWidth = vw * 0.92;
    const effectiveGap = totalWidth > availableWidth
      ? Math.max(8, (availableWidth - particles.reduce((s, p) => s + p.width, 0)) / (particles.length - 1))
      : gap;
    const effectiveTotalWidth = particles.reduce((s, p) => s + p.width, 0) +
                                 effectiveGap * (particles.length - 1);

    let cursorX = (vw - effectiveTotalWidth) / 2;
    const centerY = (vh - lineHeight) / 2;

    particles.forEach(p => {
      p.targetX = cursorX;
      p.targetY = centerY;
      cursorX += p.width + effectiveGap;
    });
  }

  // ── Color Management ───────────────────────
  function rotateColors() {
    const autoCount = particles.filter(p => !p.fixedColor).length;
    const newColors = pickDistinctColors(autoCount);
    let colorIdx = 0;

    particles.forEach(p => {
      if (p.fixedColor) {
        p.color = p.fixedColor;
      } else {
        p.color = newColors[colorIdx++] || PALETTE[p.index % PALETTE.length];
      }
      p.el.style.color = p.color;
    });
  }

  // ── Movement & Collision ───────────────────
  function updateFreeMovement(now) {
    const floatTime = now * 0.001;

    particles.forEach(p => {
      const floatX = Math.sin(floatTime * 0.7 + p.floatPhase) * p.floatAmpX;
      const floatY = Math.cos(floatTime * 0.5 + p.floatPhase) * p.floatAmpY;

      p.x += p.vx + floatX;
      p.y += p.vy + floatY;

      if (p.x <= 0) { p.x = 0; p.vx = Math.abs(p.vx); }
      else if (p.x + p.width >= vw) { p.x = vw - p.width; p.vx = -Math.abs(p.vx); }

      if (p.y <= 0) { p.y = 0; p.vy = Math.abs(p.vy); }
      else if (p.y + p.height >= vh) { p.y = vh - p.height; p.vy = -Math.abs(p.vy); }
    });
  }

  function updateAssembly(elapsed) {
    const t = Math.min(elapsed / CONFIG.assembleDuration, 1);
    const eased = easeOutBack(t);
    particles.forEach(p => {
      p.x = lerp(p.originX, p.targetX, eased);
      p.y = lerp(p.originY, p.targetY, eased);
    });
    return t >= 1;
  }

  function updateDisperse(elapsed) {
    const t = Math.min(elapsed / CONFIG.disperseDuration, 1);
    const eased = easeInOutCubic(t);
    particles.forEach(p => {
      p.x = lerp(p.originX, p.targetX, eased);
      p.y = lerp(p.originY, p.targetY, eased);
    });
    return t >= 1;
  }

  function renderParticles() {
    particles.forEach(p => {
      p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    });
  }

  // ── Glitch Effects ─────────────────────────
  function triggerGlitch(p) {
    p.el.style.setProperty('--x', p.x + 'px');
    p.el.style.setProperty('--y', p.y + 'px');
    p.el.classList.add('glitch');
    setTimeout(() => p.el.classList.remove('glitch'), 150);
  }

  function triggerScreenFlicker() {
    document.body.classList.add('flicker');
    setTimeout(() => document.body.classList.remove('flicker'), 80);
  }

  function spawnInterferenceBar() {
    const bar = document.createElement('div');
    bar.className = 'interference-bar';
    document.body.appendChild(bar);
    setTimeout(() => bar.remove(), 700);
  }

  // ── Status Label ───────────────────────────
  function updateStatusLabel(state) {
    const labels = {
      [State.FREE]: 'SIGNAL LOST',
      [State.ASSEMBLING]: 'TRACKING…',
      [State.HOLDING]: 'LOCK',
      [State.DISPERSING]: 'SIGNAL LOST'
    };
    statusText.textContent = labels[state] || '';
    statusLabel.classList.add('visible');
  }

  // ── Grain Background ──────────────────────
  function resizeGrain() {
    grainCanvas.width = Math.ceil(vw / 2);
    grainCanvas.height = Math.ceil(vh / 2);
  }

  function renderGrain() {
    const w = grainCanvas.width;
    const h = grainCanvas.height;
    const imageData = grainCtx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0, len = data.length; i < len; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    grainCtx.putImageData(imageData, 0, 0);
  }

  let grainFrame = 0;
  function updateGrain() {
    grainFrame++;
    if (grainFrame % 3 === 0) renderGrain();
  }

  // ── State Transitions ──────────────────────
  function enterState(newState, now) {
    currentState = newState;
    stateStartTime = now;
    updateStatusLabel(newState);

    switch (newState) {
      case State.FREE:
        particles.forEach(p => p.el.classList.remove('assembled'));
        break;

      case State.ASSEMBLING:
        computeAssemblyTargets();
        particles.forEach(p => {
          p.originX = p.x;
          p.originY = p.y;
        });
        break;

      case State.HOLDING:
        particles.forEach(p => {
          p.el.classList.add('assembled');
          p.x = p.targetX;
          p.y = p.targetY;
        });
        break;

      case State.DISPERSING: {
        const pad = 20;
        const quadrants = [
          { xMin: pad,      xMax: vw * 0.35, yMin: pad,      yMax: vh * 0.35 },
          { xMin: vw * 0.6, xMax: vw - pad,  yMin: pad,      yMax: vh * 0.35 },
          { xMin: pad,      xMax: vw * 0.35, yMin: vh * 0.6,  yMax: vh - pad },
          { xMin: vw * 0.6, xMax: vw - pad,  yMin: vh * 0.6,  yMax: vh - pad }
        ];
        const shuffledQ = [...quadrants].sort(() => Math.random() - 0.5);
        particles.forEach((p, i) => {
          p.el.classList.remove('assembled');
          p.originX = p.x;
          p.originY = p.y;
          const q = shuffledQ[i % shuffledQ.length];
          p.targetX = q.xMin + Math.random() * Math.max(0, q.xMax - q.xMin - p.width);
          p.targetY = q.yMin + Math.random() * Math.max(0, q.yMax - q.yMin - p.height);
          p.targetX = Math.max(0, Math.min(vw - p.width, p.targetX));
          p.targetY = Math.max(0, Math.min(vh - p.height, p.targetY));
          const newAngle = Math.random() * Math.PI * 2;
          const speed = CONFIG.baseSpeed + Math.random() * CONFIG.speedVariance;
          p.vx = Math.cos(newAngle) * speed;
          p.vy = Math.sin(newAngle) * speed;
        });
        break;
      }
    }
  }

  // ── Main Loop ──────────────────────────────
  function tick(now) {
    const elapsed = now - stateStartTime;

    if (now - lastColorChange >= CONFIG.colorInterval) {
      rotateColors();
      lastColorChange = now;
    }

    switch (currentState) {
      case State.FREE:
        updateFreeMovement(now);
        if (elapsed >= CONFIG.freeMoveDuration) enterState(State.ASSEMBLING, now);
        break;
      case State.ASSEMBLING:
        if (updateAssembly(elapsed)) enterState(State.HOLDING, now);
        break;
      case State.HOLDING:
        particles.forEach(p => {
          const drift = Math.sin(now * 0.002 + p.index) * 1.5;
          p.x = p.targetX + drift;
        });
        if (elapsed >= CONFIG.holdDuration) enterState(State.DISPERSING, now);
        break;
      case State.DISPERSING:
        if (updateDisperse(elapsed)) enterState(State.FREE, now);
        break;
    }

    renderParticles();

    if (currentState === State.FREE || currentState === State.DISPERSING) {
      if (Math.random() < CONFIG.glitchChance && particles.length > 0) {
        triggerGlitch(particles[Math.floor(Math.random() * particles.length)]);
      }
      if (Math.random() < CONFIG.flickerChance) triggerScreenFlicker();
      if (Math.random() < CONFIG.interferenceChance) spawnInterferenceBar();
    }

    updateGrain();
    animFrameId = requestAnimationFrame(tick);
  }

  // ── Resize Handler ─────────────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      resizeGrain();
      measureParticles();
      particles.forEach(p => {
        p.x = Math.max(0, Math.min(vw - p.width, p.x));
        p.y = Math.max(0, Math.min(vh - p.height, p.y));
      });
      if (currentState === State.ASSEMBLING || currentState === State.HOLDING) {
        computeAssemblyTargets();
      }
    }, 100);
  });

  // ============================================
  // SETTINGS PANEL
  // ============================================

  let settingsOpen = false;
  let settingsJustToggled = false;

  function openSettings() {
    settingsOpen = true;
    settingsPanel.classList.add('open');
    populateWordInputs();
  }

  function closeSettings() {
    settingsOpen = false;
    settingsPanel.classList.remove('open');
  }

  settingsToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    settingsJustToggled = true;
    if (settingsOpen) {
      closeSettings();
    } else {
      openSettings();
    }
    // Reset flag after current event cycle
    setTimeout(() => { settingsJustToggled = false; }, 0);
  });

  settingsClose.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeSettings();
  });

  // Prevent clicks inside panel from closing it
  settingsPanel.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Close on click outside
  document.addEventListener('click', () => {
    if (settingsOpen && !settingsJustToggled) {
      closeSettings();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsOpen) {
      closeSettings();
    }
  });

  function populateWordInputs() {
    wordInputsContainer.innerHTML = '';
    wordConfigs.forEach((cfg, i) => {
      addWordRow(cfg.text, cfg.color);
    });
  }

  function addWordRow(text, color) {
    const row = document.createElement('div');
    row.className = 'word-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter word…';
    input.value = text || '';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = color || '#ffffff';
    colorInput.title = 'Pick color (white = auto-cycle)';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => {
      row.remove();
    });

    row.appendChild(input);
    row.appendChild(colorInput);
    row.appendChild(removeBtn);
    wordInputsContainer.appendChild(row);
  }

  addWordBtn.addEventListener('click', () => {
    addWordRow('', null);
    // Focus the new input
    const inputs = wordInputsContainer.querySelectorAll('input[type="text"]');
    if (inputs.length > 0) inputs[inputs.length - 1].focus();
  });

  applyBtn.addEventListener('click', () => {
    const rows = wordInputsContainer.querySelectorAll('.word-row');
    const newConfigs = [];

    rows.forEach(row => {
      const text = row.querySelector('input[type="text"]').value.trim();
      const colorVal = row.querySelector('input[type="color"]').value;
      if (text) {
        // If color is white (#ffffff), treat as auto
        const isAuto = colorVal.toLowerCase() === '#ffffff';
        newConfigs.push({
          text,
          color: isAuto ? null : colorVal
        });
      }
    });

    if (newConfigs.length === 0) return;

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('words', newConfigs.map(c => c.text).join(','));
    url.searchParams.set('colors', newConfigs.map(c => c.color || 'auto').join(','));
    window.history.replaceState({}, '', url);

    createParticles(newConfigs);
    closeSettings();
  });

  // Presets
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset;
      if (PRESETS[key]) {
        const configs = PRESETS[key];
        wordInputsContainer.innerHTML = '';
        configs.forEach(c => addWordRow(c.text, c.color));
      }
    });
  });

  // Share link
  shareLinkBtn.addEventListener('click', () => {
    const url = buildShareURL();
    navigator.clipboard.writeText(url).then(() => {
      shareToast.classList.add('show');
      setTimeout(() => shareToast.classList.remove('show'), 2000);
    }).catch(() => {
      // Fallback: select text
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      shareToast.classList.add('show');
      setTimeout(() => shareToast.classList.remove('show'), 2000);
    });
  });

  // ── Initialize ─────────────────────────────
  function init() {
    resizeGrain();
    renderGrain();

    // Check URL for custom config
    const urlConfig = parseURLConfig();
    const initialConfigs = urlConfig || DEFAULT_WORDS;

    createParticles(initialConfigs);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    window.addEventListener('load', init);
  }

})();
