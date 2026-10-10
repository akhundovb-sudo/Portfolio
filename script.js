
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll hide/show functionality
let lastScrollY = window.scrollY;
let ticking = false;

function updateHeader() {
    const header = document.querySelector('.header');
    const currentScrollY = window.scrollY;

    // Add glass effect
    if (currentScrollY > 30) {
        header.style.backgroundColor = 'var(--header-glass)';
        header.style.backdropFilter = 'blur(20px) saturate(180%)';
        header.style.webkitBackdropFilter = 'blur(20px) saturate(180%)';
        header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
    } else {
        header.style.backgroundColor = 'transparent';
        header.style.backdropFilter = 'none';
        header.style.webkitBackdropFilter = 'none';
        header.style.borderBottom = 'none';
    }

    // Hide/show header based on scroll direction
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        header.style.transform = 'translateY(-100%)';
        header.style.transition = 'transform 0.3s ease-in-out';
    } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        header.style.transform = 'translateY(0)';
        header.style.transition = 'transform 0.3s ease-in-out';
    }

    lastScrollY = currentScrollY;
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// Add intersection observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe project cards for animation
document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Contact Modal Functions - Optimized
let modal = null;
let isModalOpen = false;

// Cache modal element to avoid repeated DOM queries
function getModal() {
    if (!modal) {
        modal = document.getElementById('contactModal');
    }
    return modal;
}

function openModal() {
    if (isModalOpen) return; // Prevent multiple opens

    const modalElement = getModal();
    if (modalElement) {
        isModalOpen = true;
        modalElement.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Use requestAnimationFrame to ensure smooth animation
        requestAnimationFrame(() => {
            modalElement.classList.add('show');
        });
    }
}

function closeModal() {
    if (!isModalOpen) return; // Prevent multiple closes

    const modalElement = getModal();
    if (modalElement) {
        isModalOpen = false;
        modalElement.classList.remove('show');
        document.body.style.overflow = 'auto';

        // Hide modal after animation completes
        setTimeout(() => {
            if (!isModalOpen) {
                modalElement.style.display = 'none';
            }
        }, 200);
    }
}

// Optimized event listeners with event delegation
let modalEventListenersAdded = false;

function addModalEventListeners() {
    if (modalEventListenersAdded) return;
    modalEventListenersAdded = true;

    // Close modal when clicking outside of it
    document.addEventListener('click', function (event) {
        const modalElement = getModal();
        if (modalElement && event.target === modalElement && isModalOpen) {
            closeModal();
        }
    }, { passive: true });

    // Close modal with Escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    }, { passive: true });
}

// Initialize modal event listeners
addModalEventListeners();

// Mobile Menu Functionality - function is defined in index.html

// Scrollbar visibility control
let scrollTimeout;
function handleScroll() {
    // Add scrolling class
    document.documentElement.classList.add('scrolling');
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Remove scrolling class after scroll stops
    scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove('scrolling');
    }, 150);
}

// Add scroll event listener
window.addEventListener('scroll', handleScroll, { passive: true });

// Mobile menu event listeners are handled in index.html

