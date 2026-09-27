# 💗 LoveOnce — Romantic Background Music Experience

A private, modern romantic love story web experience enhanced with an emotional, cinematic background music system, blooming flower garden, pulsing mathematical "I LOVE YOU" heart, and interactive love features.

---

## 🎵 Background Music System Features

### 1. Seamless Audio Playback & Looping
- **Track**: Pre-configured with a soulful Indian romantic flute melody (*Krishna Flute — Harsh Saklani*) set permanently to 100% volume for an enchanting, cinematic ambience.
- **Audio Element**: Native HTML5 `<audio id="loveOnceMusic" loop preload="auto">` ensuring peak 60fps performance without audio glitches or external CDN dependencies.
- **Looping**: Configured with `audio.loop = true;` for continuous ambient playback as the user explores every section.
- **Permanent 100% Volume**: Defaults to full 1.0 volume across refreshes and sessions.
- **Easy Customization**: Simply replace `assets/music/loveonce.mp3` with your own MP3 file at any time.

### 2. Browser Autoplay Handling & First-Interaction Experience
- Complies strictly with modern browser autoplay policies (Chrome, Safari, Edge, Firefox, iOS, Android).
- Tries graceful initialization on page load.
- If autoplay is restricted by the browser before user interaction, it displays the romantic **"🎵 Tap to Enter LoveOnce"** welcome overlay or starts smoothly upon the very first click/tap anywhere on the page without showing any console errors.
- Smooth volume fade-in over 1000ms.

### 3. Glassmorphic Floating Music Button (Bottom-Right)
- **Design**:
  - Circular floating glassmorphism token:
    - `background: rgba(255, 255, 255, 0.08)`
    - `border: 1px solid rgba(255, 255, 255, 0.15)`
    - `backdrop-filter: blur(15px)`
    - `box-shadow: 0 0 25px rgba(255, 50, 100, 0.35)`
- **Dynamic Equalizer**:
  - 4 animated equalizer bars that react smoothly when music is playing.
  - Floating mini musical notes (`♪`, `♫`, `♩`) drifting around the button.
  - Muted icon (`🔇`) displayed when paused.
- **Status Tooltip**:
  - `💗 🎵 Playing Love` when music is playing.
  - `🔇 Music Off` when paused.

### 4. Interactive Volume Control Panel (Popup)
Clicking the floating music button smoothly scales & fades open the music control panel:
- **Title**: `🎵 LoveOnce Music`
- **Track Info**: Current song title & romantic ambience description.
- **Play / Pause Button**: `▶` / `⏸` instant toggle.
- **Volume Slider**: Smooth range slider with real-time percentage readout (e.g. `35%`).
- **Mute / Unmute Button**: `🔊` / `🔇` instant toggle.
- **Music On/Off Power Switch**: `💗 Music On` / `♡ Music Off`.
- **Dismiss**: Clicking anywhere outside the panel closes it with a smooth animation.

### 5. Persistent Preferences (`localStorage`)
- Automatically saves and restores:
  - `localStorage.getItem("loveonceMusicEnabled")`
  - `localStorage.getItem("loveonceMusicVolume")`
- Remembers user's mute/unmute and volume settings across page reloads without unexpectedly turning music on if the user previously turned it off.

### 6. Interactive Sound Effects & Cinematic Volume Transitions
- **Web Audio Sound Effects**: Subtle, gentle synthesized chimes and sparkles for interactive UI elements:
  - **"Send Me A Heart"**: Gentle pentatonic harp chime + floating glowing hearts.
  - **"Make It Rain Love"**: Romantic sparkle chimes + full-screen rose petals & confetti rain.
- **Love Letter Cinematic Swell**:
  - When opening the wax-sealed letter, music volume gently increases by ~35% with a soft cinematic swell.
  - Closing the letter restores the volume smoothly back to normal background level.
- **Final Surprise**:
  - Opening the secret romantic surprise modal activates an emotional volume swell and celebratory confetti shower.

### 7. Fail-Safe Romantic Ambient Synthesizer
- If `assets/music/loveonce.mp3` is missing or fails to load, the system automatically activates a built-in multi-oscillator romantic chord synthesizer (`DbMaj9 -> Bbm9 -> GbMaj7 -> Abadd9`) via the Web Audio API so romantic music plays without fail under any circumstance.

---

## 🌹 Website Sections & Animations

1. **Hero Section**: Glowing romantic typography, stats badges, interactive CTA buttons.
2. **The Enchanted Garden**: Canvas-rendered procedural blooming roses swaying in the breeze with glowing fireflies and bloom controls.
3. **The "I LOVE YOU" Heart**: Parametric mathematical heart ($x = 16\sin^3(t)$, $y = -(13\cos(t) - 5\cos(2t) - 2\cos(3t) - \cos(4t))$) formed by glowing, flowing "I LOVE YOU" particles.
4. **Reasons Why I Love You**: 6 glassmorphic 3D tilt cards with icons and heartfelt prose.
5. **Memories**: Polaroid-style glowing memory cards with romantic artwork and date tags.
6. **The Love Letter**: Interactive folded envelope with wax heart seal that unrolls a heartfelt letter.
7. **Celestial Love Meter**: Interactive love calculation with animated progress bar and 100% infinite rating.
8. **The Secret Surprise**: Modal dialog with glowing neon heart and deep emotional dedication.

---

## 🚀 How to Run the Website

### Option 1: One-Click Launch (Windows)
Double-click `Start-LoveOnce.bat` in the project folder.

### Option 2: Using Node.js
```bash
node serve.js
```
Then open your browser to:
[http://localhost:8899](http://localhost:8899)

### Option 3: Direct File Opening
You can also open `index.html` directly in any web browser.

---

## 📁 Project Structure

```
Love once/
├── index.html                  # Main LoveOnce romantic website
├── serve.js                    # Local streaming audio HTTP server
├── Start-LoveOnce.bat          # One-click desktop launcher
├── README.md                   # Complete documentation
└── assets/
    ├── css/
    │   └── style.css           # Romantic glassmorphism styles & animations
    ├── js/
    │   ├── music.js            # Romantic background music controller & Web Audio SFX
    │   ├── animations.js       # Background stars, flower garden & I LOVE YOU heart
    │   └── main.js             # Interactive event coordination & volume transitions
    └── music/
        └── loveonce.mp3        # Primary romantic music track (Indian Flute Melody - 100% Volume)
```
