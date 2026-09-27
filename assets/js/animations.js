/**
 * ============================================================================
 * LOVEONCE — ENHANCED ROMANTIC CANVAS & VISUAL ANIMATION ENGINE
 * ============================================================================
 * 1. Ambient Background (Starry Constellations + Interactive Mouse Glow + Drifting Hearts)
 * 2. Flower Garden Canvas (Living Blooming Roses + Falling Petals + Dynamic Fireflies)
 * 3. "I LOVE YOU" Parametric Heart (Concentric Neon Ripples + 3D Orbiting Particles + Flowing Typography)
 * 4. Interactive Romantic Cursor Sparkle & Heart Trail
 * 5. Scroll-driven Reveal Animations
 * ============================================================================
 */

// ============================================================================
// 1. AMBIENT BACKGROUND CANVAS
// ============================================================================
class AmbientCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.hearts = [];
    this.width = 0;
    this.height = 0;
    this.mouseX = -9999;
    this.mouseY = -9999;
    this.animId = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });

    // Generate Stars
    const starCount = Math.floor((this.width * this.height) / 9000);
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.3 ? '#ffffff' : (Math.random() > 0.5 ? '#ff85a1' : '#ffd166')
      });
    }

    // Generate Floating Ambient Hearts
    for (let i = 0; i < 22; i++) {
      this.hearts.push(this.createHeart());
    }

    this.render();
  }

  createHeart() {
    return {
      x: Math.random() * this.width,
      y: this.height + Math.random() * 120,
      size: Math.random() * 16 + 8,
      speedY: Math.random() * 0.85 + 0.35,
      speedX: (Math.random() - 0.5) * 0.5,
      alpha: Math.random() * 0.45 + 0.15,
      rotation: (Math.random() - 0.5) * 0.4,
      hue: Math.random() > 0.5 ? 345 : 330
    };
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Subtle Mouse Glow
    if (this.mouseX > 0 && this.mouseY > 0) {
      const mouseGrad = this.ctx.createRadialGradient(
        this.mouseX, this.mouseY, 10,
        this.mouseX, this.mouseY, 260
      );
      mouseGrad.addColorStop(0, 'rgba(255, 26, 83, 0.08)');
      mouseGrad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = mouseGrad;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Draw Stars
    this.stars.forEach((star) => {
      star.phase += star.speed;
      const twinkle = (Math.sin(star.phase) + 1) / 2;
      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = star.alpha * (0.3 + twinkle * 0.7);
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;

    // Draw Ambient Floating Hearts
    this.hearts.forEach((h, idx) => {
      h.y -= h.speedY;
      h.x += h.speedX;

      if (h.y < -35) {
        this.hearts[idx] = this.createHeart();
      }

      this.ctx.save();
      this.ctx.translate(h.x, h.y);
      this.ctx.rotate(h.rotation);
      this.ctx.scale(h.size / 20, h.size / 20);
      this.ctx.fillStyle = `hsla(${h.hue}, 100%, 75%, ${h.alpha})`;
      this.ctx.shadowColor = `hsla(${h.hue}, 100%, 60%, 0.6)`;
      this.ctx.shadowBlur = 12;

      // Heart Path
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.bezierCurveTo(-10, -10, -20, 5, 0, 20);
      this.ctx.bezierCurveTo(20, 5, 10, -10, 0, 0);
      this.ctx.fill();

      this.ctx.restore();
    });

    this.animId = requestAnimationFrame(() => this.render());
  }
}

// ============================================================================
// 2. FLOWER GARDEN CANVAS (Living Roses + Drifting Petals + Fireflies)
// ============================================================================
class FlowerGardenCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.roses = [];
    this.fallingPetals = [];
    this.fireflies = [];
    this.breeze = 0;
    this.animId = null;
    this.isVisible = true;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    this.generateRoses();

    // Drifting Falling Petals in Garden
    for (let i = 0; i < 20; i++) {
      this.fallingPetals.push(this.createFallingPetal());
    }

    // Fireflies
    for (let i = 0; i < 35; i++) {
      this.fireflies.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        size: Math.random() * 3 + 1.2,
        phase: Math.random() * Math.PI * 2
      });
    }

    const observer = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
      if (this.isVisible && !this.animId) {
        this.render();
      }
    }, { threshold: 0.1 });
    observer.observe(this.canvas);

    this.render();
  }

  createFallingPetal() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * -100,
      size: Math.random() * 8 + 6,
      vx: (Math.random() - 0.3) * 0.8,
      vy: Math.random() * 1.2 + 0.6,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.04,
      hue: 345 + (Math.random() - 0.5) * 15
    };
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || this.canvas.parentElement.clientWidth || 800;
    this.height = rect.height || 480;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.generateRoses();
  }

  generateRoses() {
    this.roses = [];
    const count = Math.max(3, Math.min(6, Math.floor(this.width / 150)));
    const step = this.width / (count + 1);

    for (let i = 1; i <= count; i++) {
      this.roses.push({
        baseX: step * i + (Math.random() - 0.5) * 35,
        baseY: this.height - 10,
        height: this.height * (0.55 + Math.random() * 0.28),
        bloomScale: 0.9 + Math.random() * 0.45,
        swaySpeed: 0.015 + Math.random() * 0.01,
        swayPhase: Math.random() * Math.PI * 2,
        petals: 18 + Math.floor(Math.random() * 6),
        colorHue: 345 + (Math.random() - 0.5) * 16
      });
    }
  }

  bloomMore() {
    this.roses.forEach(r => {
      r.bloomScale = Math.min(1.8, r.bloomScale + 0.2);
    });
    // Add extra petals burst
    for (let i = 0; i < 15; i++) {
      this.fallingPetals.push(this.createFallingPetal());
    }
  }

  render() {
    if (!this.isVisible) {
      this.animId = null;
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.breeze += 0.014;

    // Draw Drifting Petals in background
    this.fallingPetals.forEach((p, idx) => {
      p.y += p.vy;
      p.x += Math.sin(this.breeze + idx) * 0.7 + p.vx;
      p.rotation += p.vRot;

      if (p.y > this.height + 20 || p.x < -20 || p.x > this.width + 20) {
        this.fallingPetals[idx] = this.createFallingPetal();
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, 0.75)`;
      this.ctx.shadowColor = `hsla(${p.hue}, 100%, 55%, 0.5)`;
      this.ctx.shadowBlur = 6;
      this.ctx.fill();
      this.ctx.restore();
    });

    // Draw Roses
    this.roses.forEach((rose) => {
      const sway = Math.sin(this.breeze * 1.6 + rose.swayPhase) * 24;
      const headX = rose.baseX + sway;
      const headY = rose.baseY - rose.height;

      // Stem (Curved Glowing Green Vine)
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(rose.baseX, rose.baseY);
      const cpX = rose.baseX + sway * 0.35;
      const cpY = rose.baseY - rose.height * 0.5;
      this.ctx.quadraticCurveTo(cpX, cpY, headX, headY);
      this.ctx.lineWidth = 4.5;
      this.ctx.strokeStyle = '#2b9348';
      this.ctx.shadowColor = 'rgba(43, 147, 72, 0.4)';
      this.ctx.shadowBlur = 8;
      this.ctx.stroke();

      // Leaves
      this.drawLeaf(cpX - 14, cpY, -0.45);
      this.drawLeaf(cpX + 14, cpY - 45, 0.45);

      // Rose Blossom (Layered Petals with breathing bloom)
      const breathing = Math.sin(this.breeze * 2 + rose.swayPhase) * 0.05;
      this.drawRoseBlossom(headX, headY, rose.bloomScale + breathing, rose.petals, rose.colorHue);

      this.ctx.restore();
    });

    // Draw Fireflies
    this.fireflies.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;
      f.phase += 0.035;

      if (f.x < 0) f.x = this.width;
      if (f.x > this.width) f.x = 0;
      if (f.y < 0) f.y = this.height;
      if (f.y > this.height) f.y = 0;

      const glow = (Math.sin(f.phase) + 1) / 2;
      this.ctx.fillStyle = `rgba(255, 230, 160, ${0.45 + glow * 0.55})`;
      this.ctx.shadowColor = 'rgba(255, 210, 100, 0.95)';
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.size * (0.8 + glow * 0.5), 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.animId = requestAnimationFrame(() => this.render());
  }

  drawLeaf(x, y, angle) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = '#55a630';
    this.ctx.shadowColor = '#2b9348';
    this.ctx.shadowBlur = 6;
    this.ctx.fill();
    this.ctx.restore();
  }

  drawRoseBlossom(x, y, scale, petalCount, hue) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.scale(scale, scale);

    // Glowing Neon Aura
    this.ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
    this.ctx.shadowBlur = 24;

    for (let i = petalCount; i > 0; i--) {
      const radius = i * 2.3;
      const angle = i * 0.78;
      const px = Math.cos(angle) * (radius * 0.28);
      const py = Math.sin(angle) * (radius * 0.28);

      this.ctx.beginPath();
      this.ctx.arc(px, py, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsl(${hue}, 88%, ${20 + i * 2.3}%)`;
      this.ctx.fill();

      this.ctx.strokeStyle = `hsl(${hue}, 100%, 78%)`;
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();
    }

    // Rose Core Center
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffd166';
    this.ctx.shadowColor = '#ffd166';
    this.ctx.shadowBlur = 10;
    this.ctx.fill();

    this.ctx.restore();
  }
}

// ============================================================================
// 3. ENHANCED "I LOVE YOU" PARAMETRIC HEART
// Concentric Pulsing Love Ripples + 3D Orbiting Starlight + Glowing Typography
// ============================================================================
class ILoveYouHeartCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.orbitParticles = [];
    this.ripples = [];
    this.phrase = "I LOVE YOU";
    this.time = 0;
    this.pulseSpeed = 1;
    this.animId = null;
    this.isVisible = true;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Parametric Heart Contour Particles
    const totalPoints = 110;
    for (let i = 0; i < totalPoints; i++) {
      const t = (i / totalPoints) * Math.PI * 2;
      this.particles.push({
        t: t,
        charIndex: i % this.phrase.length,
        speedOffset: 0.005 + (i % 3) * 0.002
      });
    }

    // 3D Celestial Orbiting Love Particles
    for (let i = 0; i < 40; i++) {
      this.orbitParticles.push({
        angle: Math.random() * Math.PI * 2,
        radiusX: Math.random() * 180 + 100,
        radiusY: Math.random() * 70 + 40,
        speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 3 + 1.5,
        tilt: (Math.random() - 0.5) * 0.6,
        color: Math.random() > 0.4 ? '#ff5e8a' : '#ffd166'
      });
    }

    const observer = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
      if (this.isVisible && !this.animId) {
        this.render();
      }
    }, { threshold: 0.1 });
    observer.observe(this.canvas);

    this.render();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || this.canvas.parentElement.clientWidth || 800;
    this.height = rect.height || 520;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  getHeartCoords(t, scale) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return {
      x: this.width / 2 + x * scale,
      y: this.height / 2 + y * scale
    };
  }

  render() {
    if (!this.isVisible) {
      this.animId = null;
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.time += 0.022 * this.pulseSpeed;

    // Heartbeat Rhythm Scale
    const heartbeat = Math.sin(this.time * 3);
    const beatMultiplier = heartbeat > 0.35 ? 1 + (heartbeat - 0.35) * 0.3 : 1;
    const baseScale = Math.min(this.width, this.height) / 38 * beatMultiplier;

    // Spawn concentric ripples on beat
    if (heartbeat > 0.85 && (!this.lastBeat || Date.now() - this.lastBeat > 600)) {
      this.lastBeat = Date.now();
      this.ripples.push({ scale: baseScale * 0.8, alpha: 0.7 });
    }

    // Draw Expanding Concentric Love Waves (Ripples)
    this.ripples.forEach((rip, idx) => {
      rip.scale += 2.5;
      rip.alpha -= 0.015;

      if (rip.alpha <= 0) {
        this.ripples.splice(idx, 1);
        return;
      }

      this.ctx.save();
      this.ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const t = (i / 60) * Math.PI * 2;
        const pt = this.getHeartCoords(t, rip.scale);
        if (i === 0) this.ctx.moveTo(pt.x, pt.y);
        else this.ctx.lineTo(pt.x, pt.y);
      }
      this.ctx.strokeStyle = `rgba(255, 26, 83, ${rip.alpha * 0.6})`;
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = '#ff1a53';
      this.ctx.shadowBlur = 15;
      this.ctx.stroke();
      this.ctx.restore();
    });

    // Background Glow
    this.ctx.save();
    const radGrad = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 10,
      this.width / 2, this.height / 2, baseScale * 18
    );
    radGrad.addColorStop(0, 'rgba(255, 26, 83, 0.28)');
    radGrad.addColorStop(0.5, 'rgba(255, 94, 138, 0.1)');
    radGrad.addColorStop(1, 'transparent');
    this.ctx.fillStyle = radGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();

    // Draw 3D Orbiting Love Particles behind heart
    this.drawOrbits(false);

    // Render "I LOVE YOU" Typography Particles
    this.ctx.font = '700 15px "Outfit", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.particles.forEach((p, idx) => {
      p.t += p.speedOffset * this.pulseSpeed;
      if (p.t > Math.PI * 2) p.t -= Math.PI * 2;

      const pos = this.getHeartCoords(p.t, baseScale);
      const nextPos = this.getHeartCoords(p.t + 0.05, baseScale);
      const angle = Math.atan2(nextPos.y - pos.y, nextPos.x - pos.x);

      const char = this.phrase[p.charIndex];

      this.ctx.save();
      this.ctx.translate(pos.x, pos.y);
      this.ctx.rotate(angle);

      // Neon Pink & Deep Rose Glow
      this.ctx.shadowColor = 'rgba(255, 50, 120, 0.95)';
      this.ctx.shadowBlur = 14;

      const hue = 335 + Math.sin(this.time * 2 + idx * 0.12) * 25;
      this.ctx.fillStyle = `hsl(${hue}, 100%, 75%)`;
      this.ctx.fillText(char, 0, 0);

      this.ctx.restore();
    });

    // Center Core Heart Text with pulsating glow
    this.ctx.save();
    this.ctx.font = '700 clamp(1.5rem, 3.8vw, 2.4rem) "Playfair Display", serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#ff1a53';
    this.ctx.shadowBlur = 30;
    this.ctx.fillText("I LOVE YOU", this.width / 2, this.height / 2 - 10);

    this.ctx.font = 'italic clamp(1rem, 2.2vw, 1.35rem) "Dancing Script", cursive';
    this.ctx.fillStyle = '#ffd166';
    this.ctx.shadowColor = '#ffd166';
    this.ctx.shadowBlur = 15;
    this.ctx.fillText("Forever & Always", this.width / 2, this.height / 2 + 25);
    this.ctx.restore();

    // Draw 3D Orbiting Love Particles in front of heart
    this.drawOrbits(true);

    this.animId = requestAnimationFrame(() => this.render());
  }

  drawOrbits(frontPass) {
    this.ctx.save();
    this.orbitParticles.forEach(orb => {
      orb.angle += orb.speed;
      const isFront = Math.sin(orb.angle) > 0;

      if (frontPass !== isFront) return;

      const x = this.width / 2 + Math.cos(orb.angle) * orb.radiusX;
      const y = this.height / 2 + Math.sin(orb.angle) * orb.radiusY + (x - this.width / 2) * orb.tilt;

      this.ctx.beginPath();
      this.ctx.arc(x, y, orb.size, 0, Math.PI * 2);
      this.ctx.fillStyle = orb.color;
      this.ctx.shadowColor = orb.color;
      this.ctx.shadowBlur = 12;
      this.ctx.fill();
    });
    this.ctx.restore();
  }
}