// Resume viewer: the header's Resume link opens the PDF in a sheet over the
// page (browser's own PDF viewer in an iframe) with Download and close. The
// link itself points at resume.pdf in a new tab, so phones, middle clicks
// and no-JS still get the file.
(function () {
    const RESUME_URL = 'resume.pdf';
    const RESUME_NAME = 'Bahruz Akhundov - Resume.pdf';
    let sheet = null;
    let lastFocus = null;

    function build() {
        sheet = document.createElement('div');
        sheet.className = 'resume-sheet';
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-modal', 'true');
        sheet.setAttribute('aria-label', 'Resume');
        sheet.innerHTML =
            '<div class="resume-sheet-panel" tabindex="-1">' +
                '<div class="resume-sheet-bar">' +
                    '<a class="resume-sheet-download" href="' + RESUME_URL + '" download="' + RESUME_NAME + '">' +
                        '<span class="resume-sheet-download-text">Download</span>' +
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3V20M5 13L12 20L19 13" stroke="currentColor" stroke-width="1.25" vector-effect="non-scaling-stroke" stroke-linecap="square" stroke-linejoin="miter"/></svg>' +
                    '</a>' +
                    '<button type="button" class="resume-sheet-close" aria-label="Close">' +
                        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="2.25" vector-effect="non-scaling-stroke" stroke-linecap="square" stroke-linejoin="miter"/></svg>' +
                    '</button>' +
                '</div>' +
                '<div class="resume-sheet-doc"></div>' +
            '</div>';
        document.body.appendChild(sheet);

        sheet.querySelector('.resume-sheet-close').addEventListener('click', close);
        // A click on the dimmed page around the panel closes it.
        sheet.addEventListener('click', function (e) {
            if (e.target === sheet) close();
        });
    }

    function open() {
        if (!sheet) build();
        const doc = sheet.querySelector('.resume-sheet-doc');
        // The PDF loads on first open only, fitted to the panel width.
        if (!doc.firstChild) {
            const frame = document.createElement('iframe');
            frame.src = RESUME_URL + '#view=FitH&navpanes=0';
            frame.title = 'Resume';
            doc.appendChild(frame);
        }
        lastFocus = document.activeElement;
        document.documentElement.classList.add('resume-open');
        requestAnimationFrame(function () {
            sheet.classList.add('is-open');
        });
        // Focus the panel itself, so Tab starts inside without lighting a button.
        sheet.querySelector('.resume-sheet-panel').focus({ preventScroll: true });
    }

    function close() {
        if (!sheet || !sheet.classList.contains('is-open')) return;
        sheet.classList.remove('is-open');
        document.documentElement.classList.remove('resume-open');
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    document.addEventListener('click', function (e) {
        const link = e.target.closest && e.target.closest('.home-nav-link[data-resume]');
        if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        open();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
    });
})();

// Easter egg: the arrow run of the Konami code (up up down down left right
// left right; the classic B A is not needed) plays Korobeiniki, the Russian folk song Tetris made famous, as square-wave
// beeps while tetrominoes rain down and stack along the bottom of the window.
// Esc stops it early.
(function () {
    // Physical keys (e.code), the same in any keyboard layout.
    const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
    let recent = [];
    let running = null;

    document.addEventListener('keydown', function (e) {
        if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
        const key = e.code || '';
        if (running && key === 'Escape') return running.stop();
        if (running && key === 'KeyM') return running.toggleSound();
        // The last few keys, so extra presses before the run don't spoil it.
        recent.push(key);
        if (recent.length > CODE.length) recent.shift();
        if (recent.join() === CODE.join()) {
            recent = [];
            if (!running) running = play();
        }
    });

    // Korobeiniki melody, A minor. [note, beats]; null is a rest.
    const A4 = 440, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25,
        F5 = 698.46, G5 = 783.99, A5 = 880;
    const TUNE = [
        [E5, 1], [B4, .5], [C5, .5], [D5, 1], [C5, .5], [B4, .5],
        [A4, 1], [A4, .5], [C5, .5], [E5, 1], [D5, .5], [C5, .5],
        [B4, 1.5], [C5, .5], [D5, 1], [E5, 1],
        [C5, 1], [A4, 1], [A4, 1], [null, 1],
        [null, .5], [D5, 1], [F5, .5], [A5, 1], [G5, .5], [F5, .5],
        [E5, 1.5], [C5, .5], [E5, 1], [D5, .5], [C5, .5],
        [B4, 1], [B4, .5], [C5, .5], [D5, 1], [E5, 1],
        [C5, 1], [A4, 1], [A4, 1], [null, 1]
    ];
    const BEAT = 0.36; // seconds

    function playTune() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return { length: 0, mute: function () {}, stop: function () {} };
        const ctx = new AC();
        const tone = ctx.createBiquadFilter();
        tone.type = 'lowpass';
        tone.frequency.value = 4000;
        const out = ctx.createGain();
        out.gain.value = 1;
        tone.connect(out).connect(ctx.destination);

        let t = ctx.currentTime + 0.05;
        TUNE.forEach(function (n) {
            const dur = n[1] * BEAT;
            if (n[0]) {
                const osc = ctx.createOscillator();
                osc.type = 'square';
                osc.frequency.value = n[0];
                const amp = ctx.createGain();
                amp.gain.setValueAtTime(0.0001, t);
                amp.gain.exponentialRampToValueAtTime(0.012, t + 0.005);
                amp.gain.setValueAtTime(0.012, t + dur * 0.8);
                amp.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
                osc.connect(amp).connect(tone);
                osc.start(t);
                osc.stop(t + dur);
            }
            t += dur;
        });
        const length = (t - ctx.currentTime) * 1000;
        return {
            length: length,
            mute: function (muted) {
                out.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.02);
            },
            stop: function () {
                out.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
                setTimeout(function () { ctx.close(); }, 200);
            }
        };
    }

    // Seven tetrominoes as cell lists; one in each batch is the site accent.
    const SHAPES = [
        [[0, 0], [1, 0], [2, 0], [3, 0]],          // I
        [[0, 0], [1, 0], [0, 1], [1, 1]],          // O
        [[0, 0], [1, 0], [2, 0], [1, 1]],          // T
        [[1, 0], [2, 0], [0, 1], [1, 1]],          // S
        [[0, 0], [1, 0], [1, 1], [2, 1]],          // Z
        [[0, 0], [0, 1], [1, 1], [2, 1]],          // J
        [[2, 0], [0, 1], [1, 1], [2, 1]]           // L
    ];

    function rotate(cells, times) {
        let c = cells;
        for (let i = 0; i < times; i++) c = c.map(function (p) { return [-p[1], p[0]]; });
        const minX = Math.min.apply(null, c.map(function (p) { return p[0]; }));
        const minY = Math.min.apply(null, c.map(function (p) { return p[1]; }));
        return c.map(function (p) { return [p[0] - minX, p[1] - minY]; });
    }

    function play() {
        const music = playTune();
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let rain = null;
        if (!reduce) rain = blocks(music.length);
        const done = setTimeout(stop, music.length + 300);

        // Sound toggle for as long as it plays (M on the keyboard too).
        let muted = false;
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'tetris-mute';
        function label() {
            toggle.textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
            toggle.setAttribute('aria-pressed', muted ? 'true' : 'false');
        }
        function toggleSound() {
            muted = !muted;
            music.mute(muted);
            label();
        }
        label();
        toggle.addEventListener('click', toggleSound);
        document.body.appendChild(toggle);
        requestAnimationFrame(function () { toggle.classList.add('is-on'); });

        function stop() {
            clearTimeout(done);
            music.stop();
            if (rain) rain.stop();
            toggle.classList.remove('is-on');
            setTimeout(function () { toggle.remove(); }, 400);
            running = null;
        }
        return { stop: stop, toggleSound: toggleSound };
    }

    function blocks(duration) {
        const CELL = 24;
        const canvas = document.createElement('canvas');
        canvas.className = 'tetris-rain';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const W = window.innerWidth, H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);
        const cols = Math.floor(W / CELL), rows = Math.ceil(H / CELL);
        const offsetX = Math.floor((W - cols * CELL) / 2);
        const stack = new Map(); // "x,y" -> colour
        const falling = [];
        let spawned = 0;

        function free(x, y) {
            return y < rows && !stack.has(x + ',' + y);
        }

        function spawn() {
            const cells = rotate(SHAPES[Math.floor(Math.random() * SHAPES.length)], Math.floor(Math.random() * 4));
            const w = Math.max.apply(null, cells.map(function (p) { return p[0]; })) + 1;
            falling.push({
                cells: cells,
                x: Math.floor(Math.random() * (cols - w + 1)),
                y: -4,
                color: spawned % 5 === 2 ? 'rgb(255, 72, 16)'
                    : (document.documentElement.getAttribute('data-theme') === 'dark' ? '#EDEDEC' : '#0F0F0F')
            });
            spawned++;
        }

        function cell(x, y, color) {
            const px = offsetX + x * CELL, py = H - (rows - y) * CELL;
            ctx.fillStyle = color;
            ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
            // A lighter inner square: the classic bevelled block.
            ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.fillRect(px + 5, py + 5, CELL - 10, CELL - 10);
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            stack.forEach(function (color, key) {
                const p = key.split(',');
                cell(+p[0], +p[1], color);
            });
            falling.forEach(function (f) {
                f.cells.forEach(function (p) { cell(f.x + p[0], f.y + p[1], f.color); });
            });
        }

        function step() {
            for (let i = falling.length - 1; i >= 0; i--) {
                const f = falling[i];
                const canFall = f.cells.every(function (p) { return free(f.x + p[0], f.y + p[1] + 1); });
                if (canFall) {
                    f.y++;
                } else {
                    f.cells.forEach(function (p) {
                        if (f.y + p[1] >= 0) stack.set((f.x + p[0]) + ',' + (f.y + p[1]), f.color);
                    });
                    falling.splice(i, 1);
                }
            }
            draw();
        }

        // Pieces arrive through the tune; the last ones still land before
        // the fade.
        const spawnEvery = 650;
        const spawnUntil = Math.max(0, duration - 3500);
        const spawner = setInterval(function () {
            if (spawned * spawnEvery > spawnUntil) return clearInterval(spawner);
            spawn();
        }, spawnEvery);
        spawn();
        const ticker = setInterval(step, 70);
        requestAnimationFrame(function () { canvas.classList.add('is-on'); });

        return {
            stop: function () {
                clearInterval(spawner);
                clearInterval(ticker);
                canvas.classList.remove('is-on');
                setTimeout(function () { canvas.remove(); }, 600);
            }
        };
    }
})();

