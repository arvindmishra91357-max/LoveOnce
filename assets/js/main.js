/**
 * ============================================================================
 * LOVEONCE — MAIN APPLICATION & ROMANTIC DIGITAL EXPERIENCE ENGINE
 * ============================================================================
 * Implements:
 * 1. PWA Service Worker Registration & Offline Caching
 * 2. Personalized Story Profile & Dynamic Content Population
 * 3. Interactive Digital Love Story Book (Desktop Two-Page & Mobile Swipe)
 * 4. Photo Upload, Ghibli-Inspired Watercolor Art Transformation & AI Captions
 * 5. Photo Book Timeline with Milestones
 * 6. Hidden Love Chat Room (Real-time SSE, Discovery, Reactions, Media, Search)
 * 7. Sender Dashboard / Story Creator
 * 8. Share Experience Modal (WhatsApp, Telegram, Web Share, Secret Keyword)
 * 9. Romantic Final Surprise Celebration
 * 10. Existing Romantic Canvas & Audio Interactions Preserved
 * ============================================================================
 */

// Global State
window.activeStory = null;
window.activeChatToken = null;
window.currentBookPage = 0;
let chatEventSource = null;

// ============================================================================
// 1. PWA SERVICE WORKER REGISTRATION
// ============================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('✨ [LoveOnce PWA] Service Worker registered:', reg.scope);
    }).catch((err) => {
      console.warn('⚠️ [LoveOnce PWA] Service Worker registration failed:', err);
    });
  });
}

// ============================================================================
// 2. HELPER: GHIBLI WATERCOLOR IMAGE STYLIZATION ENGINE
// ============================================================================
function transformToGhibliArt(imgElement) {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxDim = 1000;
      let w = imgElement.naturalWidth || imgElement.width || 600;
      let h = imgElement.naturalHeight || imgElement.height || 450;

      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;

      // 1. Draw base photo
      ctx.drawImage(imgElement, 0, 0, w, h);

      // 2. Watercolor Bilateral Softening Wash
      ctx.globalAlpha = 0.45;
      ctx.filter = 'blur(4px) saturate(140%) contrast(90%)';
      ctx.drawImage(canvas, 0, 0);

      // 3. Dreamy Warm Golden / Sunlight Color Grading (Ghibli Signature)
      ctx.globalAlpha = 0.35;
      ctx.globalCompositeOperation = 'soft-light';
      const sunGrad = ctx.createLinearGradient(0, 0, w, h);
      sunGrad.addColorStop(0, '#ffd166'); // Warm Golden
      sunGrad.addColorStop(0.5, '#ff85a1'); // Peach Pink
      sunGrad.addColorStop(1, '#6ee7b7'); // Lush Meadow Mint
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, w, h);

      // 4. Watercolor Edge Definition
      ctx.globalAlpha = 0.25;
      ctx.globalCompositeOperation = 'multiply';
      ctx.filter = 'contrast(160%) grayscale(40%)';
      ctx.drawImage(canvas, 0, 0);

      // 5. Restore Composite Operation and add gentle paper vignette
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.2;
      const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(40, 10, 30, 0.4)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    } catch (err) {
      console.warn('Canvas transformation fallback:', err);
      resolve(imgElement.src);
    }
  });
}