// ============================================================================
// 4. INTERACTIVE ROMANTIC CURSOR TRAIL (Hearts & Fairy Sparkles)
// ============================================================================
function initCursorLoveTrail() {
  let lastSpawn = 0;
  const emojis = ['✨', '💖', '🌸', '💗', '⭐'];

  const onPointerMove = (e) => {
    const now = Date.now();
    if (now - lastSpawn < 45) return; // 45ms throttle for smooth 60fps
    lastSpawn = now;

    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    if (!x || !y) return;

    const spark = document.createElement('div');
    spark.className = 'cursor-heart-trail';
    spark.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.fontSize = `${Math.random() * 12 + 10}px`;
    spark.style.setProperty('--dx', `${(Math.random() - 0.5) * 30}px`);
    spark.style.setProperty('--rot', `${(Math.random() - 0.5) * 45}deg`);

    document.body.appendChild(spark);

    spark.addEventListener('animationend', () => {
      spark.remove();
    });
  };

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
}

// ============================================================================
// 5. SCROLL REVEAL ANIMATIONS
// ============================================================================
function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.reason-card, .memory-polaroid, .garden-card-wrapper, .heart-card-wrapper, .envelope-card, .meter-card, .surprise-card, .section-header'
  );

  elements.forEach((el) => {
    el.classList.add('reveal-fade-up');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  elements.forEach((el) => observer.observe(el));
}

// ============================================================================
// 6. ROMANTIC RAIN ENGINE (Confetti & Petals)
// ============================================================================
function triggerRomanticRain(durationMs = 4000) {
  const container = document.body;
  const petalSymbols = ['🌸', '🌹', '💖', '✨', '💗', '❤️', '🕊️', '💐'];
  const startTime = Date.now();

  const spawnInterval = setInterval(() => {
    if (Date.now() - startTime > durationMs) {
      clearInterval(spawnInterval);
      return;
    }

    for (let i = 0; i < 4; i++) {
      const petal = document.createElement('div');
      petal.className = 'rain-petal-particle';
      petal.textContent = petalSymbols[Math.floor(Math.random() * petalSymbols.length)];
      petal.style.left = `${Math.random() * 100}vw`;
      petal.style.fontSize = `${Math.random() * 20 + 16}px`;
      petal.style.animationDuration = `${Math.random() * 2.5 + 2.2}s`;
      petal.style.setProperty('--sway-x', `${(Math.random() - 0.5) * 180}px`);
      petal.style.setProperty('--rot-end', `${(Math.random() - 0.5) * 720}deg`);

      container.appendChild(petal);

      petal.addEventListener('animationend', () => {
        petal.remove();
      });
    }
  }, 100);
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.ambientCanvas = new AmbientCanvas('ambientCanvas');
  window.flowerGarden = new FlowerGardenCanvas('flowerCanvas');
  window.loveHeart = new ILoveYouHeartCanvas('heartCanvas');
  initCursorLoveTrail();
  initScrollReveal();
});
