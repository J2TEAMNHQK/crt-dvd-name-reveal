/* ============================================
   CRT DVD NAME REVEAL — Animation Engine
   State machine + particle system + CRT FX
   ============================================ */

;(function () {
  'use strict';

  // ── Configuration ──────────────────────────
  const CONFIG = {
    freeMoveDuration: 15000,   // ms of free movement before assembly
    assembleDuration: 2200,    // ms for words to fly to center
    holdDuration: 5000,        // ms to hold assembled name
    disperseDuration: 1400,    // ms for disperse animation
    colorInterval: 1000,       // ms between color changes
    baseSpeed: 1.2,            // base movement speed (px/frame at 60fps)
    speedVariance: 0.6,        // random variance added to base
    wordGap: 0.55,             // gap between words as fraction of font size
    glitchChance: 0.003,       // per-frame probability of glitch event
    flickerChance: 0.001,      // per-frame probability of screen flicker
    interferenceChance: 0.0008 // per-frame probability of interference bar
  };

  // Curated vivid color palette — avoids muddy tones
  const PALETTE = [
    '#FF3366', // hot pink
    '#FF6B2B', // vivid orange
    '#FFD23F', // golden yellow
    '#44FF88', // mint green
    '#00FFCC', // cyan-green
    '#33CCFF', // sky blue
    '#6B5BFF', // electric indigo
    '#CC44FF', // violet
    '#FF4488', // rose
    '#FFAA22', // amber
    '#22FFAA', // spring green
    '#44AAFF', // cornflower
    '#FF5577', // coral
    '#BBFF44', // lime
    '#FF77CC', // bubblegum
    '#77DDFF'  // light cyan
  ];

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
  const particleEls = Array.from(document.querySelectorAll('.particle'));

  // ── Viewport ───────────────────────────────
  let vw = window.innerWidth;
  let vh = window.innerHeight;

  // ── Particle Data ──────────────────────────
  const words = ['NGUYỄN', 'HỒ', 'QUANG', 'KHẢI'];

  const particles = particleEls.map((el, i) => {
    const rect = el.getBoundingClientRect();
    const angle = Math.random() * Math.PI * 2;
    const speed = CONFIG.baseSpeed + Math.random() * CONFIG.speedVariance;
    return {
      el,
      word: words[i],
      index: i,
      x: Math.random() * (vw - rect.width),
      y: Math.random() * (vh - rect.height),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: rect.width,
      height: rect.height,
      color: PALETTE[i % PALETTE.length],
      targetX: 0,
      targetY: 0,
      originX: 0,
      originY: 0,
      // idle floating offset
      floatPhase: Math.random() * Math.PI * 2,
      floatAmpX: 0.3 + Math.random() * 0.5,
      floatAmpY: 0.2 + Math.random() * 0.4
    };
  });

  // ── Utility Functions ──────────────────────

  /** Pick N distinct colors from palette */
  function pickDistinctColors(count) {
    const shuffled = [...PALETTE].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /** Smooth ease-out cubic */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /** Smooth ease-in-out cubic */
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /** Elastic ease out for dramatic convergence */
  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  /** Lerp */
  function lerp(a, b, t) {
    return a + (b - a) * t;
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
    const gap = particles[0].height * CONFIG.wordGap;
    const totalWidth = particles.reduce((sum, p) => sum + p.width, 0) +
                       gap * (particles.length - 1);
    const lineHeight = Math.max(...particles.map(p => p.height));

    // If assembled text is wider than viewport, scale down gap
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
    const newColors = pickDistinctColors(particles.length);
    particles.forEach((p, i) => {
      p.color = newColors[i];
      p.el.style.color = newColors[i];
    });
  }

  // ── Movement & Collision ───────────────────
  function updateFreeMovement(now) {
    const floatTime = now * 0.001;

    particles.forEach(p => {
      // Add subtle sinusoidal float to the base velocity
      const floatX = Math.sin(floatTime * 0.7 + p.floatPhase) * p.floatAmpX;
      const floatY = Math.cos(floatTime * 0.5 + p.floatPhase) * p.floatAmpY;

      p.x += p.vx + floatX;
      p.y += p.vy + floatY;

      // Bounce off edges
      if (p.x <= 0) {
        p.x = 0;
        p.vx = Math.abs(p.vx);
      } else if (p.x + p.width >= vw) {
        p.x = vw - p.width;
        p.vx = -Math.abs(p.vx);
      }

      if (p.y <= 0) {
        p.y = 0;
        p.vy = Math.abs(p.vy);
      } else if (p.y + p.height >= vh) {
        p.y = vh - p.height;
        p.vy = -Math.abs(p.vy);
      }
    });
  }

  // ── Assembly Animation ─────────────────────
  function updateAssembly(elapsed) {
    const t = Math.min(elapsed / CONFIG.assembleDuration, 1);
    const eased = easeOutBack(t);

    particles.forEach(p => {
      p.x = lerp(p.originX, p.targetX, eased);
      p.y = lerp(p.originY, p.targetY, eased);
    });

    return t >= 1;
  }

  // ── Disperse Animation ─────────────────────
  function updateDisperse(elapsed) {
    const t = Math.min(elapsed / CONFIG.disperseDuration, 1);
    const eased = easeInOutCubic(t);

    particles.forEach(p => {
      p.x = lerp(p.originX, p.targetX, eased);
      p.y = lerp(p.originY, p.targetY, eased);
    });

    return t >= 1;
  }

  // ── Render Particles ───────────────────────
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
    switch (state) {
      case State.FREE:
        statusText.textContent = 'SIGNAL LOST';
        statusLabel.classList.add('visible');
        break;
      case State.ASSEMBLING:
        statusText.textContent = 'TRACKING…';
        statusLabel.classList.add('visible');
        break;
      case State.HOLDING:
        statusText.textContent = 'LOCK';
        statusLabel.classList.add('visible');
        break;
      case State.DISPERSING:
        statusText.textContent = 'SIGNAL LOST';
        statusLabel.classList.add('visible');
        break;
    }
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
    // Update grain every 3 frames for performance
    if (grainFrame % 3 === 0) {
      renderGrain();
    }
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
          // Snap to exact target
          p.x = p.targetX;
          p.y = p.targetY;
        });
        break;

      case State.DISPERSING: {
        // Scatter to different quadrants for visual spread
        const pad = 20;
        const quadrants = [
          { xMin: pad,          xMax: vw * 0.35, yMin: pad,          yMax: vh * 0.35 },
          { xMin: vw * 0.6,     xMax: vw - pad,  yMin: pad,          yMax: vh * 0.35 },
          { xMin: pad,          xMax: vw * 0.35, yMin: vh * 0.6,     yMax: vh - pad },
          { xMin: vw * 0.6,     xMax: vw - pad,  yMin: vh * 0.6,     yMax: vh - pad }
        ];
        const shuffledQ = [...quadrants].sort(() => Math.random() - 0.5);
        particles.forEach((p, i) => {
          p.el.classList.remove('assembled');
          p.originX = p.x;
          p.originY = p.y;
          const q = shuffledQ[i % shuffledQ.length];
          p.targetX = q.xMin + Math.random() * Math.max(0, q.xMax - q.xMin - p.width);
          p.targetY = q.yMin + Math.random() * Math.max(0, q.yMax - q.yMin - p.height);
          // Clamp within viewport
          p.targetX = Math.max(0, Math.min(vw - p.width, p.targetX));
          p.targetY = Math.max(0, Math.min(vh - p.height, p.targetY));
          // Set new velocity for next free state
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

    // Color rotation
    if (now - lastColorChange >= CONFIG.colorInterval) {
      rotateColors();
      lastColorChange = now;
    }

    // State logic
    switch (currentState) {
      case State.FREE:
        updateFreeMovement(now);
        if (elapsed >= CONFIG.freeMoveDuration) {
          enterState(State.ASSEMBLING, now);
        }
        break;

      case State.ASSEMBLING:
        if (updateAssembly(elapsed)) {
          enterState(State.HOLDING, now);
        }
        break;

      case State.HOLDING:
        // Subtle idle float while holding
        particles.forEach(p => {
          const drift = Math.sin(now * 0.002 + p.index) * 1.5;
          p.x = p.targetX + drift;
        });
        if (elapsed >= CONFIG.holdDuration) {
          enterState(State.DISPERSING, now);
        }
        break;

      case State.DISPERSING:
        if (updateDisperse(elapsed)) {
          enterState(State.FREE, now);
        }
        break;
    }

    renderParticles();

    // Random FX events (only during free movement and dispersing)
    if (currentState === State.FREE || currentState === State.DISPERSING) {
      if (Math.random() < CONFIG.glitchChance) {
        const idx = Math.floor(Math.random() * particles.length);
        triggerGlitch(particles[idx]);
      }
      if (Math.random() < CONFIG.flickerChance) {
        triggerScreenFlicker();
      }
      if (Math.random() < CONFIG.interferenceChance) {
        spawnInterferenceBar();
      }
    }

    updateGrain();

    animFrameId = requestAnimationFrame(tick);
  }

  // ── Resize Handler ─────────────────────────
  function onResize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    resizeGrain();
    measureParticles();

    // Clamp particles within new viewport
    particles.forEach(p => {
      p.x = Math.max(0, Math.min(vw - p.width, p.x));
      p.y = Math.max(0, Math.min(vh - p.height, p.y));
    });

    // Recompute assembly targets if currently assembling or holding
    if (currentState === State.ASSEMBLING || currentState === State.HOLDING) {
      computeAssemblyTargets();
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 100);
  });

  // ── Initialize ─────────────────────────────
  function init() {
    resizeGrain();
    renderGrain();
    measureParticles();

    // Set initial positions
    particles.forEach(p => {
      p.x = Math.random() * Math.max(0, vw - p.width);
      p.y = Math.random() * Math.max(0, vh - p.height);
    });

    rotateColors();
    stateStartTime = performance.now();
    lastColorChange = stateStartTime;
    updateStatusLabel(State.FREE);

    // Slightly delay the status label appearance
    setTimeout(() => statusLabel.classList.add('visible'), 500);

    animFrameId = requestAnimationFrame(tick);
  }

  // Ensure fonts are loaded before measuring
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    window.addEventListener('load', init);
  }

})();