// Copy buttons (the Email row in the contact dialog): copies data-copy and
// shows "Copied" over the button for a moment.
document.addEventListener('click', function (e) {
    const button = e.target.closest && e.target.closest('.contact-copy');
    if (!button) return;
    e.preventDefault();
    const text = button.getAttribute('data-copy') || '';
    const tip = button.querySelector('.contact-copy-tip');

    function done(ok) {
        if (tip) tip.textContent = ok ? 'Copied' : 'Copy failed';
        // The check mark only on success; a failure just shows the tip.
        button.classList.remove('is-copied', 'is-failed');
        button.classList.add(ok ? 'is-copied' : 'is-failed');
        clearTimeout(button._copiedTimer);
        button._copiedTimer = setTimeout(function () {
            button.classList.remove('is-copied', 'is-failed');
        }, 1600);
    }

    function fallback() {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        field.remove();
        done(ok);
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else {
        fallback();
    }
});

// Case pages: a contents list on the left, after rahazh.com. Each section
// name has a short dash before it; the section in view gets a long dash,
// full ink and a slightly larger name. Clicking a name scrolls there.
(function () {
    if (!document.body.classList.contains('project-page')) return;
    // Each block marked data-toc="Name" is one entry, in page order.
    const blocks = Array.prototype.slice.call(document.querySelectorAll('[data-toc]'));
    if (!blocks.length) return;

    const sections = blocks;
    const headings = blocks.map(function (b) {
        return { textContent: b.getAttribute('data-toc') };
    });
    const nav = document.createElement('nav');
    nav.className = 'case-toc';
    nav.setAttribute('aria-label', 'On this page');
    const items = headings.map(function (h, i) {
        const name = h.textContent.trim();
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'case-toc-item';
        item.title = name;
        item.innerHTML = '<span class="case-toc-label"></span>';
        item.querySelector('.case-toc-label').textContent = name;
        item.addEventListener('click', function () {
            const top = sections[i].getBoundingClientRect().top + window.scrollY - 96;
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
        });
        nav.appendChild(item);
        return item;
    });
    document.body.appendChild(nav);
    document.body.classList.add('has-toc');

    let current = -1;
    function update() {
        // The last section whose top has passed 40% of the window.
        const line = window.innerHeight * 0.4;
        let active = 0;
        sections.forEach(function (s, i) {
            if (s.getBoundingClientRect().top <= line) active = i;
        });
        // At the very bottom, the last section wins.
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            active = sections.length - 1;
        }
        if (active === current) return;
        current = active;
        items.forEach(function (item, i) {
            item.classList.toggle('is-active', i === active);
            if (i === active) item.setAttribute('aria-current', 'location');
            else item.removeAttribute('aria-current');
        });
    }

    let ticking = false;
    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            ticking = false;
            update();
        });
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
})();

