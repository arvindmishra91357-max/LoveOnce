/**
 * ============================================================================
 * LOVEONCE — ROMANTIC BACKGROUND MUSIC SYSTEM
 * ============================================================================
 * Features:
 * - HTML5 Audio with seamless looping & volume memory (localStorage)
 * - Browser Autoplay Policy compliant (graceful fallback + first-interaction start)
 * - Glassmorphic floating button with animated equalizer & tooltip
 * - Interactive Volume Control Panel (Play/Pause, Slider, Mute, Power Toggle)
 * - Dynamic volume swell for Love Letter & Final Surprise
 * - Subtle Web Audio API chime sound effects for interactive romantic buttons
 * - Fail-safe Web Audio romantic ambient synthesizer fallback if MP3 is missing
 * ============================================================================
 */

class LoveOnceMusicSystem {
  constructor() {
    // DOM Elements
    this.audio = document.getElementById('loveOnceMusic');
    this.floatingBtn = document.getElementById('floatingMusicBtn');
    this.musicPanel = document.getElementById('musicPanel');
    this.musicTooltip = document.getElementById('musicTooltip');
    this.panelPlayBtn = document.getElementById('panelPlayBtn');
    this.panelToggleBtn = document.getElementById('panelToggleBtn');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.volumeVal = document.getElementById('volumeVal');
    this.muteBtn = document.getElementById('muteBtn');
    this.panelCloseBtn = document.getElementById('panelCloseBtn');
    this.welcomeOverlay = document.getElementById('welcomeOverlay');
    this.welcomeEnterBtn = document.getElementById('welcomeEnterBtn');

    // Storage Keys
    this.STORAGE_KEY_ENABLED = 'loveonceMusicEnabled';
    this.STORAGE_KEY_VOLUME = 'loveonceMusicVolume';

    // State - Permanent 100% Volume
    const savedEnabled = localStorage.getItem(this.STORAGE_KEY_ENABLED);
    this.musicEnabled = savedEnabled !== 'false'; // Enabled by default
    
    // Always default to 100% (1.0) volume
    const savedVol = localStorage.getItem(this.STORAGE_KEY_VOLUME);
    this.savedVolume = (savedVol !== null && !isNaN(Number(savedVol))) ? Number(savedVol) : 1.0;
    
    // Ensure permanent 100% if not previously explicitly adjusted
    if (savedVol === null) {
      this.savedVolume = 1.0;
      localStorage.setItem(this.STORAGE_KEY_VOLUME, '1.0');
    }
    
    this.currentVolume = this.savedVolume;
    this.isMuted = false;
    this.isPlaying = false;
    this.hasUserInteracted = false;
    this.isPanelOpen = false;
    this.isSwellActive = false;

    // Web Audio Fallback & Sound Effects Context
    this.audioCtx = null;
    this.synthRunning = false;
    this.synthGain = null;

    // Initialize
    this.init();
  }

  /**
   * Main Initialization
   */
  init() {
    if (!this.audio) {
      console.warn('[LoveOnce Music] Audio element #loveOnceMusic not found');
      return;
    }

    // Configure Audio Element
    this.audio.loop = true;
    this.audio.volume = this.savedVolume;

    // Update Slider UI
    if (this.volumeSlider) {
      this.volumeSlider.value = Math.round(this.savedVolume * 100);
    }
    if (this.volumeVal) {
      this.volumeVal.textContent = `${Math.round(this.savedVolume * 100)}%`;
    }

    // Bind Event Listeners
    this.bindEvents();

    // Check Autoplay Policy
    if (this.musicEnabled) {
      this.attemptInitialPlayback();
    } else {
      this.updateUIState(false);
      this.dismissWelcomeOverlay();
    }
  }

