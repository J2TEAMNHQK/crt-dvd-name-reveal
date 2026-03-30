# 📺 CRT DVD Name Reveal

**A retro CRT / DVD screensaver-style animated name reveal — where analog signal chaos meets centered identity.**

> _Imagine a lost TV signal. Static hisses. Glowing text fragments drift across a dark screen like a haunted DVD logo. Then, every 15 seconds, the signal locks — and a name materializes from the noise._

🔗 **[Live Demo](https://j2teamnhqk.github.io/crt-dvd-name-reveal/)**

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

Name fragments float independently across a dark screen with DVD-style bouncing motion and subtle signal drift. By default it displays **NGUYỄN HỒ QUANG KHẢI**, but **anyone can customize it with their own name in any language**.

### The Animation Cycle

```
┌─────────────────────────────────────────────────────────────┐
│  FREE MOVEMENT (15s)                                        │
│  Words bounce independently with vivid shifting colors      │
│  ↓                                                          │
│  ASSEMBLY (2.2s)                                            │
│  All words fly to center with elastic easeOutBack easing    │
│  ↓                                                          │
│  HOLD (5s)                                                  │
│  Full name holds centered with enhanced glow                │
│  ↓                                                          │
│  DISPERSE (1.4s)                                            │
│  Words scatter to different quadrants organically           │
│  ↓                                                          │
│  (repeat forever)                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Features

### Core Animation

- **DVD-style bouncing motion** with edge collision and sinusoidal float variation
- **Vivid color cycling** — each word changes to a curated palette color every second, no two words share the same color
- **Dramatic convergence animation** with elastic easeOutBack easing
- **Centered title hold** with enhanced bloom glow and subtle idle drift
- **Quadrant-based organic disperse** so words scatter convincingly
- **Smooth 60fps** using `transform`-based positioning and `requestAnimationFrame`

### CRT Visual Effects

- Animated scanlines
- Real-time canvas grain noise
- Radial vignette
- Screen flicker events
- Horizontal interference bars
- RGB chromatic aberration on glitch pulses
- Status indicator cycling: "SIGNAL LOST" → "TRACKING…" → "LOCK"

### 🎨 Customization (NEW)

- **Custom name input** — enter any name parts as separate floating words
- **Per-word color picker** — choose a fixed color for each word, or leave white for auto-cycling
- **All languages supported** — Vietnamese, Japanese, Korean, Chinese, Arabic, Cyrillic, and more
- **Presets** — quick-load example names in different languages
- **Shareable URLs** — copy a link that encodes your custom name and colors
- **Add/remove words** — use as many name parts as you want

### Responsive

- Adapts to any viewport size
- Vietnamese diacritics rendered perfectly (Ễ, Ồ, Ả)

---

## 🛠 Tech Stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Structure | Semantic HTML5                                  |
| Styling   | Pure CSS3 (animations, gradients, blend modes)  |
| Animation | Vanilla JavaScript (requestAnimationFrame loop) |
| Grain     | Canvas 2D API                                   |
| Fonts     | System font stack with international support    |

**Zero dependencies. Zero frameworks. Zero build tools.**

---

## 📁 Project Structure

```
crt-dvd-name-reveal/
├── index.html      → Semantic markup, CRT overlays, settings panel
├── style.css       → CRT effects, settings UI, responsive rules
├── script.js       → Animation engine, state machine, customization
└── README.md       → This file
```

---

## 🚀 How to Run

1. Clone or download this repository
2. Open `index.html` in any modern browser

```bash
git clone https://github.com/J2TEAMNHQK/crt-dvd-name-reveal.git
cd crt-dvd-name-reveal
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

No server required. No build step. Just open and watch.

### URL Parameters

You can share a custom name via URL:

```
?words=JOHN,DOE&colors=auto,%23FF3366
```

- `words` — comma-separated name parts
- `colors` — comma-separated hex colors or `auto` for cycling

---

## 🎨 Customization

### Via the Settings Panel

Click the ⚙ gear icon in the top-right corner to:

- Type your own name parts
- Pick colors per word
- Load language presets
- Copy a shareable link

### Via Code

**Change default words** in `script.js`:

```javascript
const DEFAULT_WORDS = [
  { text: "NGUYỄN", color: null },
  { text: "HỒ", color: null },
  { text: "QUANG", color: null },
  { text: "KHẢI", color: null },
];
```

**Adjust timing** via `CONFIG`:

```javascript
const CONFIG = {
  freeMoveDuration: 15000, // ms of free bouncing
  assembleDuration: 2200, // ms for convergence
  holdDuration: 5000, // ms to hold assembled
  disperseDuration: 1400, // ms for scatter
  colorInterval: 1000, // ms between color changes
  baseSpeed: 1.2, // movement speed
};
```

**Modify the color palette:**

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
];
```

---

## 💡 Future Improvement Ideas

- [ ] Audio — subtle CRT hum, static noise, satisfying lock sound
- [ ] Corner-hit detection with color burst (classic DVD Easter egg)
- [ ] WebGL shader-based CRT barrel distortion
- [ ] Mobile touch interaction — tap to trigger early assembly
- [ ] Export as animated GIF/WebM
- [ ] P5.js or Three.js version for advanced effects

---

## 👤 Author

**Nguyễn Hồ Quang Khải** — [@J2TEAMNHQK](https://github.com/J2TEAMNHQK)

---

## 📄 License

MIT License — use it, remix it, make it yours.

---

<p align="center">
  <em>Built with nostalgia, caffeine, and a love for the aesthetic of broken screens.</em>
</p>