// Photo desk (home), after chloemaillot.fr: drag a print around the tray
// (it comes to the top and stays inside); the print under the pointer tilts
// towards it and catches a light while the others blur; a click opens the
// print large, flying it there from the desk.
// The stage is laid out at a fixed 1152 x 520 and scaled to the tray.
(function () {
    const desk = document.querySelector('.desk');
    const stage = desk && desk.querySelector('.desk-stage');
    if (!stage) return;
    const BASE = 1152;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scale = 1;
    let top = stage.querySelectorAll('.desk-item').length + 1;

    // Sounds (Web Audio, no files). "slide": a print skimming the desk, a
    // falling swish with a tiny tick, when the pointer comes onto a print.
    // "lift": a soft rising two-note chord (A4, E5) on a breath of air, when
    // one opens. Silent until the visitor has interacted with the page.
    const SOUNDS = {
        slide: { gain: 0.4, layers: [
            { noise: 'bandpass', f: 2600, to: 900, q: 0.9, attack: 0.01, decay: 0.12, peak: 0.07 },
            { tone: 'triangle', f: 1500, offset: 0.02, attack: 0.001, decay: 0.03, peak: 0.02 }
        ] },
        lift: { gain: 0.5, layers: [
            { noise: 'lowpass', f: 1200, to: 3000, q: 0.7, attack: 0.04, decay: 0.18, peak: 0.03 },
            { tone: 'triangle', f: 440, attack: 0.02, decay: 0.38, peak: 0.05 },
            { tone: 'triangle', f: 659.25, offset: 0.05, attack: 0.02, decay: 0.42, peak: 0.04 },
            { tone: 'sine', f: 1318.5, offset: 0.1, attack: 0.01, decay: 0.25, peak: 0.012 }
        ], echo: { delay: 0.11, feedback: 0.18, wet: 0.1, lowpass: 3000 } }
    };
    let audio = null, bus = null, lastPage = 0;

    function play(name, volume) {
        if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!audio) {
            audio = new AC();
            // Output stage: a little gain into a firm compressor.
            bus = audio.createGain();
            bus.gain.value = 4;
            const comp = audio.createDynamicsCompressor();
            comp.threshold.value = -8; comp.knee.value = 6; comp.ratio.value = 12;
            comp.attack.value = 0.002; comp.release.value = 0.08;
            bus.connect(comp).connect(audio.destination);
        }
        if (audio.state === 'suspended') audio.resume();
        const r = SOUNDS[name], t0 = audio.currentTime;
        const out = audio.createGain();
        out.gain.value = r.gain * volume;
        out.connect(bus);
        if (r.echo) {
            const d = audio.createDelay(1), lp = audio.createBiquadFilter();
            const fb = audio.createGain(), wet = audio.createGain();
            d.delayTime.value = r.echo.delay; lp.type = 'lowpass'; lp.frequency.value = r.echo.lowpass;
            fb.gain.value = r.echo.feedback; wet.gain.value = r.echo.wet;
            out.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(bus);
        }
        r.layers.forEach(function (l) {
            const t = t0 + (l.offset || 0), end = t + l.attack + l.decay;
            const env = audio.createGain();
            env.gain.setValueAtTime(0.0001, t);
            env.gain.exponentialRampToValueAtTime(l.peak, t + l.attack);
            env.gain.exponentialRampToValueAtTime(0.0001, end);
            env.connect(out);
            let src;
            if (l.tone) {
                src = audio.createOscillator();
                src.type = l.tone;
                src.frequency.value = l.f;
                if (l.detune) src.detune.value = l.detune;
                src.connect(env);
            } else {
                const len = Math.max(1, Math.floor((end - t + 0.05) * audio.sampleRate));
                const buf = audio.createBuffer(1, len, audio.sampleRate), ch = buf.getChannelData(0);
                for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
                src = audio.createBufferSource();
                src.buffer = buf;
                const filt = audio.createBiquadFilter();
                filt.type = l.noise; filt.Q.value = l.q;
                filt.frequency.setValueAtTime(l.f, t);
                // Optional sweep of the filter: the swish of the sound.
                if (l.to) filt.frequency.exponentialRampToValueAtTime(l.to, end);
                src.connect(filt).connect(env);
            }
            src.start(t);
            src.stop(end + 0.05);
        });
    }

    // A swish each time the pointer lands on a new print (not too often).
    stage.addEventListener('pointerover', function (e) {
        if (e.pointerType !== 'mouse') return;
        const item = e.target.closest('.desk-item');
        if (!item || item.contains(e.relatedTarget) || item.classList.contains('is-dragging')) return;
        const now = performance.now();
        if (now - lastPage < 160) return;
        lastPage = now;
        play('slide', 0.22);
    });

    // Critically damped spring (no bounce, settles in 0.6s), sampled as a
    // CSS linear() easing; falls back to a close cubic-bezier.
    const SPRING = (function () {
        const pts = [];
        for (let i = 0; i <= 40; i++) {
            const t = i / 40, w = 15.4 * 0.6 * t;
            pts.push((1 - (1 + w) * Math.exp(-w)).toFixed(4));
        }
        const css = 'linear(' + pts.join(', ') + ')';
        return (window.CSS && CSS.supports && CSS.supports('transition-timing-function', css))
            ? css : 'cubic-bezier(0.16, 1, 0.3, 1)';
    })();

    function fit() {
        scale = desk.clientWidth / BASE;
        stage.style.setProperty('--desk-scale', scale);
    }
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(desk);
    else window.addEventListener('resize', fit);

    // The light: its spot in the print's own (unscaled) pixels, and an angle
    // that turns the iridescent rim as the pointer moves.
    stage.addEventListener('pointermove', function (e) {
        const item = e.target.closest('.desk-item');
        if (!item || item.classList.contains('is-dragging')) return;
        const r = item.getBoundingClientRect();
        const x = (e.clientX - r.left) / scale, y = (e.clientY - r.top) / scale;
        item.style.setProperty('--lx', x + 'px');
        item.style.setProperty('--ly', y + 'px');
        item.style.setProperty('--la', (Math.atan2(y - r.height / scale / 2, x - r.width / scale / 2) * 180 / Math.PI + 180) + 'deg');
        // Tilt towards the pointer, up to 5deg each way.
        if (!reduce.matches) {
            const ax = (e.clientX - r.left) / r.width - 0.5;
            const ay = (e.clientY - r.top) / r.height - 0.5;
            item.style.setProperty('--ty', (10 * ax) + 'deg');
            item.style.setProperty('--tx', (-10 * ay) + 'deg');
        }
    });
    stage.addEventListener('pointerout', function (e) {
        const item = e.target.closest('.desk-item');
        if (!item || item.contains(e.relatedTarget)) return;
        item.style.removeProperty('--tx');
        item.style.removeProperty('--ty');
    });

    stage.addEventListener('pointerdown', function (e) {
        const item = e.target.closest('.desk-item');
        if (!item || e.button !== 0) return;
        e.preventDefault();
        item.style.zIndex = ++top;

        const startX = e.clientX, startY = e.clientY;
        const startLeft = item.offsetLeft, startTop = item.offsetTop;
        const maxLeft = stage.offsetWidth - item.offsetWidth;
        const maxTop = stage.offsetHeight - item.offsetHeight;
        let dragged = false;

        // Pointer travel is in screen pixels; the stage is scaled. A few
        // pixels of travel tell a drag from a click.
        function move(ev) {
            const dx = ev.clientX - startX, dy = ev.clientY - startY;
            if (!dragged && Math.hypot(dx, dy) < 4) return;
            if (!dragged) {
                dragged = true;
                item.classList.add('is-dragging');
            }
            const left = Math.max(0, Math.min(maxLeft, startLeft + dx / scale));
            const topPx = Math.max(0, Math.min(maxTop, startTop + dy / scale));
            item.style.left = (left / BASE * 100) + '%';
            item.style.top = topPx + 'px';
        }
        // On the window, so a fast flick can't slip off the print.
        function up() {
            item.classList.remove('is-dragging');
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
            if (!dragged) open(item);
        }
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
    });

    stage.addEventListener('keydown', function (e) {
        const item = e.target.closest('.desk-item');
        if (item && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            open(item);
        }
    });

    // Lightbox. The large print starts exactly over the small one (same box,
    // same turn) and eases to the centre; closing plays it back.
    let box = null, source = null, lastFocus = null;

    // Transform that puts the large print exactly over the small one: same
    // centre (a rotated box keeps its centre), same on-screen width (the
    // print's own width times the tray's scale, not its rotated bounds)
    // and the same turn.
    function flight(card, item) {
        const from = item.getBoundingClientRect();
        const to = card.getBoundingClientRect();
        const s = (item.offsetWidth * scale) / card.offsetWidth;
        const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
        const rot = (getComputedStyle(item).getPropertyValue('--rot') || '0deg').trim();
        return 'translate(' + dx + 'px, ' + dy + 'px) rotate(' + rot + ') scale(' + s + ')';
    }

    function open(item) {
        if (box) return;
        source = item;
        lastFocus = document.activeElement;
        const img = item.querySelector('img');
        box = document.createElement('div');
        box.className = 'desk-lightbox';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', img.alt || 'Photo');
        box.tabIndex = -1;
        // card: flies out and back; tilt: follows the pointer once open.
        box.innerHTML = '<div class="desk-lightbox-card"><div class="desk-lightbox-tilt"><img alt="">' +
            '<span class="desk-grain" aria-hidden="true"></span><span class="desk-lightbox-glare" aria-hidden="true"></span></div></div>' +
            '<span class="desk-lightbox-hint">Click anywhere or press Esc</span>';
        const big = box.querySelector('img');
        // Its size is known up front, so the flight is measured from the
        // real box on the very first frame.
        big.width = img.naturalWidth || img.width;
        big.height = img.naturalHeight || img.height;
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
        document.body.appendChild(box);
        document.documentElement.classList.add('resume-open');

        const card = box.querySelector('.desk-lightbox-card');
        if (!reduce.matches && card.animate) {
            card.animate(
                [{ transform: flight(card, item) }, { transform: 'none' }],
                { duration: 600, easing: SPRING }
            );
        }
        item.classList.add('is-away');
        play('lift', 0.45);
        requestAnimationFrame(function () { box.classList.add('is-open'); });
        box.focus({ preventScroll: true });
        box.addEventListener('click', close);
        box.addEventListener('mousemove', aim);
        box.addEventListener('mouseleave', function () { tilt.tx = tilt.ty = 0; spin(); });
    }

    // Open print follows the pointer: tilts up to 6deg towards it (eased,
    // like a magnet) and the light sits under the pointer.
    const tilt = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
    function aim(e) {
        const el = box && box.querySelector('.desk-lightbox-tilt');
        if (!el) return;
        const r = el.getBoundingClientRect();
        tilt.ty = 6 * ((e.clientX - r.left) / r.width - 0.5);
        tilt.tx = -6 * ((e.clientY - r.top) / r.height - 0.5);
        el.style.setProperty('--lx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--ly', (e.clientY - r.top) + 'px');
        el.style.setProperty('--la', ((e.clientX + e.clientY) * 0.22 % 360) + 'deg');
        spin();
    }
    function spin() {
        if (tilt.raf) return;
        (function step() {
            const el = box && box.querySelector('.desk-lightbox-tilt');
            if (!el) { tilt.raf = 0; return; }
            const k = reduce.matches ? 1 : 0.14;
            tilt.x += (tilt.tx - tilt.x) * k;
            tilt.y += (tilt.ty - tilt.y) * k;
            el.style.transform = 'perspective(900px) rotateX(' + tilt.x.toFixed(3) + 'deg) rotateY(' + tilt.y.toFixed(3) + 'deg)';
            if (Math.abs(tilt.tx - tilt.x) > 0.01 || Math.abs(tilt.ty - tilt.y) > 0.01) tilt.raf = requestAnimationFrame(step);
            else tilt.raf = 0;
        })();
    }

    function close() {
        if (!box) return;
        const closing = box, item = source;
        box = null;
        tilt.x = tilt.y = tilt.tx = tilt.ty = 0;
        closing.classList.remove('is-open');
        document.documentElement.classList.remove('resume-open');
        const card = closing.querySelector('.desk-lightbox-card');
        let finished = false;
        function done() {
            if (finished) return;
            finished = true;
            closing.remove();
            item.classList.remove('is-away');
            if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
        }
        if (!reduce.matches && card.animate) {
            const back = card.animate(
                [{ transform: 'none' }, { transform: flight(card, item) }],
                { duration: 600, easing: SPRING, fill: 'forwards' }
            );
            back.onfinish = done;
            // A background tab may never run the animation; close regardless.
            setTimeout(done, 680);
        } else {
            done();
        }
    }

    document.addEventListener('keydown', function (e) {
        if (box && e.key === 'Escape') close();
    });
})();

