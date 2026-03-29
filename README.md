# 📺 CRT DVD Name Reveal

**A retro CRT / DVD screensaver-style animated name reveal — where analog signal chaos meets centered identity.**

> _Imagine a lost TV signal. Static hisses. Glowing text fragments drift across a dark screen like a haunted DVD logo. Then, every 15 seconds, the signal locks — and a name materializes from the noise._

---

## ✨ The Vibe

This is a small artistic web piece inspired by:

- **DVD screensaver nostalgia** — that hypnotic bouncing logo we all watched as kids, waiting for it to hit the corner
- **CRT television static** — the grain, the scanlines, the warm analog glow of a dying signal
- **VHS tracking errors** — interference bars, chromatic aberration, the beauty of broken technology
- **"NO SIGNAL" screens** — that eerie, liminal aesthetic of a disconnected cable feed

The result is a cinematic, smooth, modernized take on retro display technology — built as a lightweight, framework-free web experience.

---

## 🎬 What It Does

Four Vietnamese name fragments — **NGUYỄN**, **HỒ**, **QUANG**, **KHẢI** — float independently across a dark screen with DVD-style bouncing motion and subtle signal drift.

### The Animation Cycle

```
┌─────────────────────────────────────────────────────────────┐
│  FREE MOVEMENT (15s)                                        │
│  Words bounce independently with vivid shifting colors      │
│  ↓                                                          │
│  ASSEMBLY (2.2s)                                            │
│  All four words fly to center with easeOutBack easing       │
│  ↓                                                          │
│  HOLD (5s)                                                  │
│  "NGUYỄN HỒ QUANG KHẢI" holds centered with enhanced glow  │
│  ↓                                                          │
│  DISPERSE (1.4s)                                            │
│  Words scatter to different quadrants organically            │
│  ↓                                                          │
│  (repeat forever)                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Features

- **DVD-style bouncing motion** with edge collision and sinusoidal float variation
- **Vivid color cycling** — each word changes to a curated palette color every second, no two words share the same color
- **CRT visual effects stack:**
  - Animated scanlines
  - Real-time canvas grain noise
  - Radial vignette
  - Screen flicker events
  - Horizontal interference bars
  - RGB chromatic aberration on glitch pulses
- **Dramatic convergence animation** with elastic easeOutBack easing
- **Centered title hold** with enhanced bloom glow and subtle idle drift
- **Quadrant-based organic disperse** so words scatter convincingly
- **Status indicator** cycling through "SIGNAL LOST" → "TRACKING…" → "LOCK"
- **Vietnamese diacritics** rendered perfectly (Ễ, Ồ, Ả)
- **Responsive** — adapts to any viewport size
- **Smooth 60fps** using `transform`-based positioning and `requestAnimationFrame`

---

## 🛠 Tech Stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Structure | Semantic HTML5                                  |
| Styling   | Pure CSS3 (animations, gradients, blend modes)  |
| Animation | Vanilla JavaScript (requestAnimationFrame loop) |
| Grain     | Canvas 2D API                                   |
| Fonts     | System font stack with Vietnamese support       |

**Zero dependencies. Zero frameworks. Zero build tools.**

---

## 📁 Project Structure

```
crt-dvd-name-reveal/
├── index.html      → Semantic markup + CRT overlay layers
├── style.css       → All visual effects, animations, responsive rules
├── script.js       → Animation engine, state machine, particle system
└── README.md       → This file
```

---

## 🚀 How to Run

1. Clone or download this repository
2. Open `index.html` in any modern browser

```bash
# Clone
git clone https://github.com/J2TEAMNHQK/crt-dvd-name-reveal.git

# Open
cd crt-dvd-name-reveal
# Double-click index.html, or:
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

No server required. No build step. Just open and watch.

---

## 🎨 Customization

### Change the name

Edit the words in both `index.html` (the `<span>` elements) and `script.js` (the `words` array):

```javascript
// script.js
const words = ["NGUYỄN", "HỒ", "QUANG", "KHẢI"];
```

```html
<!-- index.html -->
<span class="particle" data-index="0">NGUYỄN</span>
<span class="particle" data-index="1">HỒ</span>
<span class="particle" data-index="2">QUANG</span>
<span class="particle" data-index="3">KHẢI</span>
```

### Adjust timing

All timing is controlled via the `CONFIG` object in `script.js`:

```javascript
const CONFIG = {
  freeMoveDuration: 15000, // ms of free bouncing
  assembleDuration: 2200, // ms for convergence animation
  holdDuration: 5000, // ms to hold assembled name
  disperseDuration: 1400, // ms for scatter animation
  colorInterval: 1000, // ms between color changes
  baseSpeed: 1.2, // movement speed
};
```

### Modify the color palette

Edit the `PALETTE` array for different color schemes:

```javascript
const PALETTE = [
  "#FF3366",
  "#FF6B2B",
  "#FFD23F",
  "#44FF88",
  "#00FFCC",
  "#33CCFF",
  "#6B5BFF",
  "#CC44FF",
  // ... add or replace colors
];
```

### Adjust CRT intensity

Tweak CSS opacity values for scanlines, noise, and vignette in `style.css`.

---

## 💡 Future Improvement Ideas

- [ ] Add audio — subtle CRT hum, static noise, satisfying lock sound on assembly
- [ ] Corner-hit detection with special color burst (classic DVD Easter egg)
- [ ] WebGL shader-based CRT distortion for barrel/pincushion effect
- [ ] Mobile touch interaction — tap to trigger early assembly
- [ ] Multiple name presets with URL parameter support
- [ ] Dark/light mode toggle (light mode = blown-out CRT white)
- [ ] Export as animated GIF/WebM for social sharing
- [ ] P5.js or Three.js version for more advanced visual effects

---

## 👤 Author

**Nguyễn Hồ Quang Khải**

---

## 📄 License

MIT License — use it, remix it, make it yours.

---

<p align="center">
  <em>Built with nostalgia, caffeine, and a love for the aesthetic of broken screens.</em>
</p>