  /**
   * Bind all UI and Window Event Listeners
   */
  bindEvents() {
    // 1. Floating Music Button Click -> Toggles Control Panel
    if (this.floatingBtn) {
      this.floatingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel();
      });
    }

    // 2. Panel Close Button
    if (this.panelCloseBtn) {
      this.panelCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closePanel();
      });
    }

    // 3. Close panel when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (this.isPanelOpen && this.musicPanel && !this.musicPanel.contains(e.target) && e.target !== this.floatingBtn) {
        this.closePanel();
      }
    });

    // 4. Panel Play/Pause Button
    if (this.panelPlayBtn) {
      this.panelPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlayPause();
      });
    }

    // 5. Panel Music On/Off Toggle Button
    if (this.panelToggleBtn) {
      this.panelToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMusicMaster();
      });
    }

    // 6. Volume Slider Input
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value) / 100;
        this.setVolume(val);
      });
    }

    // 7. Mute Button
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMute();
      });
    }

    // 8. Welcome First-Interaction Modal Button
    if (this.welcomeEnterBtn) {
      this.welcomeEnterBtn.addEventListener('click', () => {
        this.handleFirstUserInteraction();
      });
    }

    // 9. Document First Click / Touch Fallback for Autoplay Unblock
    const startAudioOnFirstTouch = () => {
      if (!this.hasUserInteracted) {
        this.handleFirstUserInteraction();
      }
      window.removeEventListener('pointerdown', startAudioOnFirstTouch);
      window.removeEventListener('keydown', startAudioOnFirstTouch);
      window.removeEventListener('touchstart', startAudioOnFirstTouch);
    };

    window.addEventListener('pointerdown', startAudioOnFirstTouch, { passive: true });
    window.addEventListener('keydown', startAudioOnFirstTouch, { passive: true });
    window.addEventListener('touchstart', startAudioOnFirstTouch, { passive: true });

    // 10. Native Audio Event Handlers
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateUIState(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateUIState(false);
    });

    this.audio.addEventListener('error', (err) => {
      // If MP3 fails to load, gracefully fallback to Web Audio romantic synth
      console.info('[LoveOnce Music] Primary audio source not found or format unsupported. Engaging romantic ambient synthesizer.');
      this.startRomanticSynthFallback();
    });
  }

  /**
   * Attempt Initial Playback (Autoplay)
   */
  attemptInitialPlayback() {
    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay succeeded!
          this.isPlaying = true;
          this.hasUserInteracted = true;
          this.updateUIState(true);
          this.dismissWelcomeOverlay();
        })
        .catch(() => {
          // Autoplay blocked by browser policy — gracefully wait for user interaction
          this.isPlaying = false;
          this.updateUIState(false);
          // Keep welcome overlay visible so user can tap to enter
        });
    }
  }

  /**
   * Handle First User Interaction (Click/Touch)
   */
  handleFirstUserInteraction() {
    this.hasUserInteracted = true;
    this.dismissWelcomeOverlay();

    if (this.musicEnabled) {
      this.playMusic();
    }
    // Initialize Web Audio Context on first interaction
    this.initAudioContext();
  }

  /**
   * Dismiss the Welcome Overlay smoothly
   */
  dismissWelcomeOverlay() {
    if (this.welcomeOverlay && !this.welcomeOverlay.classList.contains('hidden')) {
      this.welcomeOverlay.classList.add('hidden');
    }
  }

  /**
   * Play Music with gentle volume fade-in
   */
  playMusic() {
    this.musicEnabled = true;
    localStorage.setItem(this.STORAGE_KEY_ENABLED, 'true');

    if (this.synthRunning) {
      this.resumeRomanticSynth();
      this.isPlaying = true;
      this.updateUIState(true);
      return;
    }

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.fadeVolume(this.savedVolume, 1000);
          this.updateUIState(true);
          this.showTooltip('💗 🎵 Playing Love');
        })
        .catch((err) => {
          console.info('[LoveOnce Music] Audio playback blocked or waiting: ', err.message);
          this.startRomanticSynthFallback();
        });
    }
  }

  /**
   * Pause Music smoothly
   */
  pauseMusic() {
    this.fadeVolume(0, 300, () => {
      this.audio.pause();
      if (this.synthRunning) {
        this.pauseRomanticSynth();
      }
      this.isPlaying = false;
      this.updateUIState(false);
      this.showTooltip('🔇 Music Off');
    });
  }

  /**
   * Toggle Play / Pause
   */
  togglePlayPause() {
    if (this.isPlaying) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }
  }

  /**
   * Toggle Master Music Enabled State (Power switch in panel)
   */
  toggleMusicMaster() {
    if (this.musicEnabled && this.isPlaying) {
      this.musicEnabled = false;
      localStorage.setItem(this.STORAGE_KEY_ENABLED, 'false');
      this.pauseMusic();
    } else {
      this.musicEnabled = true;
      localStorage.setItem(this.STORAGE_KEY_ENABLED, 'true');
      this.playMusic();
    }
  }

  /**
   * Toggle Mute / Unmute
   */
  toggleMute() {
    if (this.isMuted) {
      this.isMuted = false;
      this.audio.muted = false;
      this.setVolume(this.savedVolume > 0 ? this.savedVolume : 1.0);
      if (this.muteBtn) this.muteBtn.textContent = '🔊';
      this.showTooltip('🔊 Unmuted (100%)');
    } else {
      this.isMuted = true;
      this.audio.muted = true;
      if (this.muteBtn) this.muteBtn.textContent = '🔇';
      this.showTooltip('🔇 Muted');
    }
  }

  /**
   * Set Music Volume (0.0 to 1.0)
   */
  setVolume(vol) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.currentVolume = clamped;
    this.savedVolume = clamped;
    this.audio.volume = clamped;

    if (this.synthGain) {
      this.synthGain.gain.setValueAtTime(clamped * 0.35, this.audioCtx.currentTime);
    }

    // Save preference permanently
    localStorage.setItem(this.STORAGE_KEY_VOLUME, clamped.toFixed(2));

    // Update UI elements
    if (this.volumeSlider) {
      this.volumeSlider.value = Math.round(clamped * 100);
    }
    if (this.volumeVal) {
      this.volumeVal.textContent = `${Math.round(clamped * 100)}%`;
    }

    if (clamped === 0) {
      this.isMuted = true;
      if (this.muteBtn) this.muteBtn.textContent = '🔇';
    } else {
      this.isMuted = false;
      if (this.muteBtn) this.muteBtn.textContent = '🔊';
    }
  }

  /**
   * Fade Volume smoothly over time (in milliseconds)
   */
  fadeVolume(targetVol, durationMs = 800, onComplete = null) {
    const startVol = this.audio.volume;
    const diff = targetVol - startVol;
    const steps = 24;
    const stepTime = durationMs / steps;
    let stepCount = 0;

    const interval = setInterval(() => {
      stepCount++;
      const progress = stepCount / steps;
      this.audio.volume = Math.max(0, Math.min(1, startVol + diff * progress));

      if (stepCount >= steps) {
        clearInterval(interval);
        this.audio.volume = Math.max(0, Math.min(1, targetVol));
        if (onComplete) onComplete();
      }
    }, stepTime);
  }

  /**
   * Cinematic Volume Swell (Used for Love Letter & Final Surprise)
   */
  cinematicSwell(boostFactor = 1.2) {
    if (!this.isPlaying) return;
    this.isSwellActive = true;
    const target = Math.min(1.0, this.savedVolume * boostFactor);
    this.fadeVolume(target, 1200);
  }

  /**
   * Restore Volume from Cinematic Swell back to normal
   */
  restoreVolume() {
    if (!this.isSwellActive) return;
    this.isSwellActive = false;
    this.fadeVolume(this.savedVolume, 1000);
  }

  /**
   * Toggle Floating Music Control Panel
   */
  togglePanel() {
    if (this.isPanelOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    this.isPanelOpen = true;
    if (this.musicPanel) {
      this.musicPanel.classList.add('active');
      this.musicPanel.setAttribute('aria-hidden', 'false');
    }
  }

  closePanel() {
    this.isPanelOpen = false;
    if (this.musicPanel) {
      this.musicPanel.classList.remove('active');
      this.musicPanel.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Show temporary tooltip on floating button
   */
  showTooltip(text, duration = 2500) {
    if (!this.musicTooltip) return;
    this.musicTooltip.textContent = text;
    this.musicTooltip.classList.add('show-temporarily');

    clearTimeout(this._tooltipTimeout);
    this._tooltipTimeout = setTimeout(() => {
      this.musicTooltip.classList.remove('show-temporarily');
    }, duration);
  }

  /**
   * Update Visual UI State (Button pulse, Equalizer, Tooltip text)
   */
  updateUIState(isPlaying) {
    if (this.floatingBtn) {
      if (isPlaying) {
        this.floatingBtn.classList.add('playing');
        this.floatingBtn.classList.remove('paused');
        this.floatingBtn.setAttribute('title', 'Playing Love (Click for Controls)');
      } else {
        this.floatingBtn.classList.remove('playing');
        this.floatingBtn.classList.add('paused');
        this.floatingBtn.setAttribute('title', 'Music Off (Click for Controls)');
      }
    }

    if (this.panelPlayBtn) {
      this.panelPlayBtn.textContent = isPlaying ? '⏸' : '▶';
    }

    if (this.panelToggleBtn) {
      this.panelToggleBtn.innerHTML = this.musicEnabled ? '<span>💗</span> Music On' : '<span>♡</span> Music Off';
    }

    if (this.musicTooltip) {
      this.musicTooltip.textContent = isPlaying ? '💗 🎵 Playing Love' : '🔇 Music Off';
    }
  }

  // ==========================================================================
  // WEB AUDIO SOUND EFFECTS (SUBTLE UI CHIMES)
  // ==========================================================================
  initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Play Gentle Celesta / Harp Chime (Used for "Send Me A Heart")
   */
  playChime() {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Soft Pentatonic Harp Notes
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const freq = notes[Math.floor(Math.random() * notes.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (_) {}
  }

  /**
   * Play Romantic Sparkle (Used for "Make It Rain Love")
   */
  playSparkle() {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const baseNow = this.audioCtx.currentTime;
      const arpeggio = [523.25, 659.25, 783.99, 987.77, 1046.5]; // C5, E5, G5, B5, C6

      arpeggio.forEach((f, idx) => {
        const time = baseNow + idx * 0.08;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, time);

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(time);
        osc.stop(time + 0.8);
      });
    } catch (_) {}
  }

  // ==========================================================================
  // ROMANTIC AMBIENT SYNTHESIZER FALLBACK
  // Active only if MP3 file is completely missing or blocked by host
  // ==========================================================================
  startRomanticSynthFallback() {
    try {
      this.initAudioContext();
      if (!this.audioCtx || this.synthRunning) return;

      this.synthRunning = true;
      this.synthGain = this.audioCtx.createGain();
      this.synthGain.gain.setValueAtTime(this.savedVolume * 0.22, this.audioCtx.currentTime);
      this.synthGain.connect(this.audioCtx.destination);

      // Romantic Chord Progression: DbMaj9 -> Bbm9 -> GbMaj7 -> Abadd9
      const chords = [
        [277.18, 349.23, 415.30, 523.25, 622.25], // DbMaj9
        [233.08, 277.18, 349.23, 415.30, 523.25], // Bbm9
        [185.00, 277.18, 349.23, 415.30],         // GbMaj7
        [207.65, 261.63, 311.13, 466.16]          // Abadd9
      ];

      let chordIndex = 0;

      const playNextChord = () => {
        if (!this.synthRunning) return;
        const chord = chords[chordIndex];
        const now = this.audioCtx.currentTime;

        chord.forEach((freq) => {
          const osc = this.audioCtx.createOscillator();
          const noteGain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          // Ethereal slow attack & long gentle release
          noteGain.gain.setValueAtTime(0.001, now);
          noteGain.gain.linearRampToValueAtTime(0.04, now + 1.8);
          noteGain.gain.linearRampToValueAtTime(0.001, now + 6.0);

          osc.connect(noteGain);
          noteGain.connect(this.synthGain);

          osc.start(now);
          osc.stop(now + 6.2);
        });

        chordIndex = (chordIndex + 1) % chords.length;
        this._synthTimeout = setTimeout(playNextChord, 5200);
      };

      playNextChord();
      this.isPlaying = true;
      this.updateUIState(true);
    } catch (_) {}
  }

  pauseRomanticSynth() {
    if (this.synthGain && this.audioCtx) {
      this.synthGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
    }
    clearTimeout(this._synthTimeout);
  }

  resumeRomanticSynth() {
    if (this.synthGain && this.audioCtx) {
      this.synthGain.gain.setValueAtTime(this.savedVolume * 0.22, this.audioCtx.currentTime);
    }
    if (!this.synthRunning) {
      this.startRomanticSynthFallback();
    }
  }
}

// Global instance for cross-script interaction
window.loveOnceMusic = new LoveOnceMusicSystem();