// Theme toggle (header and mobile menu). Light is the default whatever the
// system says; dark only when picked, remembered in this browser.
(function () {
    const root = document.documentElement;
    const buttons = document.querySelectorAll('.theme-toggle');
    if (!buttons.length) return;

    function sync() {
        const dark = root.getAttribute('data-theme') === 'dark';
        buttons.forEach(function (b) {
            b.setAttribute('aria-pressed', dark ? 'true' : 'false');
            b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        });
    }

    function apply(dark) {
        if (dark) root.setAttribute('data-theme', 'dark');
        else root.removeAttribute('data-theme');
        try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
        sync();
        document.dispatchEvent(new CustomEvent('themechange', { detail: { dark: dark } }));
    }

    buttons.forEach(function (b) {
        b.addEventListener('click', function () {
            const dark = root.getAttribute('data-theme') !== 'dark';
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            // A cross-fade between the two themes where supported.
            if (document.startViewTransition && !reduce) {
                document.startViewTransition(function () { apply(dark); });
            } else {
                apply(dark);
            }
        });
    });
    sync();
})();

// Case covers with phones: on a mouse the phones turn to the pointer and
// drift by depth. Eased with a lerp so they settle softly; the CSS reads
// --px / --py (-1..1) from the cover.
(function () {
    const covers = document.querySelectorAll('.case-cover--phones');
    if (!covers.length) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    covers.forEach(function (cover) {
        let tx = 0, ty = 0, x = 0, y = 0, raf = null;
        function tick() {
            x += (tx - x) * 0.08;
            y += (ty - y) * 0.08;
            cover.style.setProperty('--px', x.toFixed(4));
            cover.style.setProperty('--py', y.toFixed(4));
            raf = (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) ? requestAnimationFrame(tick) : null;
        }
        function go() { if (!raf) raf = requestAnimationFrame(tick); }
        cover.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse' || !fine.matches || still.matches) return;
            const r = cover.getBoundingClientRect();
            tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
            ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
            go();
        });
        cover.addEventListener('pointerleave', function () { tx = 0; ty = 0; go(); });
    });
})();

// Case phone screens, on phones only: a tap opens the screens full screen.
// Pinch or double-tap to zoom, drag to pan a zoomed screen, swipe sideways
// to page through, swipe down or tap the cross to close.
(function () {
    const covers = document.querySelectorAll('.case-cover--phones');
    if (!covers.length) return;
    const mobile = window.matchMedia('(max-width: 768px)');
    let viewer = null, track, countEl, closeBtn, slides = [], index = 0, lastFocus = null;
    let s = 1, tx = 0, ty = 0;
    const pts = new Map();
    let mode = null, start = null, lastTap = 0, lastTapX = 0, lastTapY = 0;

    function build() {
        viewer = document.createElement('div');
        viewer.className = 'shot-viewer';
        viewer.hidden = true;
        viewer.setAttribute('role', 'dialog');
        viewer.setAttribute('aria-modal', 'true');
        viewer.setAttribute('aria-label', 'Screens');
        viewer.innerHTML = '<div class="shot-viewer-top"><span class="shot-viewer-count" aria-live="polite"></span>' +
            '<button type="button" class="shot-viewer-close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="2.25" vector-effect="non-scaling-stroke" stroke-linecap="square"/></svg></button></div>' +
            '<div class="shot-viewer-track"></div>';
        document.body.appendChild(viewer);
        track = viewer.querySelector('.shot-viewer-track');
        countEl = viewer.querySelector('.shot-viewer-count');
        closeBtn = viewer.querySelector('.shot-viewer-close');
        closeBtn.addEventListener('click', close);
        viewer.addEventListener('pointerdown', onDown);
        viewer.addEventListener('pointermove', onMove);
        viewer.addEventListener('pointerup', onUp);
        viewer.addEventListener('pointercancel', onUp);
        document.addEventListener('keydown', function (e) {
            if (viewer.hidden) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowRight') go(index + 1);
            else if (e.key === 'ArrowLeft') go(index - 1);
        });
    }

    function shot() { return slides[index].firstChild; }

    function apply(anim) {
        const el = shot();
        el.style.transition = anim ? 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
        el.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
    }

    // Keep a zoomed screen from being dragged off past its edges.
    function clampPan() {
        const el = shot();
        const mx = Math.max(0, (el.offsetWidth * s - window.innerWidth) / 2);
        const my = Math.max(0, (el.offsetHeight * s - window.innerHeight) / 2);
        tx = Math.max(-mx, Math.min(mx, tx));
        ty = Math.max(-my, Math.min(my, ty));
    }

    // Zoom to ns keeping the point under (px, py) where it is.
    function zoomAt(px, py, ns, anim) {
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        const qx = (px - cx - tx) / s, qy = (py - cy - ty) / s;
        s = ns; tx = px - cx - qx * s; ty = py - cy - qy * s;
        if (s <= 1) { s = 1; tx = 0; ty = 0; }
        clampPan();
        apply(anim);
    }

    function go(i, anim) {
        const next = Math.max(0, Math.min(slides.length - 1, i));
        if (next !== index) { s = 1; tx = 0; ty = 0; apply(false); }
        index = next;
        track.style.transition = anim === false ? 'none' : '';
        track.style.transform = 'translateX(' + (-index * 100) + 'vw)';
        countEl.textContent = (index + 1) + ' / ' + slides.length;
    }

    function open(imgs, i) {
        if (!viewer) build();
        track.innerHTML = '';
        slides = imgs.map(function (im) {
            const slide = document.createElement('div');
            slide.className = 'shot-viewer-slide';
            // A screen that is a clip (the passcode login) plays here too.
            const clip = window.caseClipFor && window.caseClipFor(im);
            if (clip) {
                clip.classList.add('case-pass--slide');
                slide.appendChild(clip);
                track.appendChild(slide);
                window.initCasePass(clip);
                return slide;
            }
            const big = document.createElement('img');
            big.src = im.currentSrc || im.src;
            big.alt = im.alt;
            big.draggable = false;
            slide.appendChild(big);
            track.appendChild(slide);
            return slide;
        });
        index = i; s = 1; tx = 0; ty = 0;
        lastFocus = document.activeElement;
        document.documentElement.classList.add('shot-viewer-lock');
        viewer.style.setProperty('--fade', '1');
        viewer.hidden = false;
        go(i, false);
        requestAnimationFrame(function () { viewer.classList.add('is-open'); });
        closeBtn.focus({ preventScroll: true });
    }

    function close() {
        viewer.classList.remove('is-open');
        document.documentElement.classList.remove('shot-viewer-lock');
        pts.clear(); mode = null; start = null;
        setTimeout(function () { if (!viewer.classList.contains('is-open')) viewer.hidden = true; }, 260);
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    function onDown(e) {
        if (e.target.closest('.shot-viewer-close')) return;
        try { viewer.setPointerCapture(e.pointerId); } catch (err) {}
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size === 2) {
            const p = Array.from(pts.values());
            mode = 'pinch';
            start = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, s: s,
                      mx: (p[0].x + p[1].x) / 2, my: (p[0].y + p[1].y) / 2, tx: tx, ty: ty };
            go(index);
            viewer.style.setProperty('--fade', '1');
        } else if (pts.size === 1) {
            mode = null;
            start = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
        }
    }

    function onMove(e) {
        if (!pts.has(e.pointerId)) return;
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (mode === 'pinch' && pts.size >= 2) {
            const p = Array.from(pts.values());
            const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
            const mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2;
            const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
            const qx = (start.mx - cx - start.tx) / start.s, qy = (start.my - cy - start.ty) / start.s;
            s = Math.max(0.85, Math.min(4, start.s * d / start.d));
            tx = mx - cx - qx * s; ty = my - cy - qy * s;
            apply(false);
            return;
        }
        if (pts.size !== 1 || !start || mode === 'done') return;
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (!mode) {
            if (Math.hypot(dx, dy) < 8) return;
            mode = s > 1 ? 'pan' : (Math.abs(dx) > Math.abs(dy) ? 'swipe' : 'dismiss');
        }
        if (mode === 'pan') {
            tx = start.tx + dx; ty = start.ty + dy;
            clampPan(); apply(false);
        } else if (mode === 'swipe') {
            const edge = (index === 0 && dx > 0) || (index === slides.length - 1 && dx < 0);
            track.style.transition = 'none';
            track.style.transform = 'translateX(calc(' + (-index * 100) + 'vw + ' + (edge ? dx / 3 : dx) + 'px))';
        } else if (mode === 'dismiss') {
            const el = shot();
            el.style.transition = 'none';
            el.style.transform = 'translateY(' + dy + 'px) scale(' + (1 - Math.min(Math.abs(dy) / 1600, 0.15)) + ')';
            viewer.style.setProperty('--fade', (1 - Math.min(Math.abs(dy) / 380, 0.75)).toFixed(3));
        }
    }

    function onUp(e) {
        if (!pts.has(e.pointerId)) return;
        pts.delete(e.pointerId);
        if (mode === 'pinch') {
            if (s < 1.05) { s = 1; tx = 0; ty = 0; apply(true); } else { clampPan(); apply(true); }
            if (pts.size === 1) {
                const p = Array.from(pts.values())[0];
                start = { x: p.x, y: p.y, tx: tx, ty: ty };
                mode = s > 1 ? 'pan' : 'done';
            } else { mode = null; start = null; }
            return;
        }
        if (pts.size || !start) return;
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (mode === 'swipe') {
            go(index + (dx < -50 ? 1 : dx > 50 ? -1 : 0));
        } else if (mode === 'dismiss') {
            if (Math.abs(dy) > 110) close();
            else { viewer.style.setProperty('--fade', '1'); s = 1; tx = 0; ty = 0; apply(true); }
        } else if (!mode) {
            // A tap; two quick taps zoom in at that point, or back out.
            const now = performance.now();
            if (now - lastTap < 300 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 30) {
                zoomAt(e.clientX, e.clientY, s > 1 ? 1 : 2.5, true);
                lastTap = 0;
            } else {
                lastTap = now; lastTapX = e.clientX; lastTapY = e.clientY;
            }
        }
        mode = null; start = null;
    }

    covers.forEach(function (cover) {
        cover.addEventListener('click', function (e) {
            if (!mobile.matches) return;
            const phone = e.target.closest('.case-phone, .case-browser');
            if (!phone) return;
            const imgs = Array.from(cover.querySelectorAll('.case-browser-shot, .case-phone-screen img:not(.case-flow-layer)')).filter(function (im) { return im.naturalWidth; });
            if (!imgs.length) return;
            open(imgs, Math.max(0, imgs.indexOf(phone.querySelector('img'))));
        });
    });
})();

