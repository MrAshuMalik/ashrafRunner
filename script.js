/**
     * ASHRAF RUNNER — Upgraded Cyberpunk Endless Runner
     * Features: Top-Center Game Banner, Floating ASHRAF Tag, Outfits Garage,
     * City Worlds, Speed Modes, Overdrive Fever Mode, Missions & Synthwave Audio.
     */
    (() => {
      'use strict';

      // ==========================================
      // 1. CATALOGS (SKINS, THEMES, DIFFICULTIES)
      // ==========================================
      const SKINS = [
        {
          id: 'cyan',
          name: 'Cyber Cyan',
          cost: 0,
          jacket: '#0f172a',
          trim: '#22d3ee',
          visor: '#22d3ee',
          scarf: '#f43f5e',
          leg: '#38bdf8'
        },
        {
          id: 'gold',
          name: 'Royal Gold',
          cost: 120,
          jacket: '#1c1917',
          trim: '#fbbf24',
          visor: '#fef08a',
          scarf: '#10b981',
          leg: '#f59e0b'
        },
        {
          id: 'phantom',
          name: 'Shadow Violet',
          cost: 250,
          jacket: '#1e1035',
          trim: '#e879f9',
          visor: '#f0abfc',
          scarf: '#38bdf8',
          leg: '#c084fc'
        },
        {
          id: 'inferno',
          name: 'Inferno Blaze',
          cost: 400,
          jacket: '#270e0e',
          trim: '#fb923c',
          visor: '#fde047',
          scarf: '#fbbf24',
          leg: '#f97316'
        }
      ];

      const THEMES = {
        cyber: {
          id: 'cyber',
          label: 'Cyber City',
          skyTop: '#060711',
          skyMid: '#111533',
          skyBot: '#1e1b4b',
          sunTop: 'rgba(244, 114, 182, 0.45)',
          sunBot: 'rgba(56, 189, 248, 0.03)',
          farBuilding: '#0c0f24',
          nearBuilding: '#121636',
          neonA: '#22d3ee',
          neonB: '#e879f9',
          rail: '#22d3ee',
          grid: 'rgba(34, 211, 238, 0.15)'
        },
        sunset: {
          id: 'sunset',
          label: 'Sunset Wave',
          skyTop: '#160824',
          skyMid: '#3b0d38',
          skyBot: '#7c2d12',
          sunTop: 'rgba(251, 191, 36, 0.72)',
          sunBot: 'rgba(244, 63, 94, 0.12)',
          farBuilding: '#1f0b2e',
          nearBuilding: '#2d113d',
          neonA: '#fb923c',
          neonB: '#f472b6',
          rail: '#fbbf24',
          grid: 'rgba(251, 146, 60, 0.18)'
        },
        arctic: {
          id: 'arctic',
          label: 'Arctic Pulse',
          skyTop: '#04121c',
          skyMid: '#0a2536',
          skyBot: '#134e4a',
          sunTop: 'rgba(103, 232, 249, 0.5)',
          sunBot: 'rgba(45, 212, 191, 0.05)',
          farBuilding: '#071b29',
          nearBuilding: '#0d2c3e',
          neonA: '#67e8f9',
          neonB: '#2dd4bf',
          rail: '#5eead4',
          grid: 'rgba(94, 234, 212, 0.18)'
        }
      };

      const DIFFICULTIES = {
        chill: { id: 'chill', label: 'Chill', baseSpeed: 400, scoreMult: 1.0, gapMult: 1.2 },
        pro: { id: 'pro', label: 'Pro', baseSpeed: 485, scoreMult: 1.2, gapMult: 1.0 },
        turbo: { id: 'turbo', label: 'Turbo 1.5x', baseSpeed: 585, scoreMult: 1.5, gapMult: 0.88 }
      };

      // ==========================================
      // 2. PROCEDURAL AUDIO & SYNTHWAVE ENGINE
      // ==========================================
      class AudioController {
        constructor() {
          this.ctx = null;
          this.muted = false;
          this.masterGain = null;
          this.bgmInterval = null;
          this.stepIdx = 0;
        }

        init() {
          if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.muted ? 0 : 0.36;
            this.masterGain.connect(this.ctx.destination);
          }
          if (this.ctx.state === 'suspended') {
            this.ctx.resume();
          }
        }

        toggleMute() {
          this.muted = !this.muted;
          if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.36, this.ctx.currentTime, 0.02);
          }
          return this.muted;
        }

        startMusic() {
          this.init();
          if (this.bgmInterval) return;
          const bassNotes = [110, 110, 220, 110, 130.81, 130.81, 146.83, 164.81];
          this.bgmInterval = setInterval(() => {
            if (this.muted || !this.ctx || state.status !== 'playing') return;
            const now = this.ctx.currentTime;
            const freq = bassNotes[this.stepIdx % bassNotes.length];
            this.stepIdx++;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            const boosted = state.powerups.dash > 0 || state.overdriveActive > 0;
            filter.frequency.setValueAtTime(boosted ? 1250 : 520, now);

            gain.gain.setValueAtTime(0.075, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.15);
          }, 130);
        }

        playCoin(combo = 1) {
          if (this.muted) return;
          this.init();
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          const pitchBoost = Math.min(12, combo) * 35;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880 + pitchBoost, now);
          osc.frequency.setValueAtTime(1174.66 + pitchBoost, now + 0.055);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.23);
        }

        playGem() {
          if (this.muted) return;
          this.init();
          const now = this.ctx.currentTime;
          const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
          freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const t = now + i * 0.035;
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.26);
          });
        }

        playJump(isDouble = false) {
          if (this.muted) return;
          this.init();
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          const startF = isDouble ? 360 : 230;
          osc.frequency.setValueAtTime(startF, now);
          osc.frequency.exponentialRampToValueAtTime(startF * 2.2, now + 0.16);

          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.19);
        }

        playSlide() {
          if (this.muted) return;
          this.init();
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(95, now + 0.18);

          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.2);
        }

        playPowerup() {
          if (this.muted) return;
          this.init();
          const now = this.ctx.currentTime;
          const notes = [440, 554.37, 659.25, 880, 1108.73];
          notes.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const t = now + idx * 0.045;
            osc.frequency.setValueAtTime(f, t);

            gain.gain.setValueAtTime(0.14, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.3);
          });
        }

        playOverdrive() {
          if (this.muted) return;
          this.init();
          const now = this.ctx.currentTime;
          const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 1046.5];
          notes.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const t = now + i * 0.04;
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.16, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.46);
          });
        }

        playShieldBreak() {
          if (this.muted) return;
          this.init();
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

          gain.gain.setValueAtTime(0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.32);
        }

        playCrash() {
          if (this.muted) return;
          this.init();
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(38, now + 0.42);

          gain.gain.setValueAtTime(0.32, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.46);
        }
      }

      const audio = new AudioController();

      // ==========================================
      // 3. CANVAS & PERSISTENT PROFILE STATE
      // ==========================================
      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');

      let W = window.innerWidth;
      let H = window.innerHeight;
      let groundY = H * 0.78;

      const SAVE_KEY = 'ashraf_runner_profile_v2';
      function loadProfile() {
        try {
          const raw = localStorage.getItem(SAVE_KEY);
          if (raw) return JSON.parse(raw);
        } catch (e) {}
        return {
          walletCoins: 0,
          bestScore: 0,
          unlockedSkins: ['cyan'],
          selectedSkin: 'cyan',
          selectedTheme: 'cyber',
          selectedDifficulty: 'pro'
        };
      }

      const profile = loadProfile();
      function saveProfile() {
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(profile));
        } catch (e) {}
      }

      function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        groundY = Math.round(H * 0.78);
        if (state && state.player) {
          state.player.x = Math.min(220, Math.max(85, W * 0.16));
          if (state.player.grounded) {
            state.player.y = groundY - state.player.h;
          }
        }
      }

      // ==========================================
      // 4. GAME STATE & ENTITIES
      // ==========================================
      const state = {
        status: 'start', // 'start' | 'playing' | 'paused' | 'gameover'
        score: 0,
        coins: 0,
        gems: 0,
        distance: 0,
        combo: 1,
        comboTimer: 0,
        overdriveCharge: 0, // 0 to 100
        overdriveActive: 0, // seconds remaining
        overdriveCount: 0,
        speed: 485,
        screenShake: 0,
        hitStop: 0,
        spawnTimer: 1.0,
        collectibleTimer: 0.6,
        powerups: {
          magnet: 0,
          shield: false,
          dash: 0
        },
        missions: [],
        player: {
          name: 'ASHRAF',
          x: 160,
          y: 300,
          w: 44,
          h: 68,
          standH: 68,
          slideH: 36,
          vy: 0,
          grounded: true,
          jumpsLeft: 2,
          sliding: false,
          slideTimer: 0,
          runCycle: 0,
          flipAngle: 0,
          scarfPoints: [],
          afterimages: []
        },
        obstacles: [],
        collectibles: [],
        particles: [],
        floatingTexts: [],
        cityFar: [],
        cityNear: [],
        speedLines: []
      };

      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      function generateRunMissions() {
        return [
          { id: 'coins', label: 'Collect 25 Coins', target: 25, progress: 0, reward: 40, done: false },
          { id: 'dist', label: 'Sprint 450m', target: 450, progress: 0, reward: 50, done: false },
          { id: 'fever', label: 'Trigger Overdrive', target: 1, progress: 0, reward: 60, done: false }
        ];
      }

      state.missions = generateRunMissions();

      function initBackground() {
        state.cityFar = [];
        state.cityNear = [];
        state.speedLines = [];

        let x = 0;
        while (x < W + 400) {
          const bw = 65 + Math.random() * 90;
          const bh = 130 + Math.random() * 210;
          state.cityFar.push({ x, w: bw, h: bh });
          x += bw + 14;
        }

        x = 0;
        while (x < W + 400) {
          const bw = 80 + Math.random() * 110;
          const bh = 80 + Math.random() * 145;
          state.cityNear.push({
            x,
            w: bw,
            h: bh,
            useB: Math.random() > 0.5
          });
          x += bw + 26;
        }

        for (let i = 0; i < 20; i++) {
          state.speedLines.push({
            x: Math.random() * W,
            y: Math.random() * (groundY - 30),
            len: 50 + Math.random() * 120,
            speedMult: 1.4 + Math.random() * 1.1,
            alpha: 0.08 + Math.random() * 0.16
          });
        }
      }

      initBackground();

      // ==========================================
      // 5. GARAGE & SETTINGS UI BUILDER
      // ==========================================
      function renderMenuUI() {
        document.getElementById('menu-wallet').textContent = profile.walletCoins.toLocaleString();
        document.getElementById('menu-best').textContent = profile.bestScore.toLocaleString();
        document.getElementById('hud-wallet').textContent = profile.walletCoins.toLocaleString();
        document.getElementById('hud-best').textContent = profile.bestScore.toLocaleString();

        // Render Outfits
        const skinEl = document.getElementById('skin-selector');
        skinEl.innerHTML = '';
        SKINS.forEach(sk => {
          const unlocked = profile.unlockedSkins.includes(sk.id);
          const selected = profile.selectedSkin === sk.id;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `option-chip p-2.5 rounded-xl text-left flex items-center justify-between cursor-pointer ${selected ? 'selected' : ''}`;
          btn.innerHTML = `
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full border border-white/60 shrink-0" style="background:${sk.trim}; box-shadow:0 0 8px ${sk.trim}"></span>
              <div>
                <div class="text-xs font-display font-bold text-white leading-tight">${sk.name}</div>
                <div class="text-[10px] ${unlocked ? 'text-emerald-400' : 'text-amber-300'} font-semibold">
                  ${unlocked ? (selected ? 'EQUIPPED' : 'UNLOCKED') : `${sk.cost} COINS`}
                </div>
              </div>
            </div>
          `;
          btn.onclick = () => {
            if (unlocked) {
              profile.selectedSkin = sk.id;
              saveProfile();
              renderMenuUI();
            } else if (profile.walletCoins >= sk.cost) {
              profile.walletCoins -= sk.cost;
              profile.unlockedSkins.push(sk.id);
              profile.selectedSkin = sk.id;
              saveProfile();
              audio.playPowerup();
              renderMenuUI();
            } else {
              // Subtle shake feedback if insufficient coins
              btn.classList.add('border-rose-500');
              setTimeout(() => btn.classList.remove('border-rose-500'), 350);
            }
          };
          skinEl.appendChild(btn);
        });

        // Render Themes
        const themeEl = document.getElementById('theme-selector');
        themeEl.innerHTML = '';
        Object.values(THEMES).forEach(th => {
          const selected = profile.selectedTheme === th.id;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `option-chip py-2 px-2 rounded-xl text-center cursor-pointer ${selected ? 'selected' : ''}`;
          btn.innerHTML = `
            <div class="w-full h-2 rounded-full mb-1" style="background:linear-gradient(90deg, ${th.neonA}, ${th.neonB})"></div>
            <div class="text-[11px] font-display font-bold text-white">${th.label}</div>
          `;
          btn.onclick = () => {
            profile.selectedTheme = th.id;
            saveProfile();
            renderMenuUI();
          };
          themeEl.appendChild(btn);
        });

        // Render Speed Modes
        const diffEl = document.getElementById('difficulty-selector');
        diffEl.innerHTML = '';
        Object.values(DIFFICULTIES).forEach(df => {
          const selected = profile.selectedDifficulty === df.id;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `option-chip py-2 px-2 rounded-xl text-center cursor-pointer ${selected ? 'selected' : ''}`;
          btn.innerHTML = `
            <div class="text-[11px] font-display font-bold text-white">${df.label}</div>
          `;
          btn.onclick = () => {
            profile.selectedDifficulty = df.id;
            saveProfile();
            renderMenuUI();
          };
          diffEl.appendChild(btn);
        });

        // Render Missions Preview
        const mEl = document.getElementById('menu-missions');
        mEl.innerHTML = state.missions
          .map(
            m => `
            <div class="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span class="text-slate-300 text-[11px]">${m.label}</span>
              <span class="text-amber-300 font-display font-bold text-[10px]">+${m.reward}</span>
            </div>
          `
          )
          .join('');
      }

      // ==========================================
      // 6. GAME RESET & ACTIONS
      // ==========================================
      function resetGame() {
        const diff = DIFFICULTIES[profile.selectedDifficulty] || DIFFICULTIES.pro;
        const theme = THEMES[profile.selectedTheme] || THEMES.cyber;

        state.status = 'playing';
        state.score = 0;
        state.coins = 0;
        state.gems = 0;
        state.distance = 0;
        state.combo = 1;
        state.comboTimer = 0;
        state.overdriveCharge = 0;
        state.overdriveActive = 0;
        state.overdriveCount = 0;
        state.speed = diff.baseSpeed;
        state.screenShake = 0;
        state.hitStop = 0;
        state.spawnTimer = 0.85;
        state.collectibleTimer = 0.4;
        state.missions = generateRunMissions();

        state.powerups.magnet = 0;
        state.powerups.shield = false;
        state.powerups.dash = 0;

        document.getElementById('hud-mode-tag').textContent = `${diff.label.toUpperCase()} • ${theme.label.toUpperCase()}`;

        const p = state.player;
        p.x = Math.min(220, Math.max(85, W * 0.16));
        p.h = p.standH;
        p.y = groundY - p.h;
        p.vy = 0;
        p.grounded = true;
        p.jumpsLeft = 2;
        p.sliding = false;
        p.slideTimer = 0;
        p.runCycle = 0;
        p.flipAngle = 0;
        p.scarfPoints = [];
        p.afterimages = [];

        for (let i = 0; i < 8; i++) {
          p.scarfPoints.push({ x: p.x - i * 8, y: p.y + 18 });
        }

        state.obstacles = [];
        state.collectibles = [];
        state.particles = [];
        state.floatingTexts = [];

        spawnInitialCoins();
        updateHUD();
        audio.startMusic();
      }

      function spawnInitialCoins() {
        for (let i = 0; i < 6; i++) {
          state.collectibles.push({
            type: 'coin',
            x: W * 0.48 + i * 48,
            y: groundY - 45 - Math.sin(i * 0.5) * 35,
            r: 13,
            bobOffset: i * 0.6
          });
        }
      }

      function triggerOverdrive() {
        if (state.status !== 'playing') return;
        if (state.overdriveCharge < 100 || state.overdriveActive > 0) return;

        state.overdriveCharge = 0;
        state.overdriveActive = 6.5;
        state.overdriveCount++;
        state.screenShake = 12;
        audio.playOverdrive();
        const p = state.player;
        spawnBurst(p.x + p.w * 0.5, p.y + p.h * 0.5, '#fbbf24', 32, 320);
        addFloatingText(p.x + p.w * 0.5, p.y - 38, 'ASHRAF OVERDRIVE 2X!', '#fde047', 1.45);
        updateHUD();
      }

      function jumpAction() {
        if (state.status !== 'playing') return;
        const p = state.player;

        if (p.sliding) {
          p.sliding = false;
          p.slideTimer = 0;
          p.h = p.standH;
          p.y = groundY - p.h;
        }

        if (p.jumpsLeft > 0) {
          const isDouble = !p.grounded;
          p.vy = isDouble ? -675 : -735;
          p.grounded = false;
          p.jumpsLeft--;
          if (isDouble) {
            p.flipAngle = 0.01;
            spawnBurst(p.x + p.w * 0.5, p.y + p.h, '#38bdf8', 14, 190);
          } else {
            spawnBurst(p.x + p.w * 0.5, groundY, '#94a3b8', 8, 120);
          }
          audio.playJump(isDouble);
        }
      }

      function slideAction() {
        if (state.status !== 'playing') return;
        const p = state.player;

        if (!p.grounded) {
          p.vy = 980;
        }

        if (!p.sliding) {
          p.sliding = true;
          p.slideTimer = 0.68;
          const bottom = p.y + p.h;
          p.h = p.slideH;
          p.y = bottom - p.h;
          audio.playSlide();
          spawnBurst(p.x + p.w * 0.4, groundY, '#e879f9', 8, 130);
        } else {
          p.slideTimer = 0.68;
        }
      }

      function togglePause() {
        if (state.status === 'playing') {
          state.status = 'paused';
          const pm = document.getElementById('pause-missions');
          pm.innerHTML = state.missions
            .map(
              m => `
              <div class="flex justify-between">
                <span>${m.done ? '✅' : '⏳'} ${m.label}</span>
                <span class="font-display font-bold text-cyan-300">${Math.min(m.target, Math.floor(m.progress))}/${m.target}</span>
              </div>
            `
            )
            .join('');
          const ps = document.getElementById('pause-screen');
          ps.classList.remove('hidden');
          ps.classList.add('flex');
        } else if (state.status === 'paused') {
          state.status = 'playing';
          const ps = document.getElementById('pause-screen');
          ps.classList.add('hidden');
          ps.classList.remove('flex');
        }
      }

      // ==========================================
      // 7. PARTICLES & FLOATING POPUPS
      // ==========================================
      function spawnBurst(x, y, color, count = 12, maxSpeed = 220) {
        for (let i = 0; i < count; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 40 + Math.random() * maxSpeed;
          state.particles.push({
            x,
            y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd - 40,
            size: 2.5 + Math.random() * 3.5,
            color,
            life: 0.35 + Math.random() * 0.35,
            maxLife: 0.7
          });
        }
      }

      function addFloatingText(x, y, text, color = '#fbbf24', scale = 1) {
        state.floatingTexts.push({
          x,
          y,
          vy: -75,
          text,
          color,
          scale,
          life: 0.85,
          maxLife: 0.85
        });
      }

      // ==========================================
      // 8. SPAWNING OBSTACLES & REWARDS
      // ==========================================
      function spawnObstaclePattern() {
        const roll = Math.random();
        const startX = W + 80;

        if (roll < 0.32) {
          // Low Plasma Barrier
          const h = 46 + Math.random() * 18;
          state.obstacles.push({
            type: 'barrier',
            x: startX,
            y: groundY - h,
            w: 38,
            h,
            smashed: false
          });
          for (let i = -1; i <= 1; i++) {
            state.collectibles.push({
              type: 'coin',
              x: startX + 19 + i * 44,
              y: groundY - h - 55 - (1 - Math.abs(i)) * 22,
              r: 13,
              bobOffset: i
            });
          }
        } else if (roll < 0.64) {
          // Hovering Laser Drone (Slide underneath)
          const droneH = 36;
          const clearance = 44;
          state.obstacles.push({
            type: 'drone',
            x: startX,
            y: groundY - clearance - droneH,
            w: 60,
            h: droneH,
            smashed: false
          });
          for (let i = 0; i < 3; i++) {
            state.collectibles.push({
              type: 'coin',
              x: startX - 10 + i * 42,
              y: groundY - 22,
              r: 13,
              bobOffset: i * 0.4
            });
          }
        } else if (roll < 0.85) {
          // Triple Spike Cluster
          const w = 68;
          const h = 34;
          state.obstacles.push({
            type: 'spikes',
            x: startX,
            y: groundY - h,
            w,
            h,
            smashed: false
          });
          state.collectibles.push({
            type: 'gem',
            x: startX + w * 0.5,
            y: groundY - 125,
            r: 16,
            bobOffset: 0
          });
        } else {
          // Oscillating Energy Pylon (Vertical bobbing hazard)
          state.obstacles.push({
            type: 'pylon',
            x: startX,
            baseY: groundY - 58,
            y: groundY - 58,
            w: 34,
            h: 58,
            phase: Math.random() * Math.PI * 2,
            smashed: false
          });
        }
      }

      function spawnRewardWave() {
        const startX = W + 60;
        const pattern = Math.random();

        if (pattern < 0.5) {
          const count = 4 + Math.floor(Math.random() * 4);
          const baseH = Math.random() > 0.5 ? groundY - 45 : groundY - 115;
          for (let i = 0; i < count; i++) {
            state.collectibles.push({
              type: 'coin',
              x: startX + i * 44,
              y: baseH - Math.sin(i * 0.65) * 26,
              r: 13,
              bobOffset: i * 0.5
            });
          }
        } else if (pattern < 0.78) {
          state.collectibles.push({
            type: 'gem',
            x: startX + 44,
            y: groundY - 95,
            r: 16,
            bobOffset: 0
          });
          state.collectibles.push({
            type: 'coin',
            x: startX,
            y: groundY - 55,
            r: 13,
            bobOffset: 0.4
          });
          state.collectibles.push({
            type: 'coin',
            x: startX + 88,
            y: groundY - 55,
            r: 13,
            bobOffset: 0.8
          });
        } else {
          // Power-Up Orb or Mystery Star Box
          const types = ['magnet', 'shield', 'dash', 'star'];
          const pType = types[Math.floor(Math.random() * types.length)];
          state.collectibles.push({
            type: pType,
            x: startX + 30,
            y: groundY - 88,
            r: 18,
            bobOffset: 0
          });
        }
      }

      // ==========================================
      // 9. UPDATE SIMULATION LOOP
      // ==========================================
      function rectOverlap(a, b) {
        return (
          a.x < b.x + b.w &&
          a.x + a.w > b.x &&
          a.y < b.y + b.h &&
          a.y + a.h > b.y
        );
      }

      function updateMissions() {
        for (const m of state.missions) {
          if (m.done) continue;
          if (m.id === 'coins') m.progress = state.coins;
          if (m.id === 'dist') m.progress = state.distance;
          if (m.id === 'fever') m.progress = state.overdriveCount;

          if (m.progress >= m.target) {
            m.done = true;
            state.coins += m.reward;
            state.score += m.reward * 10;
            const p = state.player;
            addFloatingText(p.x + 30, p.y - 45, `MISSION COMPLETE +${m.reward} COINS!`, '#34d399', 1.25);
            audio.playPowerup();
          }
        }
      }

      function update(dt) {
        if (state.status === 'paused') return;

        const diff = DIFFICULTIES[profile.selectedDifficulty] || DIFFICULTIES.pro;
        const invincibleBoost = state.powerups.dash > 0 || state.overdriveActive > 0;
        const activeSpeed =
          state.status === 'playing'
            ? state.speed * (invincibleBoost ? 1.55 : 1)
            : 185;

        // Scroll City Layers
        for (const b of state.cityFar) {
          b.x -= activeSpeed * 0.14 * dt;
          if (b.x + b.w < -40) b.x = W + 60 + Math.random() * 80;
        }
        for (const b of state.cityNear) {
          b.x -= activeSpeed * 0.34 * dt;
          if (b.x + b.w < -40) b.x = W + 60 + Math.random() * 80;
        }
        for (const sl of state.speedLines) {
          sl.x -= activeSpeed * sl.speedMult * dt;
          if (sl.x + sl.len < 0) {
            sl.x = W + Math.random() * 120;
            sl.y = Math.random() * (groundY - 25);
          }
        }

        // Update Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const pt = state.particles[i];
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.vy += 420 * dt;
          pt.life -= dt;
          if (pt.life <= 0) state.particles.splice(i, 1);
        }

        // Update Floating Texts
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
          const ft = state.floatingTexts[i];
          ft.y += ft.vy * dt;
          ft.life -= dt;
          if (ft.life <= 0) state.floatingTexts.splice(i, 1);
        }

        if (state.screenShake > 0) {
          state.screenShake = Math.max(0, state.screenShake - dt * 36);
        }

        if (state.status !== 'playing') {
          state.player.runCycle += dt * 11;
          updateScarf(dt, 240);
          return;
        }

        if (state.hitStop > 0) {
          state.hitStop -= dt;
          return;
        }

        // Progressive Speed & Distance Score
        state.speed = Math.min(980, diff.baseSpeed + state.distance * 0.16);
        const distGain = (activeSpeed * dt) / 38;
        state.distance += distGain;
        const feverMult = state.overdriveActive > 0 ? 2 : 1;
        state.score += distGain * 2 * diff.scoreMult * feverMult;

        // Combo decay
        if (state.combo > 1) {
          state.comboTimer -= dt;
          if (state.comboTimer <= 0) state.combo = 1;
        }

        // Power-up & Overdrive timers
        if (state.powerups.magnet > 0) {
          state.powerups.magnet = Math.max(0, state.powerups.magnet - dt);
        }
        if (state.powerups.dash > 0) {
          state.powerups.dash = Math.max(0, state.powerups.dash - dt);
          if (Math.random() < 0.65) {
            spawnBurst(state.player.x, state.player.y + state.player.h * 0.5, '#34d399', 2, 140);
          }
        }
        if (state.overdriveActive > 0) {
          state.overdriveActive = Math.max(0, state.overdriveActive - dt);
          if (Math.random() < 0.75) {
            spawnBurst(state.player.x + 10, state.player.y + state.player.h * 0.5, '#fbbf24', 2, 170);
          }
        }

        // Player Physics
        const p = state.player;
        if (p.sliding) {
          p.slideTimer -= dt;
          if (p.slideTimer <= 0) {
            p.sliding = false;
            const bottom = p.y + p.h;
            p.h = p.standH;
            p.y = bottom - p.h;
          }
        }

        if (!p.grounded) {
          p.vy += 1950 * dt;
          p.y += p.vy * dt;
          if (p.flipAngle > 0) {
            p.flipAngle += dt * 13.5;
            if (p.flipAngle >= Math.PI * 2) p.flipAngle = 0;
          }
          if (p.y + p.h >= groundY) {
            p.y = groundY - p.h;
            p.vy = 0;
            p.grounded = true;
            p.jumpsLeft = 2;
            p.flipAngle = 0;
            spawnBurst(p.x + p.w * 0.5, groundY, '#38bdf8', 6, 95);
          }
        } else {
          p.runCycle += (activeSpeed / 36) * dt;
        }

        updateScarf(dt, activeSpeed);

        // Afterimages
        if (invincibleBoost || state.speed > 720) {
          p.afterimages.push({ x: p.x, y: p.y, w: p.w, h: p.h, alpha: 0.45 });
        }
        for (let i = p.afterimages.length - 1; i >= 0; i--) {
          p.afterimages[i].x -= activeSpeed * dt;
          p.afterimages[i].alpha -= dt * 1.9;
          if (p.afterimages[i].alpha <= 0) p.afterimages.splice(i, 1);
        }

        // Spawners
        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0) {
          spawnObstaclePattern();
          const minGap = Math.max(0.7, (1.46 - state.distance * 0.00045) * diff.gapMult);
          state.spawnTimer = minGap + Math.random() * 0.42;
        }

        state.collectibleTimer -= dt;
        if (state.collectibleTimer <= 0) {
          spawnRewardWave();
          state.collectibleTimer = 1.05 + Math.random() * 0.65;
        }

        // Collectibles Update & Magnet Pull
        const pcx = p.x + p.w * 0.5;
        const pcy = p.y + p.h * 0.5;
        const magnetPull = state.powerups.magnet > 0 || state.overdriveActive > 0;

        for (let i = state.collectibles.length - 1; i >= 0; i--) {
          const c = state.collectibles[i];
          c.bobOffset += dt * 5;

          if (magnetPull && (c.type === 'coin' || c.type === 'gem')) {
            const dist = Math.hypot(pcx - c.x, pcy - c.y);
            if (dist < 400) {
              const pullSpeed = 840;
              c.x += ((pcx - c.x) / dist) * pullSpeed * dt;
              c.y += ((pcy - c.y) / dist) * pullSpeed * dt;
            } else {
              c.x -= activeSpeed * dt;
            }
          } else {
            c.x -= activeSpeed * dt;
          }

          if (Math.hypot(pcx - c.x, pcy - c.y) < c.r + 30) {
            handleCollectiblePickup(c);
            state.collectibles.splice(i, 1);
            continue;
          }

          if (c.x < -60) state.collectibles.splice(i, 1);
        }

        // Obstacles Update & Collision
        const playerBox = { x: p.x + 8, y: p.y + 6, w: p.w - 16, h: p.h - 8 };

        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const ob = state.obstacles[i];
          ob.x -= activeSpeed * dt;

          if (ob.type === 'pylon') {
            ob.phase += dt * 3.8;
            ob.y = ob.baseY - Math.abs(Math.sin(ob.phase)) * 52;
          }

          const obBox = { x: ob.x + 4, y: ob.y + 4, w: ob.w - 8, h: ob.h - 6 };

          if (!ob.smashed && rectOverlap(playerBox, obBox)) {
            if (invincibleBoost) {
              ob.smashed = true;
              state.score += 100;
              state.screenShake = 8;
              spawnBurst(ob.x + ob.w * 0.5, ob.y + ob.h * 0.5, '#fbbf24', 22, 320);
              addFloatingText(ob.x, ob.y - 10, 'SMASH +100!', '#fde047', 1.2);
              audio.playShieldBreak();
            } else if (state.powerups.shield) {
              state.powerups.shield = false;
              ob.smashed = true;
              state.screenShake = 11;
              state.hitStop = 0.05;
              spawnBurst(pcx, pcy, '#38bdf8', 26, 300);
              addFloatingText(pcx, p.y - 25, 'SHIELD SAVED!', '#38bdf8', 1.2);
              audio.playShieldBreak();
            } else {
              triggerGameOver();
              return;
            }
          }

          if (ob.x + ob.w < -80) state.obstacles.splice(i, 1);
        }

        updateMissions();
        updateHUD();
      }

      function updateScarf(dt, speed) {
        const p = state.player;
        const anchorX = p.x + 12;
        const anchorY = p.y + (p.sliding ? 12 : 20);
        if (p.scarfPoints.length === 0) return;

        p.scarfPoints[0].x = anchorX;
        p.scarfPoints[0].y = anchorY;

        for (let i = 1; i < p.scarfPoints.length; i++) {
          const prev = p.scarfPoints[i - 1];
          const curr = p.scarfPoints[i];
          curr.x -= speed * 0.65 * dt;
          curr.y += Math.sin(performance.now() * 0.015 + i * 0.8) * 55 * dt;

          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const dist = Math.hypot(dx, dy) || 1;
          const maxLen = 7.5;
          if (dist > maxLen) {
            curr.x = prev.x + (dx / dist) * maxLen;
            curr.y = prev.y + (dy / dist) * maxLen;
          }
        }
      }

      function handleCollectiblePickup(c) {
        const feverMult = state.overdriveActive > 0 ? 2 : 1;

        if (c.type === 'coin') {
          state.coins++;
          state.combo = Math.min(8, state.combo + 1);
          state.comboTimer = 2.6;
          if (state.overdriveActive <= 0) {
            state.overdriveCharge = Math.min(100, state.overdriveCharge + 6);
          }
          const pts = 10 * state.combo * feverMult;
          state.score += pts;
          spawnBurst(c.x, c.y, '#fbbf24', 9, 160);
          addFloatingText(c.x, c.y - 12, `+${pts}`, '#fbbf24', state.combo > 1 ? 1.15 : 0.95);
          audio.playCoin(state.combo);
        } else if (c.type === 'gem') {
          state.gems++;
          state.combo = Math.min(8, state.combo + 1);
          state.comboTimer = 3.0;
          if (state.overdriveActive <= 0) {
            state.overdriveCharge = Math.min(100, state.overdriveCharge + 18);
          }
          const pts = 50 * state.combo * feverMult;
          state.score += pts;
          spawnBurst(c.x, c.y, '#e879f9', 18, 240);
          addFloatingText(c.x, c.y - 16, `GEM +${pts}!`, '#f0abfc', 1.3);
          audio.playGem();
        } else if (c.type === 'magnet') {
          state.powerups.magnet = 9.0;
          state.score += 50;
          spawnBurst(c.x, c.y, '#22d3ee', 20, 250);
          addFloatingText(c.x, c.y - 20, 'COIN MAGNET!', '#22d3ee', 1.3);
          audio.playPowerup();
        } else if (c.type === 'shield') {
          state.powerups.shield = true;
          state.score += 50;
          spawnBurst(c.x, c.y, '#38bdf8', 20, 250);
          addFloatingText(c.x, c.y - 20, 'ENERGY SHIELD!', '#38bdf8', 1.3);
          audio.playPowerup();
        } else if (c.type === 'dash') {
          state.powerups.dash = 4.5;
          state.score += 100;
          state.screenShake = 6;
          spawnBurst(c.x, c.y, '#34d399', 24, 280);
          addFloatingText(c.x, c.y - 20, 'HYPER JET DASH!', '#34d399', 1.35);
          audio.playPowerup();
        } else if (c.type === 'star') {
          // Mystery Star Box: Instant +15 Coins & +35% Overdrive Charge
          state.coins += 15;
          state.overdriveCharge = Math.min(100, state.overdriveCharge + 35);
          state.score += 150;
          spawnBurst(c.x, c.y, '#fde047', 26, 290);
          addFloatingText(c.x, c.y - 22, 'MYSTERY +15 COINS!', '#fde047', 1.35);
          audio.playGem();
        }
      }

      function triggerGameOver() {
        state.status = 'gameover';
        state.screenShake = 16;
        const p = state.player;
        spawnBurst(p.x + p.w * 0.5, p.y + p.h * 0.5, '#fb7185', 35, 340);
        audio.playCrash();

        const finalScore = Math.floor(state.score);
        let isNewBest = false;
        if (finalScore > profile.bestScore) {
          profile.bestScore = finalScore;
          isNewBest = true;
        }
        profile.walletCoins += state.coins;
        saveProfile();

        document.getElementById('go-score').textContent = finalScore.toLocaleString();
        document.getElementById('go-best').textContent = profile.bestScore.toLocaleString();
        document.getElementById('go-coins').textContent = `+${state.coins}`;
        document.getElementById('go-wallet').textContent = profile.walletCoins.toLocaleString();

        const bestBanner = document.getElementById('new-best-banner');
        if (isNewBest && finalScore > 0) {
          bestBanner.classList.remove('hidden');
        } else {
          bestBanner.classList.add('hidden');
        }

        const goScreen = document.getElementById('gameover-screen');
        goScreen.classList.remove('hidden');
        goScreen.classList.add('flex');
        updateHUD();
      }

      // ==========================================
      // 10. RENDERING PIPELINE
      // ==========================================
      function draw() {
        const theme = THEMES[profile.selectedTheme] || THEMES.cyber;
        ctx.save();

        if (state.screenShake > 0) {
          const sx = (Math.random() - 0.5) * state.screenShake;
          const sy = (Math.random() - 0.5) * state.screenShake;
          ctx.translate(sx, sy);
        }

        // 1. Sky Gradient Background
        const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
        skyGrad.addColorStop(0, theme.skyTop);
        skyGrad.addColorStop(0.55, theme.skyMid);
        skyGrad.addColorStop(1, theme.skyBot);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);

        // 2. Retro Horizon Sun
        const sunX = W * 0.75;
        const sunY = groundY - 125;
        const sunR = Math.min(115, W * 0.14);
        const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
        sunGrad.addColorStop(0, theme.sunTop);
        sunGrad.addColorStop(1, theme.sunBot);
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();

        // 3. Far City Silhouettes
        ctx.fillStyle = theme.farBuilding;
        for (const b of state.cityFar) {
          ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
        }

        // 4. Near City Buildings with Neon Trim
        for (const b of state.cityNear) {
          ctx.fillStyle = theme.nearBuilding;
          ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
          ctx.strokeStyle = b.useB ? theme.neonB : theme.neonA;
          ctx.globalAlpha = 0.28;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(b.x, groundY - b.h, b.w, b.h);
          ctx.globalAlpha = 1;
        }

        // 5. Speed Lines
        for (const sl of state.speedLines) {
          ctx.strokeStyle = state.overdriveActive > 0 ? 'rgba(251, 191, 36, 0.25)' : `rgba(56, 189, 248, ${sl.alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sl.x, sl.y);
          ctx.lineTo(sl.x + sl.len, sl.y);
          ctx.stroke();
        }

        // 6. Futuristic Neon Track / Ground
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
        groundGrad.addColorStop(0, '#0f172a');
        groundGrad.addColorStop(1, '#05070f');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, W, H - groundY);

        const railColor = state.overdriveActive > 0 ? '#fbbf24' : state.powerups.dash > 0 ? '#34d399' : theme.rail;
        ctx.save();
        ctx.strokeStyle = railColor;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = railColor;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();
        ctx.restore();

        const gridSpacing = 70;
        const scrollOffset = (state.distance * 38) % gridSpacing;
        ctx.strokeStyle = theme.grid;
        ctx.lineWidth = 1.5;
        for (let gx = -scrollOffset; gx < W + gridSpacing; gx += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(gx, groundY);
          ctx.lineTo(gx - 45, H);
          ctx.stroke();
        }

        // 7. Render Collectibles
        for (const c of state.collectibles) {
          const bobY = c.y + Math.sin(c.bobOffset) * 5;
          ctx.save();
          ctx.translate(c.x, bobY);

          if (c.type === 'coin') {
            const spinW = Math.max(0.28, Math.abs(Math.cos(c.bobOffset * 0.9)));
            ctx.scale(spinW, 1);
            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, c.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#d97706';
            ctx.fillRect(-2, -6, 4, 12);
          } else if (c.type === 'gem') {
            ctx.rotate(Math.sin(c.bobOffset * 0.5) * 0.15);
            ctx.fillStyle = '#e879f9';
            ctx.strokeStyle = '#fae8ff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#d946ef';
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.moveTo(0, -c.r);
            ctx.lineTo(c.r * 0.85, 0);
            ctx.lineTo(0, c.r);
            ctx.lineTo(-c.r * 0.85, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            const colorMap = {
              magnet: { fill: '#06b6d4', glow: '#22d3ee', label: 'M' },
              shield: { fill: '#3b82f6', glow: '#60a5fa', label: 'S' },
              dash: { fill: '#10b981', glow: '#34d399', label: '⚡' },
              star: { fill: '#eab308', glow: '#fde047', label: '★' }
            };
            const meta = colorMap[c.type];
            ctx.fillStyle = meta.fill;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = meta.glow;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, c.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = '900 14px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(meta.label, 0, 1);
          }

          ctx.restore();
        }

        // 8. Render Obstacles
        for (const ob of state.obstacles) {
          if (ob.smashed) continue;
          ctx.save();

          if (ob.type === 'barrier' || ob.type === 'pylon') {
            ctx.fillStyle = '#1e1b4b';
            ctx.strokeStyle = ob.type === 'pylon' ? '#fb923c' : '#fb7185';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = ob.type === 'pylon' ? '#f97316' : '#f43f5e';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.roundRect(ob.x, ob.y, ob.w, ob.h, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = ob.type === 'pylon' ? '#fb923c' : '#f43f5e';
            ctx.fillRect(ob.x + 6, ob.y + 10, ob.w - 12, 6);
            ctx.fillRect(ob.x + 6, ob.y + 24, ob.w - 12, 6);
          } else if (ob.type === 'drone') {
            ctx.fillStyle = '#31102f';
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.roundRect(ob.x, ob.y, ob.w, ob.h, 12);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fda4af';
            ctx.beginPath();
            ctx.arc(ob.x + 16, ob.y + ob.h * 0.5, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(244, 63, 94, 0.55)';
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(ob.x + 8, ob.y + ob.h);
            ctx.lineTo(ob.x + ob.w - 8, ob.y + ob.h);
            ctx.stroke();
            ctx.setLineDash([]);
          } else if (ob.type === 'spikes') {
            ctx.fillStyle = '#be123c';
            ctx.strokeStyle = '#fda4af';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 14;

            const teeth = 3;
            const tw = ob.w / teeth;
            ctx.beginPath();
            for (let t = 0; t < teeth; t++) {
              const sx = ob.x + t * tw;
              ctx.moveTo(sx, ob.y + ob.h);
              ctx.lineTo(sx + tw * 0.5, ob.y);
              ctx.lineTo(sx + tw, ob.y + ob.h);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          ctx.restore();
        }

        // 9. Render Character: ASHRAF
        drawAshraf();

        // 10. Render Particles
        for (const pt of state.particles) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 11. Render Floating Popups
        for (const ft of state.floatingTexts) {
          ctx.save();
          const alpha = Math.min(1, (ft.life / ft.maxLife) * 1.4);
          ctx.globalAlpha = alpha;
          ctx.font = `900 ${Math.round(15 * ft.scale)}px "Orbitron", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = ft.color;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }

        ctx.restore();
      }

      function drawAshraf() {
        const p = state.player;
        const skin = SKINS.find(s => s.id === profile.selectedSkin) || SKINS[0];
        const isOverdrive = state.overdriveActive > 0;
        const isDash = state.powerups.dash > 0;

        const activeTrim = isOverdrive ? '#fbbf24' : isDash ? '#34d399' : skin.trim;
        const activeScarf = isOverdrive ? '#fde047' : isDash ? '#34d399' : skin.scarf;

        const cx = p.x + p.w * 0.5;
        const cy = p.y + p.h * 0.5;

        // Afterimages
        for (const img of p.afterimages) {
          ctx.save();
          ctx.globalAlpha = img.alpha * 0.45;
          ctx.fillStyle = activeTrim;
          ctx.beginPath();
          ctx.roundRect(img.x + 6, img.y + 4, img.w - 12, img.h - 4, 10);
          ctx.fill();
          ctx.restore();
        }

        // Flowing Scarf Trail
        if (p.scarfPoints.length > 1) {
          ctx.save();
          ctx.strokeStyle = activeScarf;
          ctx.lineWidth = 7;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = activeScarf;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(p.scarfPoints[0].x, p.scarfPoints[0].y);
          for (let i = 1; i < p.scarfPoints.length; i++) {
            ctx.lineTo(p.scarfPoints[i].x, p.scarfPoints[i].y);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Character Body
        ctx.save();
        ctx.translate(cx, cy);
        if (p.flipAngle > 0) {
          ctx.rotate(p.flipAngle);
        } else if (p.sliding) {
          ctx.rotate(-0.38);
        } else {
          ctx.rotate(0.12);
        }

        const swing = Math.sin(p.runCycle) * 12;

        // Back Leg
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-2, p.h * 0.15);
        ctx.lineTo(-2 - swing, p.h * 0.46);
        ctx.stroke();

        // Torso Jacket
        ctx.fillStyle = skin.jacket;
        ctx.strokeStyle = activeTrim;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = activeTrim;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.roundRect(-12, -p.h * 0.18, 24, p.h * 0.42, 7);
        ctx.fill();
        ctx.stroke();

        // Front Leg
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isOverdrive ? '#fde047' : skin.leg;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(2, p.h * 0.15);
        ctx.lineTo(2 + swing, p.h * 0.46);
        ctx.stroke();

        // Head
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(2, -p.h * 0.33, 12, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(0, -p.h * 0.36, 12.5, Math.PI * 0.95, Math.PI * 2.1);
        ctx.lineTo(14, -p.h * 0.38);
        ctx.lineTo(6, -p.h * 0.48);
        ctx.lineTo(-2, -p.h * 0.46);
        ctx.closePath();
        ctx.fill();

        // Visor
        ctx.fillStyle = isOverdrive ? '#ffffff' : skin.visor;
        ctx.shadowColor = isOverdrive ? '#fbbf24' : skin.visor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(2, -p.h * 0.37, 13, 6, 3);
        ctx.fill();

        // Arm
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(0, -p.h * 0.08);
        ctx.lineTo(-swing * 0.85, p.h * 0.12);
        ctx.stroke();

        ctx.restore();

        // Overdrive Golden Aura
        if (isOverdrive) {
          ctx.save();
          const pulse = 1 + Math.sin(performance.now() * 0.018) * 0.08;
          ctx.strokeStyle = '#fbbf24';
          ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 24;
          ctx.beginPath();
          ctx.arc(cx, cy, p.h * 0.72 * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Shield Bubble
        if (state.powerups.shield) {
          ctx.save();
          const pulse = 1 + Math.sin(performance.now() * 0.01) * 0.05;
          ctx.strokeStyle = '#38bdf8';
          ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(cx, cy, p.h * 0.65 * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Magnet Ring
        if (state.powerups.magnet > 0) {
          ctx.save();
          const r = 34 + ((performance.now() * 0.06) % 28);
          ctx.strokeStyle = `rgba(34, 211, 238, ${1 - (r - 34) / 28})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // ============================================================
        // GLOWING FLOATING NAME TAG DIRECTLY ABOVE ASHRAF'S HEAD
        // ============================================================
        ctx.save();
        const tagY = p.y - 24;
        ctx.font = '800 13px "Orbitron", sans-serif';
        const textWidth = ctx.measureText('ASHRAF').width;
        const pillW = textWidth + 20;
        const pillH = 22;

        ctx.fillStyle = 'rgba(7, 11, 25, 0.88)';
        ctx.strokeStyle = activeTrim;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = activeTrim;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(cx - pillW * 0.5, tagY - pillH * 0.5, pillW, pillH, 11);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = activeTrim;
        ctx.beginPath();
        ctx.moveTo(cx - 4, tagY + pillH * 0.5);
        ctx.lineTo(cx + 4, tagY + pillH * 0.5);
        ctx.lineTo(cx, tagY + pillH * 0.5 + 5);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ASHRAF', cx, tagY + 0.5);
        ctx.restore();
      }

      // ==========================================
      // 11. HUD UPDATES & INPUT CONTROLS
      // ==========================================
      function updateHUD() {
        document.getElementById('hud-score').textContent = Math.floor(state.score).toLocaleString();
        document.getElementById('hud-coins').textContent = state.coins;
        document.getElementById('hud-gems').textContent = state.gems;
        document.getElementById('hud-dist').textContent = `${Math.floor(state.distance)}m`;
        document.getElementById('hud-wallet').textContent = (profile.walletCoins + state.coins).toLocaleString();
        document.getElementById('hud-best').textContent = Math.max(
          profile.bestScore,
          Math.floor(state.score)
        ).toLocaleString();

        // Combo Badge
        const comboBadge = document.getElementById('combo-badge');
        if (state.combo > 1) {
          comboBadge.classList.remove('hidden');
          document.getElementById('hud-combo').textContent = `COMBO x${state.combo}`;
        } else {
          comboBadge.classList.add('hidden');
        }

        // Overdrive Meter & Mobile Fever Button
        const odBox = document.getElementById('overdrive-box');
        const odBar = document.getElementById('overdrive-bar');
        const padOd = document.getElementById('pad-overdrive');

        if (state.overdriveActive > 0) {
          const pct = (state.overdriveActive / 6.5) * 100;
          odBar.style.width = `${pct}%`;
          odBox.classList.add('overdrive-ready');
          padOd.classList.add('hidden');
          padOd.classList.remove('flex');
        } else {
          odBar.style.width = `${state.overdriveCharge}%`;
          if (state.overdriveCharge >= 100) {
            odBox.classList.add('overdrive-ready');
            padOd.classList.remove('hidden');
            padOd.classList.add('flex');
          } else {
            odBox.classList.remove('overdrive-ready');
            padOd.classList.add('hidden');
            padOd.classList.remove('flex');
          }
        }

        // Active Mission Pill
        const activeM = state.missions.find(m => !m.done) || state.missions[state.missions.length - 1];
        if (activeM) {
          document.getElementById('hud-mission-text').textContent = activeM.done
            ? 'All Run Missions Complete!'
            : `${activeM.label} (${Math.min(activeM.target, Math.floor(activeM.progress))}/${activeM.target})`;
        }

        // Power-up pills
        const puContainer = document.getElementById('powerup-hud');
        let pillsHTML = '';
        if (state.overdriveActive > 0) {
          pillsHTML += `<span class="px-2 py-0.5 rounded-xl bg-amber-500/25 border border-amber-400 text-amber-200 font-display font-bold text-[10px]">OVERDRIVE ${state.overdriveActive.toFixed(1)}s</span>`;
        }
        if (state.powerups.shield) {
          pillsHTML += `<span class="px-2 py-0.5 rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-300 font-display font-bold text-[10px]">SHIELD</span>`;
        }
        if (state.powerups.magnet > 0) {
          pillsHTML += `<span class="px-2 py-0.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-display font-bold text-[10px]">MAGNET ${state.powerups.magnet.toFixed(1)}s</span>`;
        }
        if (state.powerups.dash > 0) {
          pillsHTML += `<span class="px-2 py-0.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-display font-bold text-[10px]">DASH ${state.powerups.dash.toFixed(1)}s</span>`;
        }
        puContainer.innerHTML = pillsHTML;
      }

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
          e.preventDefault();
          if (state.status === 'start') {
            startNewRun();
          } else if (state.status === 'playing' && !e.repeat) {
            jumpAction();
          }
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          e.preventDefault();
          if (state.status === 'playing' && !e.repeat) {
            slideAction();
          }
        } else if (e.code === 'KeyF') {
          if (state.status === 'playing' && !e.repeat) {
            triggerOverdrive();
          }
        } else if (e.code === 'KeyP' || e.code === 'Escape') {
          if (state.status === 'playing' || state.status === 'paused') {
            togglePause();
          }
        } else if (e.code === 'KeyM') {
          toggleAudioUI();
        }
      });

      // Touch Swipe Support on Canvas
      let touchStartY = 0;
      canvas.addEventListener('touchstart', (e) => {
        if (state.status !== 'playing') return;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      canvas.addEventListener('touchend', (e) => {
        if (state.status !== 'playing') return;
        const touchEndY = e.changedTouches[0].clientY;
        const dy = touchEndY - touchStartY;
        if (dy > 38) {
          slideAction();
        } else {
          jumpAction();
        }
      }, { passive: true });

      // On-Screen Mobile Pads & HUD Triggers
      const padJump = document.getElementById('pad-jump');
      const padSlide = document.getElementById('pad-slide');
      const padOverdrive = document.getElementById('pad-overdrive');

      padJump.addEventListener('touchstart', (e) => {
        e.preventDefault();
        padJump.classList.add('pressed');
        jumpAction();
      }, { passive: false });
      padJump.addEventListener('touchend', () => padJump.classList.remove('pressed'));

      padSlide.addEventListener('touchstart', (e) => {
        e.preventDefault();
        padSlide.classList.add('pressed');
        slideAction();
      }, { passive: false });
      padSlide.addEventListener('touchend', () => padSlide.classList.remove('pressed'));

      padOverdrive.addEventListener('click', triggerOverdrive);
      document.getElementById('overdrive-box').addEventListener('click', triggerOverdrive);

      // Audio & Pause Buttons
      function toggleAudioUI() {
        const muted = audio.toggleMute();
        document.getElementById('icon-audio-on').classList.toggle('hidden', muted);
        document.getElementById('icon-audio-off').classList.toggle('hidden', !muted);
      }
      document.getElementById('btn-audio').addEventListener('click', toggleAudioUI);
      document.getElementById('btn-pause').addEventListener('click', togglePause);
      document.getElementById('btn-resume').addEventListener('click', togglePause);

      document.getElementById('btn-quit-menu').addEventListener('click', () => {
        const ps = document.getElementById('pause-screen');
        ps.classList.add('hidden');
        ps.classList.remove('flex');
        state.status = 'start';
        renderMenuUI();
        document.getElementById('start-screen').classList.remove('hidden');
      });

      function openGarageFromGameOver() {
        const goScreen = document.getElementById('gameover-screen');
        goScreen.classList.add('hidden');
        goScreen.classList.remove('flex');
        state.status = 'start';
        renderMenuUI();
        document.getElementById('start-screen').classList.remove('hidden');
      }

      // Start & Restart Buttons
      function startNewRun() {
        document.getElementById('start-screen').classList.add('hidden');
        const goScreen = document.getElementById('gameover-screen');
        goScreen.classList.add('hidden');
        goScreen.classList.remove('flex');
        resetGame();
      }

      document.getElementById('btn-start').addEventListener('click', startNewRun);
      document.getElementById('btn-restart').addEventListener('click', startNewRun);
      document.getElementById('btn-go-garage').addEventListener('click', openGarageFromGameOver);

      // ==========================================
      // 12. MAIN ANIMATION LOOP
      // ==========================================
      let lastTimestamp = 0;

      function animate(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
        lastTimestamp = timestamp;

        update(dt);
        draw();

        requestAnimationFrame(animate);
      }

      window.onload = () => {
        resizeCanvas();
        renderMenuUI();
        requestAnimationFrame(animate);
      };
    })();