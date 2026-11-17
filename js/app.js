(() => {
  'use strict';

  /* ============================================================
     Helpers
  ============================================================ */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const store = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        /* Private mode, file protocol oddities, etc. The site still works. */
      }
    },
  };

  const STORAGE_KEY = 'lingoloco:v1';
  const NODE_COUNT = 8;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ============================================================
     Content
  ============================================================ */
  const LANGUAGES = {
    Spanish: {
      icon: '💃',
      code: 'es-ES',
      hello: '¡Hola!',
      tile: 'bg-mango-soft',
      toast: 'Spanish! Bold choice. Pip respects the R-rolling. 💃',
    },
    French: {
      icon: '🥐',
      code: 'fr-FR',
      hello: 'Bonjour !',
      tile: 'bg-sky-soft',
      toast: 'French! You had me at croissant. 🥐',
    },
    Japanese: {
      icon: '🌸',
      code: 'ja-JP',
      hello: 'こんにちは!',
      tile: 'bg-berry-soft',
      toast: 'Japanese! Prepare to say "kawaii" unironically. 🌸',
    },
    German: {
      icon: '🥨',
      code: 'de-DE',
      hello: 'Hallo!',
      tile: 'bg-mango-soft',
      toast: 'German! Time to build a word the size of a bus. 🥨',
    },
    Italian: {
      icon: '🍕',
      code: 'it-IT',
      hello: 'Ciao!',
      tile: 'bg-grass-soft',
      toast: 'Italian! Remember: hands are part of the grammar. 🍕',
    },
    Korean: {
      icon: '🍜',
      code: 'ko-KR',
      hello: '안녕하세요!',
      tile: 'bg-grape-soft',
      toast: 'Korean! Noodles and honor. Excellent combo. 🍜',
    },
    Pirate: {
      icon: '🏴‍☠️',
      code: 'en-GB',
      hello: 'Ahoy!',
      tile: 'bg-sky-soft',
      toast: 'Pirate! Legally questionable, emotionally correct. 🏴‍☠️',
    },
    Klingon: {
      icon: '🖖',
      code: 'en-US',
      hello: 'nuqneH!',
      tile: 'bg-berry-soft',
      toast: 'Klingon! For honor. And confusing Steve from accounting. 🖖',
    },
  };

  const PATH_NODES = [
    { label: 'Say hi, human', icon: '👋', minutes: 3 },
    { label: 'Café survival', icon: '☕', minutes: 4 },
    { label: 'Polite chaos', icon: '🙃', minutes: 3 },
    { label: 'Numbers & snacks', icon: '🍟', minutes: 4 },
    { label: 'Where is…?', icon: '🗺️', minutes: 3 },
    { label: 'Make a friend', icon: '🤝', minutes: 4 },
    { label: 'Dessert negotiations', icon: '🍰', minutes: 5 },
    { label: 'Small talk boss', icon: '🗣️', minutes: 4 },
  ];

  const QUIZ = {
    Spanish: {
      label: 'Spanish',
      icon: '💃',
      questions: [
        {
          prompt: 'Which one means “hello”?',
          emoji: '👋',
          speak: 'Hola',
          options: ['¡Hola!', 'Bonjour', 'Ciao'],
          fact: 'One friendly word and suddenly you have a whole personality.',
        },
        {
          prompt: 'You would like a coffee. Say it.',
          emoji: '☕',
          speak: 'Quiero un café, por favor.',
          options: ['Quiero un café, por favor.', 'Soy un café.', 'El café me debe dinero.'],
          fact: '“Soy un café” means “I am a coffee.” Deeply relatable, but not what we are saying.',
        },
        {
          prompt: 'Someone sneezes. Be polite.',
          emoji: '🤧',
          speak: 'Salud',
          options: ['¡Salud!', '¡Fiesta!', '¡Tortilla!'],
          fact: '“¡Salud!” means “health!” You are now essentially a tiny doctor.',
        },
      ],
    },
    French: {
      label: 'French',
      icon: '🥐',
      questions: [
        {
          prompt: 'Which one means “hello”?',
          emoji: '👋',
          speak: 'Bonjour',
          options: ['Bonjour', 'Merci', 'Croissant'],
          fact: '“Merci” is thank you. “Croissant” is a reason to get up in the morning.',
        },
        {
          prompt: 'How do you say “thank you”?',
          emoji: '🙏',
          speak: 'Merci',
          options: ['Merci', 'Pardon', 'Baguette'],
          fact: '“Pardon” is sorry and “baguette” is baguette. Some things need no translation.',
        },
        {
          prompt: 'Say “I am hungry” without saying “I am hunger.”',
          emoji: '🥖',
          speak: "J'ai faim.",
          options: ["J'ai faim.", 'Je suis faim.', 'Je suis croissant.'],
          fact: 'French uses “avoir” here: you have hunger. “Je suis faim” is a dramatic mistranslation.',
        },
      ],
    },
    Japanese: {
      label: 'Japanese',
      icon: '🌸',
      questions: [
        {
          prompt: 'Which one means “hello”?',
          emoji: '👋',
          speak: 'こんにちは',
          options: ['こんにちは', 'ありがとう', 'さようなら'],
          fact: '“ありがとう” is thank you and “さようなら” is goodbye. Not yet!',
        },
        {
          prompt: 'How do you say “thank you”?',
          emoji: '🙏',
          speak: 'ありがとう',
          options: ['ありがとう', 'すみません', 'ラーメン'],
          fact: '“すみません” is excuse me; “ラーメン” is ramen. Also important, but different.',
        },
        {
          prompt: 'Lunch was incredible. Say “delicious!”',
          emoji: '🍜',
          speak: 'おいしい',
          options: ['おいしい！', 'かわいい！', 'トイレ！'],
          fact: '“かわいい” is cute; “トイレ” is toilet. Please do not compliment the toilet.',
        },
      ],
    },
    German: {
      label: 'German',
      icon: '🥨',
      questions: [
        {
          prompt: 'Which one means “hello”?',
          emoji: '👋',
          speak: 'Hallo',
          options: ['Hallo', 'Tschüss', 'Bratwurst'],
          fact: '“Tschüss” is goodbye. “Bratwurst” is a lifestyle.',
        },
        {
          prompt: 'How do you say “thank you”?',
          emoji: '🙏',
          speak: 'Danke',
          options: ['Danke', 'Bitte', 'Auf Wiedersehen'],
          fact: '“Bitte” is please or you are welcome. Efficient. “Auf Wiedersehen” is goodbye.',
        },
        {
          prompt: 'Find the German word for “speed limit”.',
          emoji: '🛣️',
          speak: 'Geschwindigkeitsbegrenzung',
          options: ['Geschwindigkeitsbegrenzung', 'Handschuh', 'Krankenhaus'],
          fact: '27 letters and one very specific feeling. “Handschuh” is glove; “Krankenhaus” is hospital.',
        },
      ],
    },
    Italian: {
      label: 'Italian',
      icon: '🍕',
      questions: [
        {
          prompt: 'Which one means “hello”?',
          emoji: '👋',
          speak: 'Ciao',
          options: ['Ciao', 'Grazie', 'Pizza'],
          fact: '“Ciao” works for hello and goodbye. Maximum efficiency, minimum effort.',
        },
        {
          prompt: 'How do you say “thank you”?',
          emoji: '🙏',
          speak: 'Grazie',
          options: ['Grazie', 'Prego', 'Mozzarella'],
          fact: '“Prego” means you are welcome. “Mozzarella” is a supporting character.',
        },
        {
          prompt: 'Order a coffee politely.',
          emoji: '☕',
          speak: 'Un caffè, per favore.',
          options: ['Un caffè, per favore.', 'Caffè io.', 'Pizza grazie.'],
          fact: 'Gesture wildly while saying it for full marks. The other two are avant-garde.',
        },
      ],
    },
    Korean: {
      label: 'Korean',
      icon: '🍜',
      questions: [
        {
          prompt: 'Which one means “hello”?',
          emoji: '👋',
          speak: '안녕하세요',
          options: ['안녕하세요', '감사합니다', '안녕히 가세요'],
          fact: '“감사합니다” is thank you; “안녕히 가세요” is goodbye. Slow down, you just got here.',
        },
        {
          prompt: 'How do you say “thank you”?',
          emoji: '🙏',
          speak: '감사합니다',
          options: ['감사합니다', '죄송합니다', '김치'],
          fact: '“죄송합니다” is sorry; “김치” is kimchi, which also deserves gratitude.',
        },
        {
          prompt: 'Your friend cooked. Say “delicious!”',
          emoji: '🍲',
          speak: '맛있어요',
          options: ['맛있어요!', '귀여워요!', '화장실!'],
          fact: '“귀여워요” is cute and “화장실” is restroom. Context is everything.',
        },
      ],
    },
    Pirate: {
      label: 'Pirate',
      icon: '🏴‍☠️',
      questions: [
        {
          prompt: 'Which one is the traditional pirate greeting?',
          emoji: '🏴‍☠️',
          speak: 'Ahoy!',
          options: ['Ahoy!', 'Good afternoon, sir.', 'Spreadsheet.'],
          fact: 'Only one of these has ever been shouted from a crow’s nest. Use it with pride.',
        },
        {
          prompt: 'Ask where the treasure is, pirate-correct.',
          emoji: '💰',
          speak: 'Where be the treasure?',
          options: ['Where be the treasure?', 'Where is the treasure, please?', 'Yeet.'],
          fact: 'Grammar: cursed. Vibe: immaculate. The treasure is not in the spreadsheet.',
        },
        {
          prompt: 'Introduce your parrot. He is a lawyer.',
          emoji: '🦜',
          speak: 'Me parrot be a lawyer.',
          options: ['Me parrot be a lawyer.', 'My parrot has a briefcase.', 'Arrr.'],
          fact: 'Only one of these is legally pirate-correct. Probably. We are not lawyers. The parrot is.',
        },
      ],
    },
    Klingon: {
      label: 'Klingon',
      icon: '🖖',
      questions: [
        {
          prompt: 'Which one is the Klingon greeting?',
          emoji: '🖖',
          speak: 'nuqneH',
          options: ['nuqneH', "Qapla'", 'Live long and prosper'],
          fact: '“Qapla’” means success. The last one belongs to the other franchise. We do not talk about it.',
        },
        {
          prompt: 'Wish someone success.',
          emoji: '⚔️',
          speak: "Qapla'",
          options: ["Qapla'", 'nuqneH', "Bat'leth"],
          fact: '“Bat’leth” is a curved sword. A slightly aggressive way to say congrats.',
        },
        {
          prompt: 'You need the bathroom on a starship. What do you do?',
          emoji: '🚀',
          speak: 'Excuse me, where is the bathroom?',
          options: ['Ask a human, diplomatically.', 'Shout “nuqneH!”', 'Challenge the captain to a duel.'],
          fact: 'Diplomacy first. “nuqneH” is a greeting, and the captain has enough going on.',
        },
      ],
    },
  };

  const PIP_LINES = [
    "Bawk! That's hello in bird.",
    "I'm fluent in snacks.",
    'Boop received. Endorphins deployed.',
    '12-day streak. 0 social life. Balance.',
    'The owl next door is jealous.',
    "You're doing great. Probably.",
    'I have never met a grammar rule I respected.',
    'Touch grass? No. Touch a lesson.',
  ];

  const ASK_PIP = [
    'Q: Is this free? A: Yes. Q: What is the catch? A: The bird owns your streak now.',
    'Pip says: you cannot fail if you keep clicking. This is not legally binding.',
    'Pip says: order the pastry. The grammar will follow.',
    'Pip says: 74% of fluency is confidence. The other 26% is snacks.',
    'Pip says: never trust a language with no word for “snack”. He checked.',
    'Pip says: yes, the hat is new. No, you cannot borrow it.',
    'Pip says: the best time to start was yesterday. The second best is right now. The third best is after a nap.',
  ];

  const MYSTERY_REWARDS = [
    { emoji: '🦜', text: "Pip's respect. Extremely rare. Do not spend it all at once." },
    { emoji: '🍪', text: 'One (1) imaginary cookie. It tastes like validation.' },
    { emoji: '⚡', text: '+15 XP! Pip is impressed. Pip is easily impressed.', xp: 15 },
    { emoji: '🧦', text: 'One slightly used sock. It is the thought that counts.' },
    { emoji: '🥐', text: 'A coupon for a croissant. Not redeemable. Still delicious.' },
    { emoji: '💎', text: '+25 XP! You found the good box. Tell no one.', xp: 25 },
    { emoji: '🎩', text: 'A tiny hat for Pip. He will wear it to important meetings.' },
    { emoji: '📜', text: '“Certificate of Extreme Yapping.” Frame it. Show your family.' },
  ];

  const LEADERS_BASE = {
    week: [
      { name: 'BagelQueen', avatar: '🥨', color: 'bg-mango-soft', xp: 412 },
      { name: 'DefinitelyNotADog', avatar: '🐕', color: 'bg-grass-soft', xp: 356 },
      { name: 'SpeaksInEmoji', avatar: '😎', color: 'bg-sky-soft', xp: 298 },
      { name: 'Tacos4Life', avatar: '🌮', color: 'bg-berry-soft', xp: 241 },
      { name: 'xX_NoobNoob_Xx', avatar: '🎮', color: 'bg-grape-soft', xp: 187 },
      { name: 'MildlyFluent', avatar: '🧉', color: 'bg-mango-soft', xp: 132 },
    ],
    all: [
      { name: 'BagelQueen', avatar: '🥨', color: 'bg-mango-soft', xp: 18420 },
      { name: 'DefinitelyNotADog', avatar: '🐕', color: 'bg-grass-soft', xp: 16750 },
      { name: 'SpeaksInEmoji', avatar: '😎', color: 'bg-sky-soft', xp: 15980 },
      { name: 'Tacos4Life', avatar: '🌮', color: 'bg-berry-soft', xp: 14210 },
      { name: 'xX_NoobNoob_Xx', avatar: '🎮', color: 'bg-grape-soft', xp: 12640 },
      { name: 'MildlyFluent', avatar: '🧉', color: 'bg-mango-soft', xp: 11290 },
    ],
  };

  /* ============================================================
     State
  ============================================================ */
  const DEFAULT_STATE = {
    lang: 'Spanish',
    xp: 340,
    weeklyXp: 120,
    streak: 12,
    lastLessonDate: null,
    completed: [0],
    sound: true,
    daily: { date: '', xp: 0, lessons: 0, said: false },
  };

  function loadState() {
    let saved = {};
    try {
      saved = JSON.parse(store.get(STORAGE_KEY) || 'null') || {};
    } catch (error) {
      saved = {};
    }

    const merged = {
      ...DEFAULT_STATE,
      ...saved,
      daily: { ...DEFAULT_STATE.daily, ...(saved.daily || {}) },
    };

    if (!QUIZ[merged.lang]) merged.lang = 'Spanish';
    if (!Array.isArray(merged.completed)) merged.completed = [0];
    const completed = [];
    for (let index = 0; index < NODE_COUNT; index += 1) {
      if (merged.completed.includes(index)) completed.push(index);
      else break;
    }
    merged.completed = completed.length ? completed : [0];

    merged.xp = Number.isFinite(Number(merged.xp)) ? Math.max(0, Number(merged.xp)) : 340;
    merged.weeklyXp = Number.isFinite(Number(merged.weeklyXp)) ? Math.max(0, Number(merged.weeklyXp)) : 120;
    merged.streak = Number.isFinite(Number(merged.streak)) ? Math.max(0, Number(merged.streak)) : 12;
    merged.sound = Boolean(merged.sound);
    return merged;
  }

  const state = loadState();

  function saveState() {
    store.set(STORAGE_KEY, JSON.stringify(state));
  }

  function ensureDaily() {
    const today = todayKey();
    if (state.daily.date !== today) {
      state.daily = { date: today, xp: 0, lessons: 0, said: false };
      saveState();
    }
  }

  /* ============================================================
     Sound
  ============================================================ */
  let audioContext = null;

  function ensureAudio() {
    if (!state.sound) return null;
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function beep(frequency, duration, type, volume, delay, endFrequency) {
    const context = ensureAudio();
    if (!context) return;
    const startAt = context.currentTime + (delay || 0);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type || 'sine';
    oscillator.frequency.setValueAtTime(frequency, startAt);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + duration);
    }
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume || 0.05, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
  }

  const sfx = {
    click() {
      beep(520, 0.06, 'triangle', 0.045, 0, 430);
    },
    pop() {
      beep(700, 0.1, 'sine', 0.055, 0, 1250);
    },
    boop() {
      beep(900, 0.12, 'sine', 0.06, 0, 360);
    },
    correct() {
      [660, 880, 1175].forEach((frequency, index) => {
        beep(frequency, 0.14, 'triangle', 0.05, index * 0.09);
      });
    },
    wrong() {
      beep(190, 0.22, 'sawtooth', 0.03, 0, 110);
    },
    complete() {
      [523, 659, 784, 1047].forEach((frequency, index) => {
        beep(frequency, 0.22, 'triangle', 0.045, index * 0.11);
      });
    },
    coin() {
      [988, 1319].forEach((frequency, index) => {
        beep(frequency, 0.1, 'square', 0.028, index * 0.08);
      });
    },
  };

  function updateSoundUI() {
    $$('.sound-toggle').forEach((button) => {
      button.setAttribute('aria-pressed', String(state.sound));
      button.setAttribute('aria-label', state.sound ? 'Mute sound effects' : 'Enable sound effects');
      const icon = $('.sound-icon', button);
      if (icon) icon.textContent = state.sound ? '🔊' : '🔇';
      const label = $('.sound-label', button);
      if (label) label.textContent = state.sound ? 'On' : 'Off';
    });
  }

  /* ============================================================
     Toast
  ============================================================ */
  const toastEl = $('#toast');
  let toastTimer = null;

  function showToast(message, duration = 3400) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), duration);
  }

  /* ============================================================
     Confetti
  ============================================================ */
  const confettiCanvas = $('#confettiCanvas');
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  const CONFETTI_COLORS = ['#58cc02', '#1cb0f6', '#ce82ff', '#ffc800', '#ff4b4b', '#ff9600', '#ffffff'];
  let confettiParticles = [];
  let confettiFrame = null;

  function sizeConfettiCanvas() {
    if (!confettiCanvas || !confettiCtx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = Math.floor(window.innerWidth * ratio);
    confettiCanvas.height = Math.floor(window.innerHeight * ratio);
    confettiCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    confettiParticles.forEach((particle) => {
      particle.vy += 0.22;
      particle.vx *= 0.992;
      particle.vy *= 0.995;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.spin;
      particle.life -= 0.009;

      confettiCtx.save();
      confettiCtx.globalAlpha = Math.max(0, particle.life);
      confettiCtx.translate(particle.x, particle.y);
      confettiCtx.rotate(particle.rotation);
      confettiCtx.fillStyle = particle.color;
      if (particle.shape === 'rect') {
        confettiCtx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.62);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      }
      confettiCtx.restore();
    });

    confettiParticles = confettiParticles.filter(
      (particle) => particle.life > 0 && particle.y < window.innerHeight + 60
    );

    if (confettiParticles.length) {
      confettiFrame = window.requestAnimationFrame(drawConfetti);
    } else {
      confettiFrame = null;
      confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function burst(x, y, count = 60) {
    if (!confettiCtx || reducedMotion.matches) return;

    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      confettiParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (2 + Math.random() * 5),
        size: 5 + Math.random() * 7,
        color: pick(CONFETTI_COLORS),
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        life: 1,
      });
    }

    if (!confettiFrame) confettiFrame = window.requestAnimationFrame(drawConfetti);
  }

  function burstFromElement(element, count = 30) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, count);
  }

  function celebrate() {
    burst(window.innerWidth / 2, window.innerHeight * 0.26, 90);
    window.setTimeout(() => burst(window.innerWidth * 0.18, window.innerHeight * 0.4, 45), 160);
    window.setTimeout(() => burst(window.innerWidth * 0.82, window.innerHeight * 0.4, 45), 320);
  }

  /* ============================================================
     Header, menu, scroll effects
  ============================================================ */
  const siteHeader = $('#siteHeader');
  const mobileMenu = $('#mobileMenu');
  const menuBtn = $('#menuBtn');
  const menuIcon = $('#menuIcon');
  const backToTop = $('#backToTop');
  let menuOpen = false;

  function setMenu(open) {
    if (!mobileMenu || !menuBtn) return;
    menuOpen = open;
    mobileMenu.classList.toggle('open', open);
    mobileMenu.inert = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (menuIcon) menuIcon.textContent = open ? '✕' : '☰';
  }

  function handleScroll() {
    if (siteHeader) siteHeader.classList.toggle('is-scrolled', window.scrollY > 16);

    if (backToTop) {
      const visible = window.scrollY > 640;
      backToTop.classList.toggle('pointer-events-none', !visible);
      backToTop.classList.toggle('opacity-0', !visible);
      backToTop.classList.toggle('translate-y-16', !visible);
      backToTop.tabIndex = visible ? 0 : -1;
      backToTop.setAttribute('aria-hidden', String(!visible));
    }
  }

  function initHeader() {
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        setMenu(!menuOpen);
        sfx.click();
      });
    }

    if (mobileMenu) {
      $$('a', mobileMenu).forEach((link) => {
        link.addEventListener('click', () => setMenu(false));
      });
    }

    document.addEventListener('click', (event) => {
      if (!menuOpen) return;
      if (mobileMenu && mobileMenu.contains(event.target)) return;
      if (menuBtn && menuBtn.contains(event.target)) return;
      setMenu(false);
    });

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        sfx.click();
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ============================================================
     Sound toggle
  ============================================================ */
  function initSoundToggle() {
    updateSoundUI();
    $$('.sound-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        state.sound = !state.sound;
        saveState();
        updateSoundUI();
        if (state.sound) {
          ensureAudio();
          sfx.pop();
          showToast('Sound on! Prepare for squeaks. 🔊');
        } else {
          showToast('Muted. Silence is golden. 🤫');
        }
      });
    });
  }

  /* ============================================================
     Scroll reveals & counters
  ============================================================ */
  function initReveals() {
    const items = $$('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    );

    items.forEach((item) => observer.observe(item));
  }

  function animateNumber(element) {
    const target = Number(element.dataset.count);
    const decimals = Number(element.dataset.decimals || 0);
    if (!Number.isFinite(target)) return;

    if (reducedMotion.matches) {
      element.textContent = target.toFixed(decimals);
      return;
    }

    const duration = 1400;
    const startedAt = performance.now();
    const start = 0;

    function frame(now) {
      const progress = clamp((now - startedAt) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = (start + (target - start) * eased).toFixed(decimals);
      if (progress < 1) window.requestAnimationFrame(frame);
      else element.textContent = target.toFixed(decimals);
    }

    element.textContent = '0';
    window.requestAnimationFrame(frame);
  }

  function initCounters() {
    const numbers = $$('[data-count]');
    if (!numbers.length) return;
    const host = numbers[0].closest('section') || numbers[0];

    if (!('IntersectionObserver' in window)) {
      numbers.forEach((number) => animateNumber(number));
      return;
    }

    let played = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (played || !entries.some((entry) => entry.isIntersecting)) return;
        played = true;
        numbers.forEach((number) => animateNumber(number));
        observer.disconnect();
      },
      { threshold: 0.35 }
    );
    observer.observe(host);
  }

  /* ============================================================
     Marquees
  ============================================================ */
  function initMarquees() {
    $$('.marquee').forEach((marquee) => {
      const track = $('.marquee-track', marquee);
      const group = $('.marquee-group', track || marquee);
      if (!track || !group) return;
      const clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      $$('[id]', clone).forEach((element) => element.removeAttribute('id'));
      track.appendChild(clone);
    });
  }

  /* ============================================================
     Greetings & mascot
  ============================================================ */
  const greetingNames = Object.keys(LANGUAGES);
  let greetingIndex = greetingNames.indexOf(state.lang);
  let greetingTimer = null;

  function showGreeting(icon, text, pop = true) {
    const bubble = $('#speechBubble');
    const iconEl = $('#speechFlag');
    const textEl = $('#speechText');
    if (iconEl) iconEl.textContent = icon;
    if (textEl) textEl.textContent = text;
    if (bubble && pop && !reducedMotion.matches) {
      bubble.classList.remove('speech-pop');
      void bubble.offsetWidth;
      bubble.classList.add('speech-pop');
    }
  }

  function restartGreetingTimer() {
    window.clearInterval(greetingTimer);
    greetingTimer = window.setInterval(() => {
      greetingIndex = (greetingIndex + 1) % greetingNames.length;
      const name = greetingNames[greetingIndex];
      const meta = LANGUAGES[name];
      showGreeting(meta.icon, meta.hello);
    }, 3200);
  }

  function initMascot() {
    const mascotBtn = $('#mascotBtn');
    if (!mascotBtn) return;

    const initial = LANGUAGES[state.lang];
    showGreeting(initial.icon, initial.hello, false);
    restartGreetingTimer();

    mascotBtn.addEventListener('click', () => {
      sfx.boop();
      showGreeting('🦜', pick(PIP_LINES));
      restartGreetingTimer();

      if (!reducedMotion.matches) {
        mascotBtn.animate(
          [
            { transform: 'scale(1) rotate(0deg)' },
            { transform: 'scale(1.06) rotate(-2deg)' },
            { transform: 'scale(0.98) rotate(1deg)' },
            { transform: 'scale(1) rotate(0deg)' },
          ],
          { duration: 460, easing: 'ease-out' }
        );
      }

      if (Math.random() > 0.5) burstFromElement(mascotBtn, 22);
    });
  }

  /* ============================================================
     Language selection
  ============================================================ */
  function syncLanguageUI() {
    const meta = LANGUAGES[state.lang];
    $$('.lang-card').forEach((card) => {
      const active = card.dataset.lang === state.lang;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-pressed', String(active));
    });

    const badge = $('#currentLangBadge');
    const icon = $('#currentLangIcon');
    if (badge) badge.textContent = state.lang;
    if (icon) icon.textContent = meta.icon;
  }

  function selectLanguage(name, options = {}) {
    if (!LANGUAGES[name]) return;
    state.lang = name;
    saveState();
    syncLanguageUI();

    greetingIndex = greetingNames.indexOf(name);
    showGreeting(LANGUAGES[name].icon, LANGUAGES[name].hello);
    restartGreetingTimer();

    if (!options.silent) {
      showToast(LANGUAGES[name].toast, 3800);
    }
  }

  function initLanguages() {
    $$('.lang-card').forEach((card) => {
      card.addEventListener('click', () => {
        const name = card.dataset.lang;
        sfx.pop();
        selectLanguage(name);
        if (!reducedMotion.matches) {
          card.animate(
            [
              { transform: 'translateY(-4px) rotate(-0.5deg) scale(1)' },
              { transform: 'translateY(-6px) rotate(1deg) scale(1.02)' },
              { transform: 'translateY(-4px) rotate(-0.5deg) scale(1)' },
            ],
            { duration: 420, easing: 'ease-out' }
          );
        }
      });
    });
    selectLanguage(state.lang, { silent: true });
  }

  /* ============================================================
     Misc buttons
  ============================================================ */
  function initMiscButtons() {
    const streakBtn = $('#streakBtn');
    if (streakBtn) {
      streakBtn.addEventListener('click', () => {
        sfx.pop();
        showToast(`🔥 ${state.streak}-day streak! Touch grass? No. Touch a lesson.`, 4200);
        burstFromElement(streakBtn, 18);
      });
    }

    const guidebookBtn = $('#guidebookBtn');
    if (guidebookBtn) {
      guidebookBtn.addEventListener('click', () => {
        sfx.click();
        showToast('📖 Guidebook rule 1: be brave. Rule 2: snacks. Rule 3: there is no rule 3.', 4600);
      });
    }

    const askPipBtn = $('#askPipBtn');
    if (askPipBtn) {
      askPipBtn.addEventListener('click', () => {
        sfx.pop();
        showToast(`🦜 ${pick(ASK_PIP)}`, 5600);
        burstFromElement(askPipBtn, 14);
      });
    }

    $$('[data-toast]').forEach((element) => {
      element.addEventListener('click', () => {
        sfx.click();
        showToast(element.dataset.toast, 4600);
      });
    });

    $$('[data-confetti]').forEach((element) => {
      element.addEventListener('click', () => {
        sfx.click();
        burstFromElement(element, 28);
      });
    });
  }

  /* ============================================================
     Learning path
  ============================================================ */
  const pathTrack = $('#pathTrack');
  const pathSvg = $('#pathSvg');

  function drawPath() {
    if (!pathTrack || !pathSvg) return;
    const nodes = $$('.path-node', pathTrack);
    if (nodes.length < 2) return;

    const trackRect = pathTrack.getBoundingClientRect();
    const points = nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: rect.left - trackRect.left + rect.width / 2,
        y: rect.top - trackRect.top + rect.height / 2,
      };
    });

    const width = pathTrack.clientWidth;
    const height = pathTrack.clientHeight;
    pathSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const pathFor = (list) => {
      if (list.length < 2) return '';
      let d = `M ${list[0].x.toFixed(1)} ${list[0].y.toFixed(1)}`;
      for (let index = 1; index < list.length; index += 1) {
        const previous = list[index - 1];
        const current = list[index];
        const middle = (previous.y + current.y) / 2;
        d += ` C ${previous.x.toFixed(1)} ${middle.toFixed(1)}, ${current.x.toFixed(1)} ${middle.toFixed(1)}, ${current.x.toFixed(1)} ${current.y.toFixed(1)}`;
      }
      return d;
    };

    const fullPath = pathFor(points);
    const progressEnd = Math.min(state.completed.length, points.length - 1);
    const progressPath = progressEnd >= 1 ? pathFor(points.slice(0, progressEnd + 1)) : '';

    pathSvg.innerHTML = `
      <path d="${fullPath}" fill="none" stroke="#e7e2d4" stroke-width="10" stroke-linecap="round" />
      <path d="${fullPath}" fill="none" stroke="#c9c2b0" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 13" />
      ${progressPath ? `<path class="path-dash" d="${progressPath}" fill="none" stroke="#9be95c" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 11" />` : ''}
    `;
  }

  function refreshPath() {
    if (!pathTrack) return;
    const completedCount = state.completed.length;
    const allDone = completedCount >= NODE_COUNT;

    $$('.path-node', pathTrack).forEach((node) => {
      const index = Number(node.dataset.node);
      const data = PATH_NODES[index];
      if (!data) return;

      node.classList.remove('done', 'current', 'locked');
      node.querySelectorAll('.start-bubble').forEach((bubble) => bubble.remove());
      const tip = $('.node-tip', node);

      if (index < completedCount) {
        node.classList.add('done');
        if (tip) tip.textContent = `${data.label} · completed · tap to replay`;
        node.setAttribute('aria-label', `Lesson ${index + 1}: ${data.label}, completed`);
      } else if (index === completedCount && !allDone) {
        node.classList.add('current');
        if (tip) tip.textContent = `${data.label} · ${data.minutes} min · start here`;
        node.setAttribute('aria-label', `Lesson ${index + 1}: ${data.label}, start here`);

        const bubble = document.createElement('span');
        bubble.className = 'start-bubble';
        bubble.setAttribute('aria-hidden', 'true');
        bubble.textContent = 'START';
        node.appendChild(bubble);
      } else {
        node.classList.add('locked');
        if (tip) tip.textContent = `${data.label} · locked`;
        node.setAttribute('aria-label', `Lesson ${index + 1}: ${data.label}, locked`);
      }
    });

    const progressBar = $('#unitProgressBar');
    const progressText = $('#unitProgressText');
    if (progressBar) progressBar.style.width = `${(completedCount / NODE_COUNT) * 100}%`;
    if (progressText) progressText.textContent = `${completedCount} / ${NODE_COUNT} lessons`;

    const resumeBtn = $('#resumeBtn');
    if (resumeBtn) resumeBtn.textContent = allDone ? 'Review lesson 🎉' : 'Resume lesson →';

    window.requestAnimationFrame(drawPath);
  }

  function initPath() {
    if (!pathTrack) return;

    $$('.path-node', pathTrack).forEach((node) => {
      node.addEventListener('click', () => {
        const index = Number(node.dataset.node);
        if (index > state.completed.length) {
          sfx.wrong();
          showToast('🔒 Locked! Finish the lesson before this one. Patience, grasshopper.', 3600);
          if (!reducedMotion.matches) {
            node.animate(
              [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(-3px)' },
                { transform: 'translateX(0)' },
              ],
              { duration: 320, easing: 'ease-in-out' }
            );
          }
          return;
        }
        sfx.pop();
        openLesson(index);
      });
    });

    const resumeBtn = $('#resumeBtn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        if (state.completed.length >= NODE_COUNT) {
          showToast('🎉 Unit complete! Have a victory croissant. You have earned it.', 4200);
          sfx.complete();
          celebrate();
          openLesson(NODE_COUNT - 1);
          return;
        }
        openLesson(state.completed.length);
      });
    }

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => window.requestAnimationFrame(drawPath));
      observer.observe(pathTrack);
    }
    window.addEventListener('resize', () => window.requestAnimationFrame(drawPath));

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => window.requestAnimationFrame(drawPath)).catch(() => {});
    }

    refreshPath();
  }

  /* ============================================================
     Quests, XP and stats
  ============================================================ */
  function awardXp(amount) {
    ensureDaily();
    state.xp += amount;
    state.weeklyXp += amount;
    state.daily.xp += amount;
    saveState();
    refreshStatsUI();

    const navXp = $('#navXp');
    if (navXp && !reducedMotion.matches) {
      navXp.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.35)', color: '#58cc02' },
          { transform: 'scale(1)' },
        ],
        { duration: 420, easing: 'ease-out' }
      );
    }
  }

  function updateQuests() {
    ensureDaily();
    const xpTarget = 30;
    const xpValue = clamp(state.daily.xp, 0, xpTarget);
    const lessonsValue = clamp(state.daily.lessons, 0, 1);

    const xpText = $('#questXpText');
    if (xpText) xpText.textContent = state.daily.xp >= xpTarget ? 'Done ✓' : `${state.daily.xp} / ${xpTarget}`;
    const xpBar = $('#questXpBar');
    if (xpBar) xpBar.style.width = `${(xpValue / xpTarget) * 100}%`;

    const lessonText = $('#questLessonText');
    if (lessonText) lessonText.textContent = state.daily.lessons >= 1 ? 'Done ✓' : '0 / 1';
    const lessonBar = $('#questLessonBar');
    if (lessonBar) lessonBar.style.width = `${lessonsValue * 100}%`;

    const sayBar = $('#questSayBar');
    if (sayBar) sayBar.style.width = state.daily.said ? '100%' : '0%';

    const sayBtn = $('#sayQuestBtn');
    if (sayBtn) {
      sayBtn.classList.toggle('is-done', state.daily.said);
      sayBtn.setAttribute('aria-pressed', String(state.daily.said));
      sayBtn.textContent = state.daily.said ? 'Done ✓' : 'Done';
    }
  }

  function refreshStatsUI() {
    ensureDaily();
    const navXp = $('#navXp');
    if (navXp) navXp.textContent = state.xp.toLocaleString();

    const streakNav = $('#streakCount');
    if (streakNav) streakNav.textContent = state.streak;
    const streakCard = $('#streakCardCount');
    if (streakCard) streakCard.textContent = state.streak;

    const goal = clamp(state.daily.xp, 0, 20);
    const goalText = $('#dailyGoalText');
    if (goalText) {
      goalText.textContent = state.daily.xp >= 20 ? 'Goal smashed! 🎉' : `${goal} / 20 XP`;
    }
    const goalBar = $('#dailyGoalBar');
    if (goalBar) goalBar.style.width = `${(goal / 20) * 100}%`;

    updateQuests();
    renderLeaderboard();
  }

  function initQuests() {
    const sayBtn = $('#sayQuestBtn');
    if (sayBtn) {
      sayBtn.addEventListener('click', () => {
        ensureDaily();
        state.daily.said = !state.daily.said;
        saveState();
        updateQuests();
        sfx.coin();
        if (state.daily.said) {
          showToast('🦜 Quest complete! Pip heard that. He is pretending not to be moved.');
          burstFromElement(sayBtn, 20);
        } else {
          showToast('Quest un-done. Pip is pretending he did not hear that either.');
        }
      });
    }

    const mysteryBtn = $('#mysteryBtn');
    if (mysteryBtn) {
      mysteryBtn.addEventListener('click', () => {
        const reward = pick(MYSTERY_REWARDS);
        sfx.pop();
        if (reward.xp) awardXp(reward.xp);
        showToast(`${reward.emoji} ${reward.text}`, 4400);
        burstFromElement(mysteryBtn, 34);
        if (!reducedMotion.matches) {
          mysteryBtn.animate(
            [
              { transform: 'rotate(0deg) scale(1)' },
              { transform: 'rotate(-3deg) scale(0.97)' },
              { transform: 'rotate(3deg) scale(1.03)' },
              { transform: 'rotate(0deg) scale(1)' },
            ],
            { duration: 450, easing: 'ease-out' }
          );
        }
      });
    }
  }

  /* ============================================================
     Leaderboard
  ============================================================ */
  let boardMode = 'week';

  function getLeaderboardRows() {
    const base = LEADERS_BASE[boardMode];
    const yourXp = boardMode === 'week' ? state.weeklyXp : state.xp;
    return [...base, { name: 'You', avatar: '🐣', color: 'bg-grass-soft', xp: yourXp, you: true }].sort(
      (a, b) => b.xp - a.xp
    );
  }

  function renderLeaderboard() {
    const list = $('#leaderboardList');
    if (!list) return;
    const rows = getLeaderboardRows();
    const max = Math.max(...rows.map((row) => row.xp), 1);

    list.innerHTML = rows
      .map((row, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `<span class="text-xs font-extrabold text-muted">${rank}</span>`;
        const youBadge = row.you
          ? '<span class="ml-1.5 rounded-full bg-grass px-1.5 py-0.5 align-middle font-display text-[9px] font-extrabold tracking-wide text-white uppercase">you</span>'
          : '';
        return `
          <div class="leader-row ${row.you ? 'is-you' : ''}" style="animation-delay:${index * 32}ms">
            <span class="grid w-7 shrink-0 place-items-center font-display text-sm font-extrabold">${medal}</span>
            <span class="leader-avatar ${row.color}" aria-hidden="true">${row.avatar}</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-2">
                <p class="truncate font-display text-sm font-extrabold">${row.name}${youBadge}</p>
                <p class="shrink-0 font-display text-xs font-extrabold ${row.you ? 'text-sky-dark' : 'text-muted'}">${row.xp.toLocaleString()} XP</p>
              </div>
              <div class="leader-bar"><i style="width:${Math.max(8, Math.round((row.xp / max) * 100))}%"></i></div>
            </div>
          </div>
        `;
      })
      .join('');

    const yourRank = rows.findIndex((row) => row.you) + 1;
    const leagueRank = $('#leagueRank');
    if (leagueRank) leagueRank.textContent = `#${yourRank}`;
  }

  function initLeaderboard() {
    $$('[data-board]').forEach((button) => {
      button.addEventListener('click', () => {
        boardMode = button.dataset.board;
        $$('[data-board]').forEach((other) => {
          const active = other === button;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-selected', String(active));
        });
        sfx.click();
        renderLeaderboard();
      });
    });
    renderLeaderboard();
  }

  /* ============================================================
     FAQ
  ============================================================ */
  function initFaq() {
    const items = $$('.faq-item');
    items.forEach((item) => {
      const button = $('.faq-btn', item);
      if (!button) return;
      button.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        items.forEach((other) => {
          other.classList.remove('open');
          const otherButton = $('.faq-btn', other);
          if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('open');
          button.setAttribute('aria-expanded', 'true');
        }
        sfx.click();
      });
    });
  }

  /* ============================================================
     Newsletter
  ============================================================ */
  function initNewsletter() {
    const form = $('#newsletterForm');
    const email = $('#newsletterEmail');
    const message = $('#newsletterMsg');
    if (!form || !email) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = email.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

      if (!valid) {
        sfx.wrong();
        showToast('👀 That email looks suspicious. Try a real one. Pip is squinting.', 3800);
        email.focus();
        if (!reducedMotion.matches) {
          email.animate(
            [
              { transform: 'translateX(0)' },
              { transform: 'translateX(-6px)' },
              { transform: 'translateX(6px)' },
              { transform: 'translateX(-3px)' },
              { transform: 'translateX(0)' },
            ],
            { duration: 340, easing: 'ease-in-out' }
          );
        }
        return;
      }

      sfx.complete();
      const submit = $('button[type="submit"]', form);
      burstFromElement(submit || email, 55);
      if (message) {
        message.textContent = 'You are in! Check your inbox. Or don’t — we’re not your mom. 💌';
      }
      showToast('💌 Welcome to the nonsense. Pip is thrilled. (He is doing a dance.)', 4300);
      form.reset();
      if (submit) {
        const original = submit.textContent;
        submit.textContent = "You're in ✓";
        submit.disabled = true;
        submit.classList.add('opacity-80');
        window.setTimeout(() => {
          submit.textContent = original;
          submit.disabled = false;
          submit.classList.remove('opacity-80');
        }, 2600);
      }
    });
  }

  /* ============================================================
     Lesson modal & quiz
  ============================================================ */
  const lessonModal = $('#lessonModal');
  const lessonBody = $('#lessonBody');
  const lessonFeedback = $('#lessonFeedback');
  const closeLessonBtn = $('#closeLesson');
  const heartsEl = $('#hearts');
  const lessonProgress = $('#lessonProgressBar');
  let lastFocusedElement = null;

  const lesson = {
    active: false,
    nodeIndex: null,
    questions: [],
    index: 0,
    hearts: 3,
    xpEarned: 0,
    correct: 0,
    answered: false,
  };

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return map[character];
    });

  function setLessonProgress(percent) {
    if (lessonProgress) lessonProgress.style.width = `${clamp(percent, 0, 100)}%`;
  }

  function renderHearts() {
    if (!heartsEl) return;
    $$('.heart', heartsEl).forEach((heart, index) => {
      heart.classList.toggle('lost', index >= lesson.hearts);
    });
    heartsEl.setAttribute('aria-label', `${lesson.hearts} ${lesson.hearts === 1 ? 'heart' : 'hearts'} remaining`);
  }

  function hideFeedback() {
    if (!lessonFeedback) return;
    lessonFeedback.className = 'hidden';
    lessonFeedback.innerHTML = '';
  }

  function prepareQuestions(languageName) {
    return QUIZ[languageName].questions.map((question) => {
      const options = [...question.options];
      const correctText = options[question.answer ?? 0];
      for (let index = options.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
      }
      return { ...question, options, answer: options.indexOf(correctText) };
    });
  }

  function startQuiz(nodeIndex) {
    lesson.nodeIndex = nodeIndex;
    lesson.questions = prepareQuestions(state.lang);
    lesson.index = 0;
    lesson.hearts = 3;
    lesson.xpEarned = 0;
    lesson.correct = 0;
    lesson.answered = false;
    lesson.active = true;

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    hideFeedback();
    renderHearts();
    setLessonProgress(0);
    renderQuestion();
  }

  function openLesson(nodeIndex) {
    if (!lessonModal || !lessonBody) return;
    if (!lessonModal.classList.contains('open')) {
      lastFocusedElement = document.activeElement;
    }

    lessonModal.classList.add('open');
    lessonModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    startQuiz(nodeIndex);
    sfx.pop();

    window.setTimeout(() => {
      if (closeLessonBtn) closeLessonBtn.focus({ preventScroll: true });
    }, 60);
  }

  function closeLesson() {
    if (!lessonModal || !lessonModal.classList.contains('open')) return;
    lessonModal.classList.remove('open');
    lessonModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lesson.active = false;
    hideFeedback();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    sfx.click();
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function renderQuestion() {
    if (!lessonBody) return;
    const meta = QUIZ[state.lang];
    const question = lesson.questions[lesson.index];
    const total = lesson.questions.length;

    lesson.answered = false;
    hideFeedback();
    setLessonProgress((lesson.index / total) * 100);

    const optionsHtml = question.options
      .map(
        (option, index) => `
          <button type="button" class="answer-btn" data-answer="${index}">
            <span class="key">${String.fromCharCode(65 + index)}</span>
            <span class="min-w-0 flex-1 text-sm sm:text-base">${option}</span>
          </button>
        `
      )
      .join('');

    lessonBody.innerHTML = `
      <div class="animate-pop">
        <div class="flex items-center justify-between gap-3">
          <p class="option-key text-grass-dark">${meta.icon} ${meta.label} · question ${lesson.index + 1}</p>
          <p class="option-key text-muted">${lesson.index + 1} of ${total}</p>
        </div>

        <div class="mt-4 flex items-start gap-3">
          <span class="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-mango-soft text-3xl" aria-hidden="true">${question.emoji}</span>
          <div class="min-w-0 pt-0.5">
            <p class="text-[10px] font-extrabold tracking-widest text-muted uppercase">Pick the right answer</p>
            <h2 id="lessonTitle" class="mt-1 font-display text-xl leading-tight font-extrabold sm:text-2xl">${question.prompt}</h2>
          </div>
        </div>

        <button type="button" class="mt-4 inline-flex items-center gap-1.5 rounded-xl border-2 border-ink/10 bg-white px-3 py-1.5 font-display text-xs font-extrabold text-muted transition hover:border-sky hover:bg-sky-soft/60 hover:text-sky-dark" data-speak="${escapeHtml(question.speak || '')}">
          <span aria-hidden="true">🔊</span> Hear it
        </button>

        <div class="mt-5 space-y-2.5">
          ${optionsHtml}
        </div>

        <p class="mt-4 text-center text-[11px] font-bold text-muted">Choose wisely. Pip is watching. He always is.</p>
      </div>
    `;
  }

  function selectAnswer(selectedIndex) {
    if (lesson.answered || !lesson.active) return;
    const question = lesson.questions[lesson.index];
    const isCorrect = selectedIndex === question.answer;
    lesson.answered = true;

    const buttons = $$('[data-answer]', lessonBody);
    buttons.forEach((button, index) => {
      button.disabled = true;
      if (index === question.answer) button.classList.add('correct');
      else if (index === selectedIndex) button.classList.add('wrong');
      else button.classList.add('dimmed');
    });

    if (isCorrect) {
      lesson.correct += 1;
      lesson.xpEarned += 10;
      sfx.correct();
      if (!reducedMotion.matches) burstFromElement(buttons[selectedIndex], 16);
      setLessonProgress(((lesson.index + 1) / lesson.questions.length) * 100);
    } else {
      lesson.hearts = Math.max(0, lesson.hearts - 1);
      sfx.wrong();
      renderHearts();
      if (heartsEl && !reducedMotion.matches) {
        heartsEl.animate(
          [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-4px)' },
            { transform: 'translateX(4px)' },
            { transform: 'translateX(0)' },
          ],
          { duration: 280, easing: 'ease-in-out' }
        );
      }
    }

    const titlesGood = ['Nice one!', 'Correct!', 'Look at you go!', 'Chef’s kiss.', 'Absolutely!'];
    const emojisGood = ['🎉', '✨', '🥳', '💚', '🌟'];
    const title = isCorrect ? pick(titlesGood) : 'Not quite!';
    const emoji = isCorrect ? pick(emojisGood) : '🙈';
    const detail = isCorrect
      ? question.fact
      : `The answer was <span class="font-extrabold text-ink">${question.options[question.answer]}</span>. ${question.fact}`;

    if (lessonFeedback) {
      lessonFeedback.className = `feedback ${isCorrect ? '' : 'bad'}`;
      lessonFeedback.setAttribute('role', 'status');
      lessonFeedback.innerHTML = `
        <div class="flex items-start gap-3 px-5 py-4 sm:px-6">
          <span class="text-2xl" aria-hidden="true">${emoji}</span>
          <div class="min-w-0 flex-1">
            <p class="font-display text-lg leading-tight font-extrabold ${isCorrect ? 'text-grass-dark' : 'text-berry-dark'}">${title}</p>
            <p class="mt-1 text-xs leading-snug font-bold text-muted">${detail}</p>
          </div>
        </div>
        <div class="border-t-2 ${isCorrect ? 'border-grass/20' : 'border-berry/20'} px-5 py-4 sm:px-6">
          <button type="button" data-feedback-action="continue" class="btn ${isCorrect ? 'btn-green' : 'btn-berry'} w-full">
            ${lesson.hearts === 0 ? 'Oh no…' : 'Continue'}
          </button>
        </div>
      `;
    }
  }

  function continueLesson() {
    if (!lesson.active) return;
    hideFeedback();
    if (lesson.hearts <= 0) {
      renderFail();
      return;
    }
    lesson.index += 1;
    if (lesson.index >= lesson.questions.length) {
      completeLesson();
      return;
    }
    renderQuestion();
  }

  function commitCompletion(nodeIndex, xpGained) {
    ensureDaily();
    const today = todayKey();

    if (state.lastLessonDate !== today) {
      state.streak += 1;
      state.lastLessonDate = today;
    }

    if (nodeIndex === state.completed.length) {
      state.completed.push(nodeIndex);
    }

    state.xp += xpGained;
    state.weeklyXp += xpGained;
    state.daily.xp += xpGained;
    state.daily.lessons += 1;
    saveState();

    refreshStatsUI();
    refreshPath();
  }

  function completeLesson() {
    hideFeedback();
    const bonus = 10;
    const earned = lesson.xpEarned + bonus;
    const accuracy = Math.round((lesson.correct / lesson.questions.length) * 100);

    setLessonProgress(100);
    commitCompletion(lesson.nodeIndex, earned);
    sfx.complete();
    celebrate();
    renderComplete(earned, accuracy);
  }

  function renderComplete(earned, accuracy) {
    if (!lessonBody) return;
    const allDone = state.completed.length >= NODE_COUNT;
    const nextIndex = Math.min(state.completed.length, NODE_COUNT - 1);
    const nextLabel = PATH_NODES[nextIndex] ? PATH_NODES[nextIndex].label : 'More nonsense';
    const nextCopy = allDone
      ? 'You finished the whole unit. The café is terrified of you now.'
      : `Next up: <span class="font-extrabold text-ink">${nextLabel}</span>. Close this and tap the glowing node.`;

    lessonBody.innerHTML = `
      <div class="animate-pop py-2 text-center">
        <div class="mx-auto grid h-24 w-24 place-items-center rounded-full bg-mango-soft text-6xl animate-bob">🏆</div>
        <p class="eyebrow mt-5 justify-center text-grass-dark">Lesson complete</p>
        <h2 id="lessonTitle" class="mt-2 font-display text-3xl font-extrabold sm:text-4xl">You absolute legend.</h2>
        <p class="mt-2 text-sm font-bold text-muted">That’s <span class="text-grass-dark">+${earned} XP</span> and one step closer to ordering snacks abroad.</p>

        <div class="mt-6 grid grid-cols-3 gap-2">
          <div class="rounded-2xl border-2 border-ink/10 bg-[#fdfbf4] px-2 py-3">
            <p class="font-display text-lg font-extrabold text-grass-dark">+${earned}</p>
            <p class="text-[9px] font-extrabold tracking-wider text-muted uppercase">XP earned</p>
          </div>
          <div class="rounded-2xl border-2 border-ink/10 bg-[#fdfbf4] px-2 py-3">
            <p class="font-display text-lg font-extrabold text-berry-dark">${state.streak} 🔥</p>
            <p class="text-[9px] font-extrabold tracking-wider text-muted uppercase">day streak</p>
          </div>
          <div class="rounded-2xl border-2 border-ink/10 bg-[#fdfbf4] px-2 py-3">
            <p class="font-display text-lg font-extrabold text-sky-dark">${accuracy}%</p>
            <p class="text-[9px] font-extrabold tracking-wider text-muted uppercase">accuracy</p>
          </div>
        </div>

        <p class="mt-4 text-xs font-bold text-muted">${nextCopy}</p>

        <div class="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="button" data-action="close" class="btn btn-green flex-1">Back to path</button>
          <button type="button" data-action="again" class="btn btn-white flex-1">Again! 🔁</button>
        </div>
        <p class="mt-3 text-[11px] font-bold text-muted">Pip is doing a little dance. Please don’t stare.</p>
      </div>
    `;
  }

  function renderFail() {
    if (!lessonBody) return;
    hideFeedback();
    lessonBody.innerHTML = `
      <div class="animate-pop py-3 text-center">
        <div class="text-6xl" aria-hidden="true">💔</div>
        <p class="eyebrow mt-4 justify-center text-berry-dark">Out of hearts</p>
        <h2 id="lessonTitle" class="mt-2 font-display text-3xl font-extrabold">Pip has fainted dramatically.</h2>
        <p class="mx-auto mt-2 max-w-xs text-sm font-bold text-muted">He does this. It is not your fault. (It is a little bit your fault.)</p>
        <div class="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="button" data-action="again" class="btn btn-green flex-1">Try again</button>
          <button type="button" data-action="close" class="btn btn-white flex-1">Maybe later</button>
        </div>
        <p class="mt-4 text-[11px] font-bold text-muted">Hearts refill instantly because this is a website and we are nice.</p>
      </div>
    `;
  }

  function restartLesson() {
    sfx.pop();
    startQuiz(lesson.nodeIndex);
  }

  function speak(text) {
    sfx.click();
    if (!text) return;
    if (!('speechSynthesis' in window)) {
      showToast('🔇 Your browser is shy and cannot do voices. Rude.');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const meta = LANGUAGES[state.lang];
      utterance.lang = meta.code || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      showToast('🔇 The voice module is feeling shy today.');
    }
  }

  function initLessonModal() {
    if (!lessonModal) return;

    if (closeLessonBtn) closeLessonBtn.addEventListener('click', closeLesson);

    lessonModal.addEventListener('click', (event) => {
      if (event.target === lessonModal) closeLesson();
    });

    if (lessonFeedback) {
      lessonFeedback.addEventListener('click', (event) => {
        const button = event.target.closest('[data-feedback-action]');
        if (!button) return;
        sfx.click();
        if (button.dataset.feedbackAction === 'continue') continueLesson();
      });
    }

    if (lessonBody) {
      lessonBody.addEventListener('click', (event) => {
        const answer = event.target.closest('[data-answer]');
        if (answer) {
          selectAnswer(Number(answer.dataset.answer));
          return;
        }

        const speakButton = event.target.closest('[data-speak]');
        if (speakButton) {
          speak(speakButton.dataset.speak);
          return;
        }

        const action = event.target.closest('[data-action]');
        if (!action) return;
        if (action.dataset.action === 'close') closeLesson();
        if (action.dataset.action === 'again') restartLesson();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (lessonModal.classList.contains('open')) closeLesson();
      else if (menuOpen) setMenu(false);
    });
  }

  /* ============================================================
     Init
  ============================================================ */
  function init() {
    ensureDaily();
    sizeConfettiCanvas();
    window.addEventListener('resize', sizeConfettiCanvas);

    initHeader();
    initSoundToggle();
    initReveals();
    initCounters();
    initMarquees();
    initLanguages();
    initMascot();
    initPath();
    initQuests();
    initLeaderboard();
    initFaq();
    initNewsletter();
    initMiscButtons();
    initLessonModal();
    refreshStatsUI();
    refreshPath();

    window.setTimeout(() => {
      drawPath();
      refreshStatsUI();
    }, 240);
  }

  init();
})();