// Looping flow clips in a phone ([data-loop]): each screen holds, a tap
// shows where the user presses (data-tap="x,y" in %), then the next screen
// pushes in. After the last it starts over. Runs only while on screen; with
// reduced motion it stays on the first screen.
(function () {
    const loops = document.querySelectorAll('[data-loop]');
    if (!loops.length) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const HOLD = 1900, TAP = 480;
    loops.forEach(function (loop) {
        const shots = Array.from(loop.querySelectorAll('.case-loop-shot'));
        const tap = loop.parentElement.querySelector('.case-loop-tap');
        if (!shots.length) return;
        let i = 0, timer = null, running = false;
        shots[0].classList.add('is-current');
        if (shots.length < 2 || still.matches) return;

        function next() {
            const cur = shots[i], n = (i + 1) % shots.length, nxt = shots[n];
            // Park the incoming screen on the right without animating it there.
            nxt.classList.add('is-instant');
            nxt.classList.remove('is-prev', 'is-current');
            void nxt.offsetWidth;
            nxt.classList.remove('is-instant');
            shots.forEach(function (s) { if (s !== cur && s !== nxt) s.classList.remove('is-prev'); });
            cur.classList.remove('is-current');
            cur.classList.add('is-prev');
            nxt.classList.add('is-current');
            i = n;
        }

        function step() {
            const at = (shots[i].dataset.tap || '').split(',');
            if (tap && at.length === 2) {
                tap.style.setProperty('--tx', at[0] + '%');
                tap.style.setProperty('--ty', at[1] + '%');
                tap.classList.remove('is-on');
                void tap.offsetWidth;
                tap.classList.add('is-on');
                timer = setTimeout(function () { next(); schedule(); }, TAP);
            } else {
                next(); schedule();
            }
        }

        function schedule() { if (running) timer = setTimeout(step, HOLD); }
        function play() { if (running) return; running = true; schedule(); }
        function pause() { running = false; clearTimeout(timer); }

        let inView = !('IntersectionObserver' in window);
        if (!inView) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    inView = e.isIntersecting;
                    if (inView && !document.hidden) play(); else pause();
                });
            }, { threshold: 0.25 }).observe(loop);
        } else play();
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) pause(); else if (inView) play();
        });
    });
})();

// Passcode login clip ([data-passcode="1918"]): the finger presses each
// digit (the key lights up and a dot fills), then the spinner turns while
// it "signs in", and it all starts over. Runs only while on screen; with
// reduced motion it shows the filled code and the spinner, still.
(function () {
    const KEYS = {
        1: [24.4, 42.2], 2: [50, 42.2], 3: [75.6, 42.2],
        4: [24.4, 54.02], 5: [50, 54.02], 6: [75.6, 54.02],
        7: [24.4, 65.84], 8: [50, 65.84], 9: [75.6, 65.84],
        0: [50, 77.67]
    };
    function initPass(pad) {
        if (pad.dataset.passInit) return;
        pad.dataset.passInit = '1';
        const code = pad.dataset.passcode.split('');
        const key = pad.querySelector('.case-pass-key');
        const tap = pad.querySelector('.case-pass-tap');
        const spin = pad.querySelector('.case-pass-spin');
        const dots = Array.from(pad.querySelectorAll('.case-pass-dot'));
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            dots.forEach(function (d) { d.classList.add('is-on'); });
            return;
        }
        let timers = [], running = false;
        function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
        function press(d, n) {
            const p = KEYS[d];
            pad.style.setProperty('--kx', p[0] + '%');
            pad.style.setProperty('--ky', p[1] + '%');
            tap.classList.remove('is-on'); void tap.offsetWidth; tap.classList.add('is-on');
            // The drawn key appears over the screenshot's own, fills, the digit
            // sinks and springs back, then it goes.
            key.firstChild.textContent = d;
            key.classList.remove('is-down', 'is-show');
            void key.offsetWidth;
            key.classList.add('is-show');
            requestAnimationFrame(function () { key.classList.add('is-down'); });
            setTimeout(function () { key.classList.remove('is-down'); }, 170);
            setTimeout(function () { key.classList.remove('is-show'); }, 560);
            if (dots[n]) dots[n].classList.add('is-on');
        }
        function reset() {
            dots.forEach(function (d) { d.classList.remove('is-on'); });
            spin.classList.remove('is-on');
            key.classList.remove('is-show', 'is-down');
            tap.classList.remove('is-on');
        }
        function cycle() {
            timers = [];
            let t = 900;
            code.forEach(function (d, n) { at(t, function () { press(d, n); }); t += 520; });
            at(t + 150, function () { spin.classList.add('is-on'); });
            at(t + 2100, reset);
            at(t + 2900, function () { if (running) cycle(); });
        }
        function play() { if (running) return; running = true; reset(); cycle(); }
        function pause() { running = false; timers.forEach(clearTimeout); timers = []; }
        let inView = !('IntersectionObserver' in window);
        if (!inView) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    inView = e.isIntersecting;
                    if (inView && !document.hidden) play(); else pause();
                });
            }, { threshold: 0.25 }).observe(pad);
        } else play();
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) pause(); else if (inView) play();
        });
    }
    // A live copy for the full-screen viewers: the clip, not a still.
    window.caseClipFor = function (img) {
        const pad = img && img.closest && img.closest('[data-passcode], [data-flow]');
        if (!pad || !pad.classList.contains('case-pass')) return null;
        const copy = pad.cloneNode(true);
        delete copy.dataset.passInit;
        return copy;
    };
    window.initCasePass = function (pad) {
        if (pad.dataset.flow) { if (window.initCaseFlow) window.initCaseFlow(pad); }
        else initPass(pad);
    };
    document.querySelectorAll('[data-passcode]').forEach(initPass);
})();

