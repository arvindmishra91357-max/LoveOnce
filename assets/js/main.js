/**
 * ============================================================================
 * LOVEONCE — MAIN APPLICATION LOGIC & ROMANTIC INTERACTIONS
 * ============================================================================
 * Coordinates page interactions with the background music system:
 * - "Send Me A Heart" floating particles & chime
 * - "Make It Rain Love" petals/confetti rain & sparkle
 * - Love Letter unfolding with cinematic audio volume swell
 * - Celestial Love Meter calculation
 * - Secret Romantic Surprise modal with emotional volume transition
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const sendHeartBtns = document.querySelectorAll('.btn-send-heart');
  const makeRainBtns = document.querySelectorAll('.btn-make-rain');
  const openLetterBtn = document.getElementById('openLetterBtn');
  const letterEnvelope = document.getElementById('letterEnvelope');
  const unfoldedLetter = document.getElementById('unfoldedLetter');
  const closeLetterBtn = document.getElementById('closeLetterBtn');
  const calculateMeterBtn = document.getElementById('calculateMeterBtn');
  const meterProgressFill = document.getElementById('meterProgressFill');
  const meterResultNumber = document.getElementById('meterResultNumber');
  const meterResultDesc = document.getElementById('meterResultDesc');
  const revealSurpriseBtn = document.getElementById('revealSurpriseBtn');
  const surpriseModal = document.getElementById('surpriseModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const closeSurpriseBtn = document.getElementById('closeSurpriseBtn');
  const bloomRosesBtn = document.getElementById('bloomRosesBtn');
  const scatterPetalsBtn = document.getElementById('scatterPetalsBtn');

  // ==========================================================================
  // 1. "SEND ME A HEART" INTERACTION
  // ==========================================================================
  sendHeartBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      // Play soft chime sound effect
      if (window.loveOnceMusic) {
        window.loveOnceMusic.playChime();
      }

      // Spawn floating glowing heart at click position
      const rect = btn.getBoundingClientRect();
      const originX = e.clientX || (rect.left + rect.width / 2);
      const originY = e.clientY || (rect.top + rect.height / 2);

      for (let i = 0; i < 6; i++) {
        spawnFloatingHeart(originX, originY);
      }
    });
  });

  function spawnFloatingHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart-particle';
    const emojis = ['💖', '💗', '❤️', '💕', '💞', '💘', '✨'];
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.fontSize = `${Math.random() * 16 + 18}px`;
    heart.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 80}px`);
    heart.style.setProperty('--rot', `${(Math.random() - 0.5) * 50}deg`);

    document.body.appendChild(heart);

    heart.addEventListener('animationend', () => {
      heart.remove();
    });
  }

  // ==========================================================================
  // 2. "MAKE IT RAIN LOVE" INTERACTION
  // ==========================================================================
  makeRainBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Play sparkle sound effect
      if (window.loveOnceMusic) {
        window.loveOnceMusic.playSparkle();
      }

      // Trigger full screen rain
      if (typeof triggerRomanticRain === 'function') {
        triggerRomanticRain(4500);
      }
    });
  });

  // ==========================================================================
  // 3. FLOWER GARDEN INTERACTION CONTROLS
  // ==========================================================================
  if (bloomRosesBtn) {
    bloomRosesBtn.addEventListener('click', () => {
      if (window.flowerGarden) {
        window.flowerGarden.bloomMore();
      }
      if (window.loveOnceMusic) {
        window.loveOnceMusic.playChime();
      }
    });
  }

  if (scatterPetalsBtn) {
    scatterPetalsBtn.addEventListener('click', () => {
      if (typeof triggerRomanticRain === 'function') {
        triggerRomanticRain(3000);
      }
      if (window.loveOnceMusic) {
        window.loveOnceMusic.playSparkle();
      }
    });
  }

  // ==========================================================================
  // 4. LOVE LETTER INTERACTION (WITH CINEMATIC AUDIO SWELL)
  // ==========================================================================
  if (openLetterBtn && letterEnvelope && unfoldedLetter) {
    const openLetter = () => {
      letterEnvelope.style.display = 'none';
      unfoldedLetter.classList.add('active');

      // Gently increase background music volume for a soft cinematic atmosphere
      if (window.loveOnceMusic) {
        window.loveOnceMusic.cinematicSwell(1.35);
        window.loveOnceMusic.playChime();
      }
    };

    openLetterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLetter();
    });
    letterEnvelope.addEventListener('click', openLetter);
  }

  if (closeLetterBtn && letterEnvelope && unfoldedLetter) {
    closeLetterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      unfoldedLetter.classList.remove('active');
      letterEnvelope.style.display = 'block';

      // Restore normal background volume
      if (window.loveOnceMusic) {
        window.loveOnceMusic.restoreVolume();
      }
    });
  }

  // ==========================================================================
  // 5. CELESTIAL LOVE METER
  // ==========================================================================
  if (calculateMeterBtn && meterProgressFill && meterResultNumber) {
    calculateMeterBtn.addEventListener('click', () => {
      if (window.loveOnceMusic) {
        window.loveOnceMusic.playSparkle();
      }

      // Reset
      meterProgressFill.style.width = '0%';
      meterResultNumber.textContent = '0%';

      let current = 0;
      const target = 100;
      const duration = 2000;
      const startTime = performance.now();

      const animateCounter = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(1, elapsed / duration);
        current = Math.floor(progress * target);
        meterResultNumber.textContent = `${current}%`;
        meterProgressFill.style.width = `${progress * 100}%`;

        if (progress < 1) {
          requestAnimationFrame(animateCounter);
        } else {
          meterResultNumber.textContent = '100% ♾️';
          if (meterResultDesc) {
            meterResultDesc.textContent = 'Destined for Infinite Eternity ✨';
          }
          if (typeof triggerRomanticRain === 'function') {
            triggerRomanticRain(3500);
          }
          if (window.loveOnceMusic) {
            window.loveOnceMusic.playChime();
          }
        }
      };

      requestAnimationFrame(animateCounter);
    });
  }

  // ==========================================================================
  // 6. FINAL SURPRISE MODAL (WITH CINEMATIC EMOTIONAL TRANSITION)
  // ==========================================================================
  const openSurpriseModal = () => {
    if (surpriseModal && modalBackdrop) {
      surpriseModal.classList.add('open');
      modalBackdrop.classList.add('open');

      // Emotional volume swell & celebration
      if (window.loveOnceMusic) {
        window.loveOnceMusic.cinematicSwell(1.4);
        window.loveOnceMusic.playSparkle();
      }

      if (typeof triggerRomanticRain === 'function') {
        triggerRomanticRain(5000);
      }
    }
  };

  const closeSurpriseModal = () => {
    if (surpriseModal && modalBackdrop) {
      surpriseModal.classList.remove('open');
      modalBackdrop.classList.remove('open');

      // Return background music back to normal background volume
      if (window.loveOnceMusic) {
        window.loveOnceMusic.restoreVolume();
      }
    }
  };

  if (revealSurpriseBtn) {
    revealSurpriseBtn.addEventListener('click', openSurpriseModal);
  }

  if (closeSurpriseBtn) {
    closeSurpriseBtn.addEventListener('click', closeSurpriseModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeSurpriseModal);
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && surpriseModal && surpriseModal.classList.contains('open')) {
      closeSurpriseModal();
    }
  });
});