// ============================================================================
// 3. MAIN INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
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
  const surpriseAlwaysBtn = document.getElementById('surpriseAlwaysBtn');
  const surpriseForeverBtn = document.getElementById('surpriseForeverBtn');
  const bloomRosesBtn = document.getElementById('bloomRosesBtn');
  const scatterPetalsBtn = document.getElementById('scatterPetalsBtn');

  // Creator & Share Modals
  const openCreatorBtn = document.getElementById('openCreatorBtn');
  const heroStoryCreatorBtn = document.getElementById('heroStoryCreatorBtn');
  const creatorModal = document.getElementById('creatorModal');
  const closeCreatorBtn = document.getElementById('closeCreatorBtn');
  const cancelCreatorBtn = document.getElementById('cancelCreatorBtn');
  const saveStoryBtn = document.getElementById('saveStoryBtn');
  const openShareBtn = document.getElementById('openShareBtn');
  const shareModal = document.getElementById('shareModal');
  const closeShareBtn = document.getElementById('closeShareBtn');

  // Secret Discovery
  const secretDiscoveryInput = document.getElementById('secretDiscoveryInput');
  const secretDiscoveryBtn = document.getElementById('secretDiscoveryBtn');
  const secretDiscoveryToast = document.getElementById('secretDiscoveryToast');

  // Hidden Chat
  const hiddenChatModal = document.getElementById('hiddenChatModal');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const chatForm = document.getElementById('chatForm');
  const chatTextInput = document.getElementById('chatTextInput');
  const chatAttachBtn = document.getElementById('chatAttachBtn');
  const chatPhotoInput = document.getElementById('chatPhotoInput');
  const chatSearchInput = document.getElementById('chatSearchInput');
  const chatMessagesScroll = document.getElementById('chatMessagesScroll');
  const chatHeartQuickBtn = document.getElementById('chatHeartQuickBtn');
  const chatNotificationToast = document.getElementById('chatNotificationToast');

  // Memories Upload
  const memoryFileInput = document.getElementById('memoryFileInput');
  const triggerUploadBtn = document.getElementById('triggerUploadBtn');

  // Book Controls
  const bookPrevBtn = document.getElementById('bookPrevBtn');
  const bookNextBtn = document.getElementById('bookNextBtn');

  // ==========================================================================
  // LOAD ACTIVE STORY FROM BACKEND
  // ==========================================================================
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get('story') || 'default';

  async function fetchStory(id) {
    try {
      const res = await fetch(`/api/story?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.story) {
          return json.story;
        }
      }
    } catch (e) {
      console.warn('[LoveOnce] Failed to fetch story from server, falling back to local defaults:', e);
    }
    return null;
  }

  window.activeStory = await fetchStory(storyId) || {
    id: 'default',
    partnerName: 'My Love',
    yourName: 'Arvind',
    relationshipDate: '14 February 2025',
    specialDate: 'Our First Starlit Walk',
    favoriteMemory: 'Walking together under the midnight sky when the whole world was asleep.',
    favoriteColor: '#ff1a53',
    romanticMessage: 'Every picture with you feels like a page from my favorite story. In all the universe, across all stars and timelines, my heart was always searching for you.',
    customLoveLetter: 'My Dearest Love,\n\nIf I had to live my life all over again, I would find you sooner so that I could love you longer.\n\nFrom the moment you entered my world, everything changed. Colors became brighter, music sounded sweeter, and every quiet dream I held found its destination in your smile.\n\nThank you for being my anchor when storms rise, my laughter when joy is shared, and my favorite thought at the end of every long day. No matter where the winds of tomorrow take us, my heart will forever beat in harmony with yours.\n\nForever and always,\nYours completely 💗',
    secretRoomId: 'LOV-8F42KQ',
    secretKeyword: 'moonlight',
    timeline: [
      { year: '2025', date: '14 February 2025', title: 'When Our Story Began', caption: 'The day two separate journeys merged into one beautiful adventure.', icon: '❤️' },
      { year: '2025', date: '24 June 2025', title: 'First Starlit Walk', caption: 'Under the quiet moon, where every second felt like pure magic.', icon: '🌹' },
      { year: '2026', date: '01 January 2026', title: 'Welcoming Forever', caption: 'Counting down the new year in your arms, knowing you are my home.', icon: '✨' },
      { year: '2026', date: 'Today & Always', title: 'Still Falling For You', caption: 'Every heartbeat still whispers your name.', icon: '♾️' }
    ],
    memories: [
      {
        id: 'mem-1',
        title: 'Under The Midnight Lanterns',
        date: '24 June 2025',
        originalPhoto: '/assets/images/starlit_walk_art.jpg',
        aiArt: '/assets/images/starlit_walk_art.jpg',
        caption: 'Every picture with you feels like a page from my favorite story. ❤️'
      },
      {
        id: 'mem-2',
        title: 'Golden Sunset On The Hill',
        date: '14 October 2025',
        originalPhoto: '/assets/images/sunset_hill_art.jpg',
        aiArt: '/assets/images/sunset_hill_art.jpg',
        caption: 'Some moments are ordinary, but with you they become my favorite memories. ✨'
      }
    ],
    bookPages: []
  };

  // Populate UI with Active Story
  function renderStoryUI() {
    const s = window.activeStory;
    document.title = `LoveOnce — For ${s.partnerName} ❤️`;

    // Partner Headers & Badges
    const headerTag = document.getElementById('partnerHeaderTag');
    if (headerTag) headerTag.textContent = `✦ For ${s.partnerName}`;

    const badge = document.getElementById('heroPartnerBadge');
    if (badge) badge.textContent = `OUR UNENDING STORY • FOR ${s.partnerName.toUpperCase()}`;

    const welcomeSub = document.getElementById('welcomePartnerSubtitle');
    if (welcomeSub) welcomeSub.textContent = `For ${s.partnerName}... ❤️`;

    const heroSubtitle = document.getElementById('heroRomanticSubtitle');
    if (heroSubtitle && s.romanticMessage) {
      heroSubtitle.textContent = `"${s.romanticMessage}"`;
    }

    // Days counter
    calculateAnniversaryDays(s.relationshipDate);

    // Letter Content
    const letterHeading = document.getElementById('letterRecipientHeading');
    if (letterHeading) letterHeading.textContent = `My Dearest ${s.partnerName},`;

    const letterBody = document.getElementById('letterBodyContent');
    if (letterBody && s.customLoveLetter) {
      letterBody.innerHTML = s.customLoveLetter
        .split('\n\n')
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('<br>');
    }

    const letterSignoff = document.getElementById('letterSignoffContent');
    if (letterSignoff) {
      letterSignoff.innerHTML = `Forever and always,<br>Yours completely, ${s.yourName || 'Arvind'} 💗`;
    }

    // Love Meter default names
    const m1 = document.getElementById('meterName1');
    const m2 = document.getElementById('meterName2');
    if (m1) m1.value = s.partnerName;
    if (m2) m2.value = s.yourName;

    // Chat room ID badge
    const roomBadge = document.getElementById('chatRoomIdBadge');
    if (roomBadge) roomBadge.textContent = s.secretRoomId || 'LOV-8F42KQ';

    // Share Modal defaults
    const shareInput = document.getElementById('shareUrlInput');
    if (shareInput) {
      shareInput.value = `${window.location.origin}/?story=${s.id}`;
    }
    const secretKeyDisplay = document.getElementById('shareSecretKeywordDisplay');
    if (secretKeyDisplay) {
      secretKeyDisplay.textContent = s.secretKeyword || 'moonlight';
    }

    // Render Subsystems
    renderBookPages();
    renderMemoriesGrid();
    renderTimeline();
  }

  function calculateAnniversaryDays(dateStr) {
    const counterEl = document.getElementById('heroLoveCounter');
    if (!counterEl) return;
    try {
      const start = new Date(dateStr);
      if (!isNaN(start.getTime())) {
        const diffDays = Math.max(1, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
        counterEl.textContent = `❤️ Together since ${dateStr} • ${diffDays.toLocaleString()} Days of Loving You`;
        return;
      }
    } catch (e) {}
    counterEl.textContent = `❤️ Together since ${dateStr || '14 February 2025'} • Counting our forevers...`;
  }

  // ==========================================================================
  // 4. LOVE MEMORY BOOK ENGINE
  // ==========================================================================
  function getCompleteBookPages() {
    const s = window.activeStory;
    const basePages = [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Our Story',
        subtitle: 'Chapter 1',
        text: 'Every beautiful story starts with one moment...',
        flower: '🌹'
      },
      {
        pageNumber: 2,
        type: 'photo_caption',
        title: 'How It Started',
        photo: (s.memories && s.memories[0] && s.memories[0].aiArt) || '/assets/images/starlit_walk_art.jpg',
        caption: `When our paths crossed, the entire world suddenly made sense, ${s.partnerName}. ❤️`
      },
      {
        pageNumber: 3,
        type: 'photo_caption',
        title: 'One Of My Favorite Memories',
        photo: (s.memories && s.memories[1] && s.memories[1].aiArt) || '/assets/images/sunset_hill_art.jpg',
        caption: s.favoriteMemory || 'Walking together under the midnight sky when the whole world was asleep.'
      },
      {
        pageNumber: 4,
        type: 'reasons',
        title: 'Things I Love About You',
        items: [
          `Your radiant smile that brightens my darkest days`,
          `The gentle warmth in your voice and the kindness in your eyes`,
          `The way you care effortlessly, even when no one is watching`,
          `How every ordinary second with you turns into timeless poetry`
        ]
      },
      {
        pageNumber: 5,
        type: 'collage',
        title: 'Our Little Moments',
        photos: (s.memories || []).map(m => m.aiArt || m.originalPhoto).slice(0, 4)
      },
      {
        pageNumber: 6,
        type: 'flowers',
        title: 'Flowers For You',
        text: 'A secret bouquet of blooms, each carrying a soft whisper of my devotion.',
        flowers: [
          { symbol: '🌹', name: 'Red Rose', meaning: 'Deep Eternal Love' },
          { symbol: '🌷', name: 'Pink Tulip', meaning: 'Gentle Affection' },
          { symbol: '🌻', name: 'Sunflower', meaning: 'Warmth & Radiance' },
          { symbol: '🌸', name: 'Cherry Blossom', meaning: 'Sweet New Beginnings' }
        ]
      },
      {
        pageNumber: 7,
        type: 'letter',
        title: 'A Letter For You',
        text: s.customLoveLetter || 'If I had to live my life all over again, I would find you sooner so that I could love you longer...'
      },
      {
        pageNumber: 8,
        type: 'forever',
        title: 'Forever?',
        text: `Our story isn't finished...\nBecause every day with you is another page.\n\nTo be continued... ❤️\n\nFor ${s.partnerName}`
      }
    ];

    // Append dynamic pages from saved chat whispers or custom user additions
    if (Array.isArray(s.bookPages) && s.bookPages.length > 0) {
      s.bookPages.forEach((dp, idx) => {
        basePages.push({
          pageNumber: basePages.length + 1,
          type: dp.type || 'chat_memory',
          title: dp.title || `A Whisper From Our Secret Place`,
          text: dp.text || '',
          photo: dp.photo || null,
          date: dp.date || 'Today'
        });
      });
    }

    return basePages;
  }

  function renderBookPages() {
    const container = document.getElementById('bookPagesContainer');
    const indicator = document.getElementById('bookPageIndicator');
    if (!container) return;

    const allPages = getCompleteBookPages();
    const isMobile = window.innerWidth <= 768;
    const totalPages = allPages.length;

    // Boundary check
    if (window.currentBookPage >= totalPages) {
      window.currentBookPage = totalPages - 1;
    }
    if (window.currentBookPage < 0) {
      window.currentBookPage = 0;
    }

    if (isMobile) {
      // Single Page Spread
      const p = allPages[window.currentBookPage];
      container.innerHTML = `
        <div class="book-single-page" id="bookActiveSinglePage">
          ${renderPageContentHtml(p)}
        </div>
      `;
      if (indicator) {
        indicator.textContent = `Page ${window.currentBookPage + 1} of ${totalPages}`;
      }
    } else {
      // Two-Page Spread
      const leftIndex = Math.floor(window.currentBookPage / 2) * 2;
      const rightIndex = leftIndex + 1;
      const leftPage = allPages[leftIndex];
      const rightPage = rightIndex < totalPages ? allPages[rightIndex] : null;

      container.innerHTML = `
        <div class="book-single-page book-page-left">
          ${leftPage ? renderPageContentHtml(leftPage) : ''}
        </div>
        <div class="book-single-page book-page-right">
          ${rightPage ? renderPageContentHtml(rightPage) : '<div class="book-page-body"><p style="opacity: 0.5;">~ Notes of our journey ~</p></div>'}
        </div>
      `;

      if (indicator) {
        indicator.textContent = `Pages ${leftIndex + 1}–${Math.min(rightIndex + 1, totalPages)} of ${totalPages}`;
      }
    }

    // Attach click events on flower cards in book
    container.querySelectorAll('.flower-interactive-card').forEach((card) => {
      card.addEventListener('click', () => {
        if (window.loveOnceMusic) window.loveOnceMusic.playSparkle();
        card.style.transform = 'scale(1.15) rotate(5deg)';
        setTimeout(() => { card.style.transform = ''; }, 600);
      });
    });
  }

  function renderPageContentHtml(page) {
    if (!page) return '';
    let bodyHtml = '';

    switch (page.type) {
      case 'intro':
        bodyHtml = `
          <div style="font-size: 3.5rem; margin-bottom: 0.8rem; filter: drop-shadow(0 0 15px rgba(255,26,83,0.3));">
            ${page.flower || '🌹'}
          </div>
          <p style="font-size: 1.15rem; font-style: italic; color: #2b1b22; max-width: 320px;">
            "${page.text}"
          </p>
        `;
        break;

      case 'photo_caption':
        bodyHtml = `
          ${page.photo ? `<div class="book-photo-frame"><img src="${page.photo}" alt="${page.title}"></div>` : ''}
          <p style="font-size: 0.95rem; font-style: italic; margin-top: 0.6rem;">"${page.caption || page.text}"</p>
        `;
        break;

      case 'reasons':
        bodyHtml = `
          <ul class="book-reasons-list">
            ${(page.items || []).map(item => `<li><span style="color: var(--primary-red);">❤️</span> ${item}</li>`).join('')}
          </ul>
        `;
        break;

      case 'collage':
        bodyHtml = `
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem; width: 100%; margin-bottom: 0.6rem;">
            ${(page.photos || []).map(src => `<div style="height: 110px; border-radius: 6px; overflow: hidden; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.15);"><img src="${src}" style="width: 100%; height: 100%; object-fit: cover;"></div>`).join('')}
          </div>
          <p style="font-size: 0.88rem; font-style: italic; opacity: 0.8;">Every picture holds a silent heartbeat of us.</p>
        `;
        break;

      case 'flowers':
        bodyHtml = `
          <p style="font-size: 0.92rem; font-style: italic; margin-bottom: 0.8rem;">${page.text}</p>
          <div class="book-flowers-display">
            ${(page.flowers || []).map(f => `
              <div class="flower-interactive-card">
                <span class="flower-symbol">${f.symbol}</span>
                <strong style="font-size: 0.85rem; color: #1a0614;">${f.name}</strong>
                <div style="font-size: 0.72rem; color: #6b1428;">${f.meaning}</div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 'letter':
        bodyHtml = `
          <div style="max-height: 280px; overflow-y: auto; text-align: left; font-size: 0.92rem; line-height: 1.7; font-family: var(--font-serif); padding-right: 0.5rem;">
            ${(page.text || '').replace(/\n/g, '<br>')}
          </div>
        `;
        break;

      case 'forever':
        bodyHtml = `
          <div style="font-size: 3.2rem; margin-bottom: 0.8rem; filter: drop-shadow(0 0 20px #ff1a53); animation: floatILoveYou 3s ease-in-out infinite alternate;">💖</div>
          <p style="font-size: 1.15rem; font-style: italic; line-height: 1.7;">
            ${(page.text || '').replace(/\n/g, '<br>')}
          </p>
        `;
        break;

      case 'chat_memory':
      default:
        bodyHtml = `
          <div style="font-size: 0.8rem; color: var(--primary-red); font-weight: 600; margin-bottom: 0.4rem;">
            Whispered by ${page.sender || 'Our Secret Place'} • ${page.date || ''}
          </div>
          ${page.photo ? `<div class="book-photo-frame"><img src="${page.photo}" alt="Whisper Photo"></div>` : ''}
          <p style="font-size: 1rem; font-style: italic; color: #2b1b22; margin-top: 0.6rem;">
            "${page.text}"
          </p>
        `;
        break;
    }

    return `
      <div class="book-page-header">
        <span class="book-page-tag">LoveOnce Chronicles</span>
        <h3 class="book-page-title">${page.title || ''}</h3>
      </div>
      <div class="book-page-body">
        ${bodyHtml}
      </div>
      <div class="book-page-footer">
        <span>Our Love Story</span>
        <span>${page.pageNumber || ''}</span>
      </div>
    `;
  }

  // Book Navigation Event Listeners
  if (bookPrevBtn) {
    bookPrevBtn.addEventListener('click', () => {
      const step = window.innerWidth <= 768 ? 1 : 2;
      window.currentBookPage = Math.max(0, window.currentBookPage - step);
      renderBookPages();
      if (window.loveOnceMusic) window.loveOnceMusic.playSparkle();
    });
  }

  if (bookNextBtn) {
    bookNextBtn.addEventListener('click', () => {
      const allPages = getCompleteBookPages();
      const step = window.innerWidth <= 768 ? 1 : 2;
      if (window.currentBookPage + step < allPages.length) {
        window.currentBookPage += step;
        renderBookPages();
        if (window.loveOnceMusic) window.loveOnceMusic.playSparkle();
      }
    });
  }

  // Mobile Swipe Gesture for Book
  const bookWrapper = document.getElementById('bookWrapper');
  if (bookWrapper) {
    let touchStartX = 0;
    let touchEndX = 0;

    bookWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    bookWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 45) {
        if (diff < 0) {
          // Swipe Left -> Next
          if (bookNextBtn) bookNextBtn.click();
        } else {
          // Swipe Right -> Prev
          if (bookPrevBtn) bookPrevBtn.click();
        }
      }
    }, { passive: true });
  }

  window.addEventListener('resize', () => {
    renderBookPages();
  });

  // ==========================================================================
  // 5. MEMORIES & GHIBLI ART TRANSFORMATION ENGINE
  // ==========================================================================
  function renderMemoriesGrid() {
    const grid = document.getElementById('memoriesGridContainer');
    if (!grid) return;
    const memories = window.activeStory.memories || [];

    grid.innerHTML = memories.map((m, idx) => `
      <div class="memory-art-card" id="memCard-${m.id || idx}">
        <div class="art-media-box">
          <div class="art-badge-tag">✨ Ghibli Storybook Art</div>
          <div class="art-toggle-tabs">
            <button type="button" class="btn-toggle-view active" data-view="art" data-id="${m.id || idx}">View Art</button>
            <button type="button" class="btn-toggle-view" data-view="orig" data-id="${m.id || idx}">Original</button>
          </div>
          <img src="${m.aiArt || m.originalPhoto}" id="memImg-${m.id || idx}" alt="${m.title}">
        </div>
        <div class="memory-art-details">
          <div>
            <h3 class="memory-art-title">${m.title || 'A Special Memory'}</h3>
            <p class="memory-art-caption" id="memCaption-${m.id || idx}">"${m.caption || ''}"</p>
          </div>
          <div class="memory-card-actions">
            <button type="button" class="btn-card-action primary btn-turn-art" data-id="${m.id || idx}">
              <span>✨</span> Re-stylize Art
            </button>
            <button type="button" class="btn-card-action btn-edit-caption" data-id="${m.id || idx}">
              <span>✏️</span> Edit Caption
            </button>
            <button type="button" class="btn-card-action btn-use-book" data-id="${m.id || idx}">
              <span>📖</span> Use in Love Book
            </button>
            <a href="${m.aiArt || m.originalPhoto}" download="LoveOnce-Art.jpg" class="btn-card-action" style="text-decoration:none;">
              <span>📥</span> Save
            </a>
          </div>
        </div>
      </div>
    `).join('');

    // Toggle view buttons
    grid.querySelectorAll('.btn-toggle-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const view = btn.getAttribute('data-view');
        const card = document.getElementById(`memCard-${id}`);
        const img = document.getElementById(`memImg-${id}`);
        const mem = memories[id] || memories.find(x => x.id === id);
        if (!mem || !img || !card) return;

        card.querySelectorAll('.btn-toggle-view').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        img.style.opacity = '0.3';
        setTimeout(() => {
          img.src = view === 'orig' ? mem.originalPhoto : (mem.aiArt || mem.originalPhoto);
          img.style.opacity = '1';
        }, 200);
      });
    });

    // Re-stylize button
    grid.querySelectorAll('.btn-turn-art').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const mem = memories[id] || memories.find(x => x.id === id);
        if (!mem) return;
        btn.innerHTML = '<span>⏳</span> Transforming...';

        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';
        tempImg.onload = async () => {
          const transformed = await transformToGhibliArt(tempImg);
          mem.aiArt = transformed;
          const img = document.getElementById(`memImg-${id}`);
          if (img) img.src = transformed;
          btn.innerHTML = '<span>✨</span> Art Generated!';
          setTimeout(() => { btn.innerHTML = '<span>✨</span> Re-stylize Art'; }, 2000);
          if (window.loveOnceMusic) window.loveOnceMusic.playSparkle();
        };
        tempImg.src = mem.originalPhoto;
      });
    });

    // Edit caption button
    grid.querySelectorAll('.btn-edit-caption').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const mem = memories[id] || memories.find(x => x.id === id);
        if (!mem) return;
        const currentCap = mem.caption || '';
        const newCap = prompt('✏️ Edit romantic caption:', currentCap);
        if (newCap !== null && newCap.trim() !== '') {
          mem.caption = newCap.trim();
          const capEl = document.getElementById(`memCaption-${id}`);
          if (capEl) capEl.textContent = `"${mem.caption}"`;
        }
      });
    });

    // Use in Love Book button
    grid.querySelectorAll('.btn-use-book').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const mem = memories[id] || memories.find(x => x.id === id);
        if (!mem) return;

        if (!window.activeStory.bookPages) window.activeStory.bookPages = [];
        window.activeStory.bookPages.push({
          type: 'photo_caption',
          title: mem.title || 'Our Memory',
          photo: mem.aiArt || mem.originalPhoto,
          caption: mem.caption || 'A timeless moment with you.'
        });

        renderBookPages();
        btn.innerHTML = '<span>❤️</span> Added to Book!';
        setTimeout(() => { btn.innerHTML = '<span>📖</span> Use in Love Book'; }, 2000);
        if (window.loveOnceMusic) window.loveOnceMusic.playChime();
      });
    });
  }

  // Add Memory Photo File Input
  if (triggerUploadBtn && memoryFileInput) {
    triggerUploadBtn.addEventListener('click', () => {
      memoryFileInput.click();
    });

    memoryFileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = async (event) => {
          const originalDataUrl = event.target.result;

          // Generate AI Caption via backend
          let generatedCaption = "Some moments are ordinary, but with you they become my favorite memories. ❤️";
          try {
            const capRes = await fetch('/api/generate-caption', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                partnerName: window.activeStory.partnerName,
                memoryTitle: file.name.replace(/\.[^/.]+$/, '')
              })
            });
            const capData = await capRes.json();
            if (capData && capData.caption) generatedCaption = capData.caption;
          } catch (err) {}

          // Generate Ghibli Art version
          const tempImg = new Image();
          tempImg.onload = async () => {
            const artDataUrl = await transformToGhibliArt(tempImg);

            const newMem = {
              id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              title: file.name.replace(/\.[^/.]+$/, ''),
              date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              originalPhoto: originalDataUrl,
              aiArt: artDataUrl,
              caption: generatedCaption
            };

            if (!window.activeStory.memories) window.activeStory.memories = [];
            window.activeStory.memories.unshift(newMem);

            renderMemoriesGrid();
            renderBookPages();
            if (window.loveOnceMusic) window.loveOnceMusic.playSparkle();
          };
          tempImg.src = originalDataUrl;
        };
        reader.readAsDataURL(file);
      }
      memoryFileInput.value = '';
    });
  }

  // ==========================================================================
  // 6. PHOTO BOOK TIMELINE ENGINE
  // ==========================================================================
  function renderTimeline() {
    const track = document.getElementById('timelineTrackContainer');
    if (!track) return;
    const timeline = window.activeStory.timeline || [];

    track.innerHTML = timeline.map((item, idx) => `
      <div class="timeline-item">
        <div class="timeline-dot">${item.icon || '🌹'}</div>
        <div class="timeline-card">
          <div class="timeline-date">${item.date || item.year || ''}</div>
          <h4 class="timeline-title">${item.title || ''}</h4>
          <p class="timeline-caption">${item.caption || ''}</p>
        </div>
      </div>
    `).join('');
  }

  // ==========================================================================
  // 7. HIDDEN LOVE CHAT ROOM & SECRET DISCOVERY ENGINE
  // ==========================================================================
  async function verifyAndOpenSecretRoom(keyword) {
    if (!keyword) return;
    const s = window.activeStory;

    try {
      const res = await fetch('/api/chat/verify-keyword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim().toLowerCase(),
          roomId: s.secretRoomId
        })
      });

      const data = await res.json();
      if (data && data.valid && data.token) {
        // Correct secret keyword found!
        window.activeChatToken = data.token;
        if (secretDiscoveryToast) {
          secretDiscoveryToast.classList.add('active');
          setTimeout(() => { secretDiscoveryToast.classList.remove('active'); }, 2800);
        }

        if (window.loveOnceMusic) {
          window.loveOnceMusic.playSparkle();
        }

        setTimeout(() => {
          openHiddenChatModal(data.roomId);
        }, 800);
      } else {
        // Incorrect keyword: Silently do nothing as specified in Requirement 11
        if (secretDiscoveryInput) {
          secretDiscoveryInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }
      }
    } catch (err) {
      console.error('Error verifying secret keyword:', err);
    }
  }

  if (secretDiscoveryBtn && secretDiscoveryInput) {
    secretDiscoveryBtn.addEventListener('click', () => {
      verifyAndOpenSecretRoom(secretDiscoveryInput.value);
    });

    secretDiscoveryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verifyAndOpenSecretRoom(secretDiscoveryInput.value);
      }
    });
  }

  function openHiddenChatModal(roomId) {
    if (!hiddenChatModal) return;
    hiddenChatModal.classList.add('open');
    loadChatMessages(roomId);
    connectRealtimeSSE(roomId);
  }

  function closeHiddenChatModal() {
    if (!hiddenChatModal) return;
    hiddenChatModal.classList.remove('open');
  }

  if (closeChatBtn) {
    closeChatBtn.addEventListener('click', closeHiddenChatModal);
  }

  // Load chat messages via API
  async function loadChatMessages(roomId) {
    if (!window.activeChatToken) return;
    try {
      const res = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(roomId)}`, {
        headers: { 'X-Room-Token': window.activeChatToken }
      });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.messages)) {
        renderChatMessages(data.messages);
      }
    } catch (err) {
      console.warn('Failed to load chat messages:', err);
    }
  }

  // Connect Real-Time Server-Sent Events (SSE)
  function connectRealtimeSSE(roomId) {
    if (chatEventSource) {
      chatEventSource.close();
    }

    try {
      chatEventSource = new EventSource(`/api/chat/events?roomId=${encodeURIComponent(roomId)}`);

      chatEventSource.addEventListener('new_message', (e) => {
        try {
          const msg = JSON.parse(e.data);
          appendSingleChatMessage(msg);

          // Subtle Notification Toast if chat is closed
          if (hiddenChatModal && !hiddenChatModal.classList.contains('open')) {
            showSecretNotification();
          }
        } catch (err) {}
      });

      chatEventSource.addEventListener('reaction', (e) => {
        try {
          const data = JSON.parse(e.data);
          updateMessageReactions(data.messageId, data.reactions);
        } catch (err) {}
      });
    } catch (err) {
      console.warn('SSE connection failed:', err);
    }
  }

  function showSecretNotification() {
    if (!chatNotificationToast) return;
    chatNotificationToast.style.display = 'flex';
    if (window.loveOnceMusic) window.loveOnceMusic.playChime();
    setTimeout(() => {
      chatNotificationToast.style.display = 'none';
    }, 4500);
  }

  if (chatNotificationToast) {
    chatNotificationToast.addEventListener('click', () => {
      chatNotificationToast.style.display = 'none';
      if (hiddenChatModal) hiddenChatModal.classList.add('open');
    });
  }

  function renderChatMessages(messages) {
    if (!chatMessagesScroll) return;
    chatMessagesScroll.innerHTML = '';
    messages.forEach(msg => appendSingleChatMessage(msg, false));
    chatMessagesScroll.scrollTop = chatMessagesScroll.scrollHeight;
  }

  function appendSingleChatMessage(msg, autoScroll = true) {
    if (!chatMessagesScroll) return;
    const isYou = msg.sender === (window.activeStory.yourName || 'Arvind') || msg.sender === 'Me';
    const rowClass = isYou ? 'you' : 'partner';

    const row = document.createElement('div');
    row.className = `chat-bubble-row ${rowClass}`;
    row.id = `chatMsg-${msg.id}`;

    let mediaHtml = '';
    if (msg.photo) {
      mediaHtml = `
        <div style="max-width: 220px; border-radius: 10px; overflow: hidden; margin-bottom: 0.5rem; border: 2px solid rgba(255,255,255,0.2);">
          <img src="${msg.photoArt || msg.photo}" alt="Chat Photo" style="width: 100%; height: auto; display: block;">
        </div>
      `;
    }

    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    row.innerHTML = `
      <div class="chat-bubble">
        ${mediaHtml}
        ${msg.text ? `<div>${msg.text}</div>` : ''}
      </div>
      <div class="chat-bubble-meta">
        <span>${msg.sender}</span>
        <span>${timeStr}</span>
      </div>
      <div class="chat-reactions-row" id="reactions-${msg.id}">
        ${renderReactionsHtml(msg.reactions)}
      </div>
      <div class="chat-bubble-actions">
        <button type="button" class="btn-msg-action btn-react-msg" data-id="${msg.id}">❤️</button>
        <button type="button" class="btn-msg-action btn-save-msg" data-id="${msg.id}">📖 Save to Story</button>
      </div>
    `;

    chatMessagesScroll.appendChild(row);

    // Event: React to message
    const reactBtn = row.querySelector('.btn-react-msg');
    if (reactBtn) {
      reactBtn.addEventListener('click', () => {
        postReaction(msg.id, '❤️');
      });
    }

    // Event: Save to Story Book
    const saveBtn = row.querySelector('.btn-save-msg');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/chat/save-to-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storyId: window.activeStory.id,
              roomId: window.activeStory.secretRoomId,
              messageId: msg.id
            })
          });
          const result = await res.json();
          if (result.success && result.page) {
            if (!window.activeStory.bookPages) window.activeStory.bookPages = [];
            window.activeStory.bookPages.push(result.page);
            renderBookPages();
            saveBtn.textContent = '❤️ Saved!';
            setTimeout(() => { saveBtn.textContent = '📖 Save to Story'; }, 2000);
            if (window.loveOnceMusic) window.loveOnceMusic.playChime();
          }
        } catch (e) {}
      });
    }

    if (autoScroll) {
      chatMessagesScroll.scrollTop = chatMessagesScroll.scrollHeight;
    }
  }

  function renderReactionsHtml(reactions) {
    if (!reactions) return '';
    return Object.entries(reactions)
      .filter(([emoji, count]) => count > 0)
      .map(([emoji, count]) => `<span class="reaction-pill">${emoji} ${count}</span>`)
      .join('');
  }

  function updateMessageReactions(messageId, reactions) {
    const el = document.getElementById(`reactions-${messageId}`);
    if (el) el.innerHTML = renderReactionsHtml(reactions);
  }

  async function postReaction(messageId, emoji) {
    try {
      await fetch('/api/chat/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: window.activeStory.secretRoomId,
          messageId,
          emoji
        })
      });
    } catch (e) {}
  }

  // Send message from chat form
  if (chatForm && chatTextInput) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = chatTextInput.value.trim();
      if (!text) return;
      chatTextInput.value = '';

      try {
        await fetch('/api/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Room-Token': window.activeChatToken
          },
          body: JSON.stringify({
            roomId: window.activeStory.secretRoomId,
            sender: window.activeStory.yourName || 'Arvind',
            text: text
          })
        });
      } catch (err) {
        console.error('Failed to post message:', err);
      }
    });
  }

  // Chat Heart Quick Button
  if (chatHeartQuickBtn) {
    chatHeartQuickBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Room-Token': window.activeChatToken
          },
          body: JSON.stringify({
            roomId: window.activeStory.secretRoomId,
            sender: window.activeStory.yourName || 'Arvind',
            text: 'I love you with all my heart ❤️'
          })
        });
      } catch (e) {}
    });
  }

  // Chat Photo Attach
  if (chatAttachBtn && chatPhotoInput) {
    chatAttachBtn.addEventListener('click', () => chatPhotoInput.click());

    chatPhotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        const photoData = evt.target.result;
        try {
          await fetch('/api/chat/message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Room-Token': window.activeChatToken
            },
            body: JSON.stringify({
              roomId: window.activeStory.secretRoomId,
              sender: window.activeStory.yourName || 'Arvind',
              text: '📸 Sent a memory',
              photo: photoData
            })
          });
        } catch (err) {}
      };
      reader.readAsDataURL(file);
      chatPhotoInput.value = '';
    });
  }

  // Chat Message Search
  if (chatSearchInput) {
    chatSearchInput.addEventListener('input', () => {
      const q = chatSearchInput.value.toLowerCase().trim();
      const rows = document.querySelectorAll('.chat-bubble-row');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          r.style.display = 'flex';
          if (q) r.style.background = 'rgba(255, 26, 83, 0.15)';
          else r.style.background = 'transparent';
        } else {
          r.style.display = 'none';
        }
      });
    });
  }

  // ==========================================================================
  // 8. SENDER DASHBOARD / STORY CREATOR MODAL
  // ==========================================================================
  function openStoryCreator() {
    if (!creatorModal) return;
    const s = window.activeStory;
    document.getElementById('creatorPartnerName').value = s.partnerName || '';
    document.getElementById('creatorYourName').value = s.yourName || '';
    document.getElementById('creatorRelDate').value = s.relationshipDate || '';
    document.getElementById('creatorSpecialDate').value = s.specialDate || '';
    document.getElementById('creatorFavMemory').value = s.favoriteMemory || '';
    document.getElementById('creatorRomMessage').value = s.romanticMessage || '';
    document.getElementById('creatorLoveLetter').value = s.customLoveLetter || '';
    document.getElementById('creatorSecretKeyword').value = s.secretKeyword || 'moonlight';
    creatorModal.classList.add('open');
  }

  function closeStoryCreator() {
    if (creatorModal) creatorModal.classList.remove('open');
  }

  if (openCreatorBtn) openCreatorBtn.addEventListener('click', openStoryCreator);
  if (heroStoryCreatorBtn) heroStoryCreatorBtn.addEventListener('click', openStoryCreator);
  if (closeCreatorBtn) closeCreatorBtn.addEventListener('click', closeStoryCreator);
  if (cancelCreatorBtn) cancelCreatorBtn.addEventListener('click', closeStoryCreator);

  if (saveStoryBtn) {
    saveStoryBtn.addEventListener('click', async () => {
      saveStoryBtn.textContent = 'Saving Story...';
      const partnerName = document.getElementById('creatorPartnerName').value.trim() || 'My Love';
      const yourName = document.getElementById('creatorYourName').value.trim() || 'Arvind';
      const relDate = document.getElementById('creatorRelDate').value.trim() || '14 February 2025';
      const specialDate = document.getElementById('creatorSpecialDate').value.trim() || '';
      const favMemory = document.getElementById('creatorFavMemory').value.trim() || '';
      const romMessage = document.getElementById('creatorRomMessage').value.trim() || '';
      const loveLetter = document.getElementById('creatorLoveLetter').value.trim() || '';
      const secretKeyword = document.getElementById('creatorSecretKeyword').value.trim() || 'moonlight';
      const flower = document.getElementById('creatorFlowerSelect').value || 'rose';

      const payload = {
        id: window.activeStory.id === 'default' ? undefined : window.activeStory.id,
        partnerName,
        yourName,
        relationshipDate: relDate,
        specialDate,
        favoriteMemory: favMemory,
        romanticMessage: romMessage,
        customLoveLetter: loveLetter,
        secretKeyword,
        flower,
        secretRoomId: window.activeStory.secretRoomId,
        memories: window.activeStory.memories || [],
        timeline: window.activeStory.timeline || [],
        bookPages: window.activeStory.bookPages || []
      };

      try {
        const res = await fetch('/api/story/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          window.activeStory = { ...window.activeStory, ...payload, id: data.storyId, secretRoomId: data.roomId };
          renderStoryUI();
          closeStoryCreator();
          openShareModal();
          if (window.loveOnceMusic) window.loveOnceMusic.playSparkle();
        }
      } catch (err) {
        alert('Failed to save story. Please try again.');
      } finally {
        saveStoryBtn.textContent = '💾 Save & Generate LoveOnce Story';
      }
    });
  }

  // ==========================================================================
  // 9. SHARE EXPERIENCE MODAL
  // ==========================================================================
  function openShareModal() {
    if (!shareModal) return;
    const shareInput = document.getElementById('shareUrlInput');
    const secretDisplay = document.getElementById('shareSecretKeywordDisplay');
    if (shareInput) {
      shareInput.value = `${window.location.origin}/?story=${window.activeStory.id}`;
    }
    if (secretDisplay) {
      secretDisplay.textContent = window.activeStory.secretKeyword || 'moonlight';
    }
    shareModal.classList.add('open');
  }

  function closeShareModal() {
    if (shareModal) shareModal.classList.remove('open');
  }

  if (openShareBtn) openShareBtn.addEventListener('click', openShareModal);
  if (closeShareBtn) closeShareBtn.addEventListener('click', closeShareModal);

  // Copy Link
  const shareCopyLinkBtn = document.getElementById('shareCopyLinkBtn');
  if (shareCopyLinkBtn) {
    shareCopyLinkBtn.addEventListener('click', () => {
      const shareInput = document.getElementById('shareUrlInput');
      if (shareInput) {
        navigator.clipboard.writeText(shareInput.value).then(() => {
          shareCopyLinkBtn.textContent = '✅ Copied!';
          setTimeout(() => { shareCopyLinkBtn.textContent = '📋 Copy Story Link'; }, 2000);
        });
      }
    });
  }

  // Copy Keyword Only
  const shareCopyKeywordBtn = document.getElementById('shareCopyKeywordBtn');
  if (shareCopyKeywordBtn) {
    shareCopyKeywordBtn.addEventListener('click', () => {
      const kw = window.activeStory.secretKeyword || 'moonlight';
      navigator.clipboard.writeText(kw).then(() => {
        shareCopyKeywordBtn.textContent = '✅ Keyword Copied!';
        setTimeout(() => { shareCopyKeywordBtn.textContent = '📋 Copy Keyword Only'; }, 2000);
      });
    });
  }

  // WhatsApp Share
  const shareWhatsAppBtn = document.getElementById('shareWhatsAppBtn');
  if (shareWhatsAppBtn) {
    shareWhatsAppBtn.addEventListener('click', () => {
      const url = `${window.location.origin}/?story=${window.activeStory.id}`;
      const text = encodeURIComponent(`My love, I made a private LoveOnce story for you ❤️ Open our book here: ${url}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });
  }

  // Telegram Share
  const shareTelegramBtn = document.getElementById('shareTelegramBtn');
  if (shareTelegramBtn) {
    shareTelegramBtn.addEventListener('click', () => {
      const url = `${window.location.origin}/?story=${window.activeStory.id}`;
      const text = encodeURIComponent(`A private LoveOnce story for you ❤️`);
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
    });
  }

  // Web Share API
  const shareNativeBtn = document.getElementById('shareNativeBtn');
  if (shareNativeBtn) {
    shareNativeBtn.addEventListener('click', () => {
      const url = `${window.location.origin}/?story=${window.activeStory.id}`;
      if (navigator.share) {
        navigator.share({
          title: `LoveOnce — For ${window.activeStory.partnerName} ❤️`,
          text: `A private romantic love story created just for you.`,
          url: url
        }).catch(() => {});
      } else {
        if (shareCopyLinkBtn) shareCopyLinkBtn.click();
      }
    });
  }

  // ==========================================================================
  // 10. PRESERVED EXISTING ROMANTIC INTERACTIONS
  // ==========================================================================

  // 10.1 "Send Me A Heart"
  sendHeartBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (window.loveOnceMusic) window.loveOnceMusic.playChime();
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
    heart.addEventListener('animationend', () => heart.remove());
  }

  // 10.2 "Make It Rain Love"
  makeRainBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (window.loveOnceMusic) window.loveOnceMusic.playSparkle();
      if (typeof triggerRomanticRain === 'function') triggerRomanticRain(4500);
    });
  });

  // 10.3 Flower Garden
  if (bloomRosesBtn) {
    bloomRosesBtn.addEventListener('click', () => {
      if (window.flowerGarden) window.flowerGarden.bloomMore();
      if (window.loveOnceMusic) window.loveOnceMusic.playChime();
    });
  }

  if (scatterPetalsBtn) {
    scatterPetalsBtn.addEventListener('click', () => {
      if (typeof triggerRomanticRain === 'function') triggerRomanticRain(3000);
      if (window.loveOnceMusic) window.loveOnceMusic.playSparkle();
    });
  }

  // 10.4 Love Letter
  if (openLetterBtn && letterEnvelope && unfoldedLetter) {
    const openLetter = () => {
      letterEnvelope.style.display = 'none';
      unfoldedLetter.classList.add('active');
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
      if (window.loveOnceMusic) window.loveOnceMusic.restoreVolume();
    });
  }

  // 10.5 Celestial Love Meter
  if (calculateMeterBtn && meterProgressFill && meterResultNumber) {
    calculateMeterBtn.addEventListener('click', () => {
      if (window.loveOnceMusic) window.loveOnceMusic.playSparkle();
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
          if (meterResultDesc) meterResultDesc.textContent = 'Destined for Infinite Eternity ✨';
          if (typeof triggerRomanticRain === 'function') triggerRomanticRain(3500);
          if (window.loveOnceMusic) window.loveOnceMusic.playChime();
        }
      };
      requestAnimationFrame(animateCounter);
    });
  }

  // 10.6 Romantic Final Surprise & Celebration (Req 36 & 37)
  const openSurpriseModal = () => {
    if (surpriseModal && modalBackdrop) {
      surpriseModal.classList.add('open');
      modalBackdrop.classList.add('open');
      if (window.loveOnceMusic) {
        window.loveOnceMusic.cinematicSwell(1.4);
        window.loveOnceMusic.playSparkle();
      }
      if (typeof triggerRomanticRain === 'function') triggerRomanticRain(5000);
    }
  };

  const closeSurpriseModal = () => {
    if (surpriseModal && modalBackdrop) {
      surpriseModal.classList.remove('open');
      modalBackdrop.classList.remove('open');
      if (window.loveOnceMusic) window.loveOnceMusic.restoreVolume();

      // Open to final page of the Love Book as requested in Requirement 36
      const allPages = getCompleteBookPages();
      window.currentBookPage = allPages.length - 1;
      renderBookPages();
      const bookSec = document.getElementById('lovebook');
      if (bookSec) bookSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (revealSurpriseBtn) revealSurpriseBtn.addEventListener('click', openSurpriseModal);
  if (closeSurpriseBtn) closeSurpriseBtn.addEventListener('click', closeSurpriseModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeSurpriseModal);

  const celebrationChoice = () => {
    if (typeof triggerRomanticRain === 'function') triggerRomanticRain(6000);
    if (window.flowerGarden) window.flowerGarden.bloomMore();
    if (window.loveOnceMusic) window.loveOnceMusic.playChime();
    closeSurpriseModal();
  };

  if (surpriseAlwaysBtn) surpriseAlwaysBtn.addEventListener('click', celebrationChoice);
  if (surpriseForeverBtn) surpriseForeverBtn.addEventListener('click', celebrationChoice);

  // Initial UI Render
  renderStoryUI();
});