// Desktop photo viewer (inline in the case pages): when it shows the
// passcode screen, play the clip in its place instead of the still.
(function () {
    const viewer = document.getElementById('photoViewer');
    const img = document.getElementById('photoViewerImg');
    if (!viewer || !img || !document.querySelector('[data-passcode], [data-flow]')) return;
    let clip = null;
    function sync() {
        if (clip) { clip.remove(); clip = null; }
        img.style.visibility = '';
        if (!viewer.classList.contains('active')) return;
        const src = Array.from(document.querySelectorAll('.case-pass > img:not(.case-flow-layer)')).find(function (i) { return i.src === img.src; });
        const copy = src && window.caseClipFor && window.caseClipFor(src);
        if (!copy) return;
        clip = copy;
        clip.classList.add('case-pass--viewer');
        img.parentNode.appendChild(clip);
        img.style.visibility = 'hidden';
        window.initCasePass(clip);
    }
    new MutationObserver(sync).observe(img, { attributes: true, attributeFilter: ['src'] });
    new MutationObserver(sync).observe(viewer, { attributes: true, attributeFilter: ['class'] });
})();

// Flow clips over a screenshot ([data-flow]): short scripted loops of the
// Home screen. "sheet" pulls the history sheet up to full height and back;
// "send" types an amount, opens the receiver's currency, finds AZN by search
// and picks it: the amount field takes focus while typing, and the currency
// list shows the current EUR until the search narrows it. Run only while on
// screen; with reduced motion they hold still.
(function () {
    function initFlow(pad) {
        if (pad.dataset.passInit) return;
        pad.dataset.passInit = '1';
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const tap = pad.querySelector('.case-pass-tap');
        const part = function (n) { return pad.querySelector('[data-part="' + n + '"]'); };
        let timers = [], running = false;
        function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
        function place(x, y) {
            pad.style.setProperty('--kx', x + '%');
            pad.style.setProperty('--ky', y + '%');
        }
        function press(x, y) {
            tap.classList.remove('is-hold', 'is-lift', 'is-on');
            place(x, y);
            void tap.offsetWidth;
            tap.classList.add('is-on');
        }
        function hold(x, y) {
            tap.classList.remove('is-hold', 'is-lift', 'is-on');
            place(x, y);
            void tap.offsetWidth;
            tap.classList.add('is-hold');
        }
        function lift() { tap.classList.remove('is-hold'); tap.classList.add('is-lift'); }

        let reset, cycle, length;
        if (pad.dataset.flow === 'sendmoney') {
            const sc = ['s1', 's2', 's3'].map(part);
            const country = part('country'), empty = part('empty');
            const cdim = part('cdim'), picker = part('picker'), clist = part('clist');
            const cardEmpty = part('cardempty'), visa = part('visa');
            const types = Array.from(pad.querySelectorAll('.case-flow-type'));
            const choose = function (k) { types.forEach(function (t) { t.classList.toggle('is-sel', t.dataset.type === k); }); };
            const push = function (from, to) { from.classList.add('is-back'); to.classList.add('is-in'); };
            reset = function () {
                pad.classList.add('is-instant');
                sc.forEach(function (e, n) { e.classList.toggle('is-in', n === 0); e.classList.remove('is-back'); });
                country.classList.remove('is-on'); empty.classList.remove('is-gone');
                cdim.classList.remove('is-on'); picker.classList.remove('is-up');
                clist.classList.remove('is-picked');
                cardEmpty.classList.remove('is-gone'); visa.classList.remove('is-gone');
                choose('bank');
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                // The country: open the picker and pick Spain from the list.
                at(800, function () { press(50, 26.1); });
                at(950, function () { cdim.classList.add('is-on'); picker.classList.add('is-up'); });
                at(2600, function () { press(50, 64.3); clist.classList.add('is-picked'); });
                at(3100, function () { picker.classList.remove('is-up'); cdim.classList.remove('is-on'); });
                at(3350, function () { country.classList.add('is-on'); });
                // Bank account to cash, then on.
                at(4900, function () { press(50, 74.7); });
                at(5000, function () { choose('cash'); });
                at(5900, function () { press(50, 93.2); });
                at(6050, function () { push(sc[0], sc[1]); });
                // One tap fills the recipient, then on.
                at(7200, function () { press(50, 26.1); });
                at(7350, function () { empty.classList.add('is-gone'); });
                at(8300, function () { press(50, 93.2); });
                at(8450, function () { push(sc[1], sc[2]); });
                // The card: empty, one tap fills it, then the VISA mark shows.
                at(9600, function () { press(50, 26.1); });
                at(9750, function () { cardEmpty.classList.add('is-gone'); });
                at(10150, function () { visa.classList.add('is-gone'); });
            };
            length = 12600;
        } else if (pad.dataset.flow === 'paycard') {
            // Pay by card: open row 1's menu, delete the card (rows slide up),
            // then "Try new card" and the details type in.
            const row = part('row'), rowopen = part('rowopen'), lower = part('lower'), form = part('form');
            const typed = ['num', 'exp', 'cvv', 'chip'].map(part);
            reset = function () {
                pad.classList.add('is-instant');
                row.classList.remove('is-gone'); rowopen.classList.remove('is-on', 'is-gone');
                lower.classList.remove('is-up', 'is-gone'); form.classList.remove('is-up', 'is-on');
                typed.forEach(function (e) { e.classList.remove('is-on', 'is-typed'); });
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                at(900, function () { press(46.12, 38.69); });
                at(1050, function () { rowopen.classList.add('is-on'); });
                at(2100, function () { press(33.76, 38.65); });
                at(2250, function () { row.classList.add('is-gone'); rowopen.classList.add('is-gone'); });
                at(2400, function () { lower.classList.add('is-up'); form.classList.add('is-up'); });
                at(3600, function () { press(29.52, 51.12); });
                at(3750, function () { lower.classList.add('is-gone'); form.classList.add('is-on'); typed.forEach(function (e) { e.classList.add('is-on'); }); });
                at(4500, function () { typed[0].classList.add('is-typed'); });
                at(5800, function () { typed[1].style.setProperty('--t', '380ms'); typed[1].classList.add('is-typed'); });
                at(6350, function () { typed[2].style.setProperty('--t', '320ms'); typed[2].classList.add('is-typed'); });
                at(6800, function () { typed[3].classList.add('is-typed'); });
            };
            length = 9400;
        } else if (pad.dataset.flow === 'wallet') {
            // Wallet: press Pay, the QR modal opens over a dimmed page, then
            // the cross closes it.
            const dim = part('dim'), modal = part('modal');
            reset = function () {
                pad.classList.add('is-instant');
                dim.classList.remove('is-on'); modal.classList.remove('is-on');
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                at(900, function () { press(79.52, 35.98); });
                at(1050, function () { dim.classList.add('is-on'); modal.classList.add('is-on'); });
                at(3900, function () { press(61.77, 21.97); });
                at(4050, function () { modal.classList.remove('is-on'); dim.classList.remove('is-on'); });
            };
            length = 5800;
        } else if (pad.dataset.flow === 'sheet') {
            const sheet = pad.querySelector('.case-flow-sheet');
            reset = function () { sheet.classList.remove('is-up'); tap.className = 'case-pass-tap'; };
            cycle = function () {
                at(900, function () { hold(50, 47.2); });
                at(1100, function () { sheet.classList.add('is-up'); place(50, 7.8); });
                at(1860, lift);
                at(3700, function () { hold(50, 7.8); });
                at(3900, function () { sheet.classList.remove('is-up'); place(50, 47.2); });
                at(4660, lift);
            };
            length = 5800;
        } else {
            const send = part('send'), recv = part('recv'), search = part('search'), hint = part('hint');
            const pill = pad.querySelector('.case-flow-pill'), dim = pad.querySelector('.case-flow-dim');
            const modal = pad.querySelector('.case-flow-modal');
            const gone = ['clear', 'list', 'check'].map(part);
            const focus = part('focus');
            reset = function () {
                send.textContent = '0'; recv.textContent = '0,00'; search.textContent = '';
                [send, search].forEach(function (t) { t.classList.remove('is-caret'); });
                [pill, dim, focus].forEach(function (e) { e.classList.remove('is-on'); });
                modal.classList.remove('is-up');
                hint.classList.remove('is-gone');
                gone.forEach(function (g) { g.classList.remove('is-gone'); });
                tap.className = 'case-pass-tap';
            };
            cycle = function () {
                at(800, function () { press(30.7, 17.3); focus.classList.add('is-on'); send.classList.add('is-caret'); });
                at(1300, function () { send.textContent = '1'; recv.textContent = '1,18'; });
                at(1650, function () { send.textContent = '10'; recv.textContent = '11,80'; });
                at(2000, function () { send.textContent = '100'; recv.textContent = '118,03'; });
                at(2700, function () { press(78.1, 25.4); });
                at(2850, function () {
                    send.classList.remove('is-caret'); focus.classList.remove('is-on'); send.textContent = '100.00';
                    dim.classList.add('is-on'); modal.classList.add('is-up');
                });
                at(3800, function () { press(50, 39.5); hint.classList.add('is-gone'); search.classList.add('is-caret'); });
                at(4250, function () { search.textContent = 'A'; part('clear').classList.add('is-gone'); part('list').classList.add('is-gone'); });
                at(4600, function () { search.textContent = 'AZ'; });
                at(5600, function () { press(49.7, 46.3); });
                at(5700, function () { part('check').classList.add('is-gone'); search.classList.remove('is-caret'); });
                at(6200, function () { modal.classList.remove('is-up'); dim.classList.remove('is-on'); });
                at(6550, function () { pill.classList.add('is-on'); recv.textContent = '170,00'; });
            };
            length = 9000;
        }
        function loop() { timers = []; reset(); cycle(); at(length, function () { if (running) loop(); }); }
        function play() { if (running) return; running = true; loop(); }
        function pause() { running = false; timers.forEach(clearTimeout); timers = []; }
        reset();
        let inView = !('IntersectionObserver' in window);
        if (!inView) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    inView = e.isIntersecting;
                    if (inView && !document.hidden) play(); else pause();
                });
            }, { threshold: 0.25 }).observe(pad);
        } else play();
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) pause(); else if (inView) play();
        });
    }
    window.initCaseFlow = initFlow;
    document.querySelectorAll('[data-flow]').forEach(initFlow);
})();

// Sideways phone rows (.case-scroll): drag with the mouse to scroll; a drag
// doesn't count as a click, so it won't open the photo viewer.
(function () {
    document.querySelectorAll('.case-scroll').forEach(function (row) {
        let down = false, startX = 0, startLeft = 0, moved = false;
        row.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            down = true; moved = false; startX = e.clientX; startLeft = row.scrollLeft;
        });
        window.addEventListener('pointermove', function (e) {
            if (!down) return;
            const dx = e.clientX - startX;
            if (!moved && Math.abs(dx) > 4) { moved = true; row.classList.add('is-dragging'); }
            if (moved) { row.scrollLeft = startLeft - dx; e.preventDefault(); }
        });
        window.addEventListener('pointerup', function () {
            if (!down) return;
            down = false;
            row.classList.remove('is-dragging');
        });
        row.addEventListener('click', function (e) {
            if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
        }, true);
        row.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
})();

// Customizable checkout clip ([data-themes]): the pointer moves to the next
// style in the panel, presses it, and the checkout crossfades to that style.
// Runs only while on screen; with reduced motion it stays on the first style.
(function () {
    document.querySelectorAll('[data-themes]').forEach(function (box) {
        const opts = Array.from(box.querySelectorAll('.case-theme-opt'));
        const shots = Array.from(box.querySelectorAll('.case-theme-shot'));
        const cursor = box.querySelector('.case-theme-cursor');
        const panel = box.querySelector('.case-theme-panel');
        if (!opts.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let i = 0, timers = [], running = false, inView = false;
        function aim(n) {
            const p = panel.getBoundingClientRect(), o = opts[n].getBoundingClientRect();
            cursor.style.setProperty('--cx', ((o.left + o.width * 0.72 - p.left) / p.width * 100) + '%');
            cursor.style.setProperty('--cy', ((o.top + o.height / 2 - p.top) / p.height * 100) + '%');
        }
        function pick(n) {
            opts.forEach(function (o, k) { o.classList.toggle('is-on', k === n); });
            shots.forEach(function (s, k) { s.classList.toggle('is-on', k === n); });
        }
        function step() {
            const n = (i + 1) % opts.length;
            aim(n);
            timers.push(setTimeout(function () { cursor.classList.add('is-press'); }, 750));
            timers.push(setTimeout(function () { cursor.classList.remove('is-press'); pick(n); i = n; }, 900));
            timers.push(setTimeout(function () { if (running) step(); }, 3000));
        }
        function play() { if (running) return; running = true; aim(i); timers.push(setTimeout(step, 1600)); }
        function pause() { running = false; timers.forEach(clearTimeout); timers = []; }
        new IntersectionObserver(function (e) {
            inView = e[0].isIntersecting;
            if (inView && !document.hidden) play(); else pause();
        }, { threshold: 0.3 }).observe(box);
        document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else if (inView) play(); });
    });
})();
