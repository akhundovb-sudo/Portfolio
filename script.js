
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
                // Only a drag brings a print to the top; a click opens it and
                // it comes back to its own place in the fan.
                item.style.zIndex = ++top;
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

    // The print on the desk is cropped (one size for all); the large one is
    // the whole photo. Over the flight its height eases between the two,
    // cropped from the centre, so it leaves and lands as the same print.
    function crop(card, item, opening) {
        if (reduce.matches || !card.animate) return;
        const small = item.querySelector('img');
        const big = card.querySelector('img');
        const ws = small.offsetWidth, w = big.offsetWidth, h = big.offsetHeight;
        if (!ws || !w || !h) return;
        const hc = w * small.offsetHeight / ws;
        if (Math.abs(hc - h) < 1) return;
        big.style.width = w + 'px';
        big.style.maxHeight = 'none';
        big.style.objectFit = 'cover';
        const frames = [{ height: h + 'px' }, { height: hc + 'px' }];
        if (opening) frames.reverse();
        const a = big.animate(frames, { duration: 600, easing: SPRING, fill: opening ? 'none' : 'forwards' });
        if (opening) a.onfinish = function () {
            big.style.width = big.style.maxHeight = big.style.objectFit = '';
        };
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
            '<span class="desk-lightbox-hint">Click anywhere or press Esc</span>' +
            // A cross for phones, where there is no Esc (the click on the
            // backdrop closes it, so the button needs no handler of its own).
            '<button type="button" class="desk-lightbox-close" aria-label="Close"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>';
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
            crop(card, item, true);
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
            crop(card, item, false);
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
            else if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); togglePause(); }
        });
    }

    function shot() { return slides[index].firstChild; }
    // A clip on show pauses and resumes on a tap (one that is not the
    // first half of a double tap) or on Space.
    let pendingTap = 0;
    function togglePause() {
        const c = shot();
        if (!c || !c.caseFreeze) return;
        if (c.classList.contains('is-frozen')) c.caseThaw(); else c.caseFreeze();
    }

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
                clearTimeout(pendingTap);
                zoomAt(e.clientX, e.clientY, s > 1 ? 1 : 2.5, true);
                lastTap = 0;
            } else {
                lastTap = now; lastTapX = e.clientX; lastTapY = e.clientY;
                const c = shot();
                if (c && c.caseFreeze && c.contains(e.target)) pendingTap = setTimeout(togglePause, 300);
            }
        }
        mode = null; start = null;
    }

    covers.forEach(function (cover) {
        cover.addEventListener('click', function (e) {
            if (!mobile.matches) return;
            const phone = e.target.closest('.case-phone, .case-browser, .case-stage--cards, .case-terminal');
            if (!phone) return;
            // Every screen on the page, in order, so a swipe goes on to the
            // next section; a theme clip counts once (its first style).
            const imgs = Array.from(document.querySelectorAll('.case-cover--phones .case-browser-shot, .case-cover--phones .case-theme-shot:first-child, .case-cover--phones .case-terminal, .case-cover--phones .case-phone-screen img:not(.case-flow-layer)'));
            if (!imgs.length) return;
            open(imgs, Math.max(0, imgs.indexOf(phone.matches('img') ? phone : (phone.querySelector('.case-theme-shot') || phone.querySelector('img')))));
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
// A clip's timeline that can be frozen and resumed where it stopped
// (the full-screen viewers pause a clip on click or Space).
window.caseClock = function (pad) {
    let items = [], frozenAt = 0;
    function fire(it) {
        it.id = setTimeout(function () { it.done = true; it.fn(); }, Math.max(0, it.due - performance.now()));
    }
    pad.caseFreeze = function () {
        if (frozenAt) return;
        frozenAt = performance.now();
        items.forEach(function (it) { clearTimeout(it.id); });
        pad.classList.add('is-frozen');
        const svg = pad.querySelector('svg'); if (svg && svg.pauseAnimations) svg.pauseAnimations();
    };
    pad.caseThaw = function () {
        if (!frozenAt) return;
        const d = performance.now() - frozenAt;
        frozenAt = 0;
        items = items.filter(function (it) { return !it.done; });
        items.forEach(function (it) { it.due += d; fire(it); });
        pad.classList.remove('is-frozen');
        const svg = pad.querySelector('svg'); if (svg && svg.unpauseAnimations) svg.unpauseAnimations();
    };
    return {
        at: function (ms, fn) {
            const it = { due: performance.now() + ms, fn: fn };
            items.push(it);
            if (!frozenAt) fire(it);
        },
        clear: function () { items.forEach(function (it) { clearTimeout(it.id); }); items = []; },
        prune: function () { items = items.filter(function (it) { return !it.done; }); }
    };
};

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
        let running = false;
        const clock = window.caseClock(pad);
        function at(ms, fn) { clock.at(ms, fn); }
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
            clock.prune();
            let t = 900;
            code.forEach(function (d, n) { at(t, function () { press(d, n); }); t += 520; });
            at(t + 150, function () { spin.classList.add('is-on'); });
            at(t + 2100, reset);
            at(t + 2900, function () { if (running) cycle(); });
        }
        function play() { if (running) return; running = true; reset(); cycle(); }
        function pause() { running = false; clock.clear(); }
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
        if (img && img.classList && img.classList.contains('case-theme-shot')) {
            const themes = img.closest('.case-theme-stage').cloneNode(true);
            const shots = themes.querySelectorAll('.case-theme-shot');
            shots.forEach(function (sh, k) { sh.classList.toggle('is-on', k === 0); sh.removeAttribute('loading'); });
            return themes;
        }
        const pad = img && img.closest && img.closest('[data-passcode], [data-flow]');
        if (!pad || !(pad.classList.contains('case-pass') || pad.classList.contains('case-stage'))) return null;
        const copy = pad.cloneNode(true);
        delete copy.dataset.passInit;
        const base = pad.querySelector('.case-browser-shot');
        if (base && base.getAttribute('height')) copy.style.setProperty('--ar', base.getAttribute('width') / base.getAttribute('height'));
        return copy;
    };
    window.initCasePass = function (pad) {
        // A copy of the theme clip: the styles crossfade in turn while it is
        // on the page (it stops once the viewer drops it).
        if (pad.classList.contains('case-theme-stage')) {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const shots = Array.from(pad.querySelectorAll('.case-theme-shot'));
            let n = 0;
            pad.caseFreeze = function () { pad.classList.add('is-frozen'); };
            pad.caseThaw = function () { pad.classList.remove('is-frozen'); };
            const t = setInterval(function () {
                if (!pad.isConnected) { clearInterval(t); return; }
                if (pad.classList.contains('is-frozen')) return;
                n = (n + 1) % shots.length;
                shots.forEach(function (sh, k) { sh.classList.toggle('is-on', k === n); });
            }, 2600);
            return;
        }
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
        // Browser clips open as their still (data-full), so match on that too.
        const full = function (i) { return i.dataset.full ? new URL(i.dataset.full, location.href).href : i.src; };
        const src = Array.from(document.querySelectorAll('.case-pass > img:not(.case-flow-layer), .case-stage[data-flow] > .case-browser-shot, .case-theme-shot:first-child')).find(function (i) { return full(i) === img.src; });
        const copy = src && window.caseClipFor && window.caseClipFor(src);
        if (!copy) return;
        clip = copy;
        clip.classList.add('case-pass--viewer');
        img.parentNode.appendChild(clip);
        img.style.visibility = 'hidden';
        window.initCasePass(clip);
        clip.addEventListener('click', function (e) { e.stopPropagation(); toggle(clip); });
    }
    function toggle(c) {
        if (!c || !c.caseFreeze) return;
        if (c.classList.contains('is-frozen')) c.caseThaw(); else c.caseFreeze();
    }
    // Space pauses or resumes the clip on show.
    document.addEventListener('keydown', function (e) {
        if ((e.key !== ' ' && e.code !== 'Space') || !clip || !viewer.classList.contains('active')) return;
        e.preventDefault();
        toggle(clip);
    });
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
        let running = false;
        const clock = window.caseClock(pad);
        function at(ms, fn) { clock.at(ms, fn); }
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
        } else if (pad.dataset.flow === 'seq') {
            // A scripted run of whole screens (Finharbor Buy and Send): the
            // script is "ms command args | ...". push: a screen slides in from
            // the right and the rest step back; fade: a state crossfades in;
            // sheet / unsheet: a bottom sheet over a dim; swap: one sheet goes
            // down and the next comes up over the same dim; scroll: a tall
            // screen moves up by n cqw; on: a part (a code dot) shows; tap.
            const layers = Array.from(pad.querySelectorAll('[data-part]'));
            const base = pad.querySelector(':scope > img');
            const shown = [];
            const show = function (el) { if (shown.indexOf(el) === -1) shown.push(el); };
            const steps = (pad.dataset.script || '').split('|').map(function (t) { return t.trim().split(/\s+/); }).filter(function (t) { return t.length > 1; });
            const run = {
                tap: function (a) { press(+a[0], +a[1]); },
                push: function (a) {
                    const el = part(a[0]);
                    [base].concat(shown).forEach(function (e) { e.classList.add('is-back'); });
                    el.classList.add('is-in'); show(el);
                },
                fade: function (a) { const el = part(a[0]); el.classList.add('is-in'); show(el); },
                sheet: function (a) { const el = part(a[0]); el.classList.add('is-dim', 'is-up'); show(el); },
                unsheet: function (a) { part(a[0]).classList.remove('is-dim', 'is-up'); },
                swap: function (a) {
                    const from = part(a[0]), to = part(a[1]);
                    from.classList.remove('is-up');
                    to.classList.add('is-cut', 'is-dim'); from.classList.add('is-cut'); from.classList.remove('is-dim');
                    void to.offsetWidth;
                    to.classList.remove('is-cut'); from.classList.remove('is-cut');
                    show(to);
                    setTimeout(function () { to.classList.add('is-up'); }, 260);
                },
                scroll: function (a) { part(a[0]).style.setProperty('--sy', a[1]); },
                on: function (a) { const el = part(a[0]); el.classList.add('is-on'); show(el); },
                off: function (a) { part(a[0]).classList.remove('is-on'); },
                cls: function (a) { part(a[0]).classList.add(a[1]); }
            };
            reset = function () {
                pad.classList.add('is-instant');
                base.classList.remove('is-back');
                layers.forEach(function (e) { e.classList.remove('is-in', 'is-back', 'is-dim', 'is-up', 'is-on', 'is-cut', 'is-ok', 'is-scan'); e.style.removeProperty('--sy'); });
                shown.length = 0;
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                steps.forEach(function (t) {
                    const fn = run[t[1]];
                    if (fn) at(+t[0], function () { fn(t.slice(2)); });
                });
            };
            length = +pad.dataset.length || 8000;
        } else if (pad.dataset.flow === 'fhscroll') {
            // Finharbor mobile home: a finger flicks down the page in three
            // swipes (accounts, balances, last transactions), then one long
            // swipe back to the top. --sy is the scroll in cqw of the screen.
            const swipe = function (ms, from, to, sy) {
                at(ms, function () { hold(50, from); });
                at(ms + 120, function () { place(50, to); pad.style.setProperty('--sy', sy); });
                at(ms + 760, lift);
            };
            reset = function () {
                pad.classList.add('is-instant');
                pad.style.setProperty('--sy', 0);
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                swipe(1200, 72, 44, 40);
                swipe(3100, 72, 44, 78);
                swipe(5000, 72, 44, 111);
                swipe(7600, 30, 80, 0);
            };
            length = 10200;
        } else if (pad.dataset.flow === 'paycard') {
            // Pay by card: open row 1's menu, delete the card (rows slide up),
            // then "Try new card" and the details type in.
            const row = part('row'), rowopen = part('rowopen'), lower = part('lower'), form = part('form');
            const typed = ['num', 'exp', 'cvv', 'chip'].map(part);
            const ph = ['phnum', 'phexp', 'phcvv'].map(part), toast = part('toast');
            reset = function () {
                ph.forEach(function (e) { e.classList.remove('is-on', 'is-typed'); });
                toast.classList.remove('is-on');
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
                at(2500, function () { toast.classList.add('is-on'); });
                at(2400, function () { lower.classList.add('is-up'); form.classList.add('is-up'); });
                at(3600, function () { press(29.52, 51.12); });
                at(3750, function () { lower.classList.add('is-gone'); form.classList.add('is-on'); typed.forEach(function (e) { e.classList.add('is-on'); }); ph.forEach(function (e) { e.classList.add('is-on'); }); toast.classList.remove('is-on'); });
                at(4500, function () { typed[0].classList.add('is-typed'); ph[0].classList.add('is-typed'); });
                // The Mastercard mark shows once the sixth digit is in.
                at(4950, function () { typed[3].classList.add('is-typed'); });
                at(5800, function () { typed[1].style.setProperty('--t', '380ms'); typed[1].classList.add('is-typed'); ph[1].classList.add('is-typed'); });
                at(6350, function () { typed[2].style.setProperty('--t', '320ms'); typed[2].classList.add('is-typed'); ph[2].classList.add('is-typed'); });
            };
            length = 8200;
        } else if (pad.dataset.flow === 'postx') {
            // Transactions: a row opens its details from the right, the menu
            // raises the actions sheet over a dim, then it all goes back.
            const details = part('details'), dim = part('dim'), sheet = part('sheet');
            reset = function () {
                pad.classList.add('is-instant');
                [details, dim, sheet].forEach(function (e) { e.classList.remove('is-on'); });
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                at(1300, function () { press(49.65, 40.4); });
                at(1450, function () { details.classList.add('is-on'); });
                at(3400, function () { press(88.1, 16.25); });
                at(3550, function () { dim.classList.add('is-on'); sheet.classList.add('is-on'); });
                at(6400, function () { press(49.65, 40.0); });
                at(6550, function () { dim.classList.remove('is-on'); sheet.classList.remove('is-on'); });
            };
            length = 8600;
        } else if (pad.dataset.flow === 'posreports') {
            // Reports: the screen scrolls down to the amounts and back up.
            const body = part('body');
            reset = function () {
                pad.classList.add('is-instant');
                body.classList.remove('is-down');
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                at(1600, function () { body.classList.add('is-down'); });
                at(5600, function () { body.classList.remove('is-down'); });
            };
            length = 8800;
        } else if (pad.dataset.flow === 'posale') {
            // POS sale: £0.00, the keys light as they are pressed and the
            // calculator adds two amounts, = gives the total; Continue pushes
            // the summary in from the right, Proceed Payment drops the tap to
            // pay screen from the top (the card floats, contactless waves).
            const amount = part('amount'), s3 = part('s3'), s4 = part('s4'), key = part('key');
            const dots = ['d0', 'd1', 'd2', 'd3'].map(part);
            // Key cells in % of the device: digits 3 x 4, the operators row.
            const cols = [[5.46, 29.69], [35.15, 29.53], [64.68, 29.69]];
            const rows = [[43.25, 8.75], [52.0, 8.83], [60.83, 8.84], [69.67, 8.83]];
            const at3 = { '1': [0, 0], '2': [1, 0], '3': [2, 0], '4': [0, 1], '5': [1, 1], '6': [2, 1], '7': [0, 2], '8': [1, 2], '9': [2, 2], '.': [0, 3], '0': [1, 3] };
            const ops = { '+': 0, '-': 1, '×': 2, '÷': 3, '=': 4 };
            const hit = function (k) {
                let x, y, w, h;
                if (k in ops) { x = 5.46 + ops[k] * 17.79; w = 17.79; y = 38.2; h = 5.0; }
                else { const c = cols[at3[k][0]], r = rows[at3[k][1]]; x = c[0]; w = c[1]; y = r[0]; h = r[1]; }
                key.style.setProperty('--x', x); key.style.setProperty('--y', y);
                key.style.setProperty('--w', w); key.style.setProperty('--h', h);
                key.classList.remove('is-on'); void key.offsetWidth; key.classList.add('is-on');
                press(x + w / 2, y + h / 2);
            };
            // The amount, shrunk to fit when the sum is long; the result of a
            // sum shows faint until = is pressed.
            const show = function (txt, res) {
                amount.innerHTML = '';
                amount.appendChild(document.createTextNode(txt));
                if (res) { const r = document.createElement('span'); r.className = 'case-term-res'; r.textContent = res; amount.appendChild(r); }
                const len = txt.length + (res ? res.length : 0);
                amount.style.fontSize = Math.min(12.4, 78 / (len * 0.6)) + 'cqw';
            };
            reset = function () {
                pad.classList.add('is-instant');
                show('£0.00');
                s3.classList.remove('is-on'); s4.classList.remove('is-on'); key.classList.remove('is-on');
                dots.forEach(function (d) { d.classList.remove('is-on'); });
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            const seq = [
                ['1', '£1'], ['0', '£10'], ['0', '£100'], ['0', '£1,000'],
                ['+', '1,000 +'], ['2', '1,000 + 2 ', '= £1,002'], ['3', '1,000 + 23 ', '= £1,023'], ['0', '1,000 + 230 ', '= £1,230'],
                ['=', '£1,230.00']
            ];
            cycle = function () {
                seq.forEach(function (st, k) {
                    const t = 1000 + k * 480 + (k >= 4 ? 250 : 0) + (k === 8 ? 350 : 0);
                    at(t, function () { hit(st[0]); });
                    at(t + 90, function () { show(st[1], st[2]); });
                });
                at(6300, function () { press(49.8, 83.5); });
                at(6420, function () { s3.classList.add('is-on'); });
                at(8400, function () { press(63.5, 91.5); });
                at(8520, function () { s4.classList.add('is-on'); });
                // The progress dots fill green one by one, each with a ripple.
                dots.forEach(function (d, k) { at(9000 + k * 380, function () { d.classList.add('is-on'); }); });
            };
            length = 13500;
        } else if (pad.dataset.flow === 'apps') {
            // Applications: View details slides the side panel in over a
            // dimmed list; the cross closes it.
            const dim = part('dim'), panel = part('panel');
            reset = function () {
                pad.classList.add('is-instant');
                dim.classList.remove('is-on'); panel.classList.remove('is-on');
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                at(1200, function () { press(94.1, 35.7); });
                at(1350, function () { dim.classList.add('is-on'); panel.classList.add('is-on'); });
                at(5200, function () { press(97.25, 5.6); });
                at(5350, function () { panel.classList.remove('is-on'); dim.classList.remove('is-on'); });
            };
            length = 7200;
        } else if (pad.dataset.flow === 'dashboard') {
            // The overview loads: grey skeletons give way to the figures and
            // the charts draw in, then the page holds still for a while.
            const sk = Array.from(pad.querySelectorAll('.case-skel'));
            const cv = Array.from(pad.querySelectorAll('.case-chart-cover'));
            const nums = Array.from(pad.querySelectorAll('.case-count'));
            const show = function (el, v) {
                const dec = +el.dataset.dec || 0;
                el.textContent = (el.dataset.pre || '') + v.toLocaleString('en-GB', { minimumFractionDigits: dec, maximumFractionDigits: dec });
            };
            // The figures run up from zero, fast and easing out.
            const count = function (el) {
                const to = +el.dataset.to;
                let t0 = performance.now(), last = t0;
                (function tick(now) {
                    if (pad.classList.contains('is-frozen')) { t0 += now - last; last = now; requestAnimationFrame(tick); return; }
                    last = now;
                    const k = Math.min(1, (now - t0) / 950);
                    show(el, to * (1 - Math.pow(1 - k, 3)));
                    if (k < 1 && el.isConnected) requestAnimationFrame(tick);
                })(t0);
            };
            reset = function () {
                pad.classList.add('is-instant');
                sk.forEach(function (e) { e.classList.remove('is-counting'); e.classList.add('is-on'); });
                nums.forEach(function (e) { e.classList.remove('is-on'); show(e, 0); });
                cv.forEach(function (e) { e.classList.remove('is-go'); e.classList.add('is-on'); });
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                at(700, function () {
                    sk.forEach(function (e) { e.classList.add('is-counting'); });
                    nums.forEach(function (e) { e.classList.add('is-on'); count(e); });
                });
                // Then the counters give way to the page's own figures.
                at(1800, function () {
                    nums.forEach(function (e) { e.classList.remove('is-on'); });
                    sk.forEach(function (e) { e.classList.remove('is-on'); });
                });
                cv.forEach(function (e, k) { at(900 + k * 150, function () { e.classList.add('is-go'); }); });
            };
            length = 10500;
        } else if (pad.dataset.flow === 'metrics') {
            // Metric Details: the date picker opens and applies, then the
            // data filter opens, is set and applies; each time the charts
            // draw again (white covers wipe, grow or sweep away).
            const cal = part('cal'), f1 = part('f1'), f2 = part('f2');
            const cs = ['cal2', 'cal3', 'cal4'].map(part), day = part('day'), dayBg = part('daybg'), range = part('range');
            const cv = ['cv1', 'cv2', 'cv3', 'cv4', 'cv5'].map(part);
            const cover = function () {
                pad.classList.add('is-instant');
                cv.forEach(function (e) { e.classList.remove('is-go'); e.classList.add('is-on'); });
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            const draw = function (t) {
                at(t, cover);
                cv.forEach(function (e, k) { at(t + 80 + k * 110, function () { e.classList.add('is-go'); }); });
            };
            reset = function () {
                pad.classList.add('is-instant');
                [cal, f1, f2].concat(cs).forEach(function (e) { e.classList.remove('is-on'); });
                // The button reads one day (Today) until the range is applied.
                [day, dayBg, range].forEach(function (e) { e.classList.add('is-on'); });
                range.classList.remove('is-wide');
                cv.forEach(function (e) { e.classList.remove('is-on', 'is-go'); });
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                at(900, function () { press(54.5, 10.86); });
                at(1050, function () { cal.classList.add('is-on'); });
                // It opens on Today; Custom, then the first and last day.
                at(2300, function () { press(26.0, 38.6); });
                at(2420, function () { cs[0].classList.add('is-on'); });
                at(3200, function () { press(41.5, 21.05); });
                at(3320, function () { cs[1].classList.add('is-on'); });
                at(4000, function () { press(41.5, 33.98); });
                at(4120, function () { cs[2].classList.add('is-on'); });
                at(5000, function () { press(55.5, 42.8); });
                at(5150, function () {
                    cal.classList.remove('is-on'); cs.forEach(function (e) { e.classList.remove('is-on'); });
                    // The button widens from one day to the range.
                    day.classList.remove('is-on'); range.classList.add('is-wide');
                });
                at(5800, function () { dayBg.classList.remove('is-on'); range.classList.remove('is-on'); });
                draw(5300);
                at(7900, function () { press(66.8, 10.86); });
                at(8050, function () { f1.classList.add('is-on'); });
                at(9200, function () { press(55.4, 38.6); });
                at(9350, function () { f2.classList.add('is-on'); });
                at(10600, function () { press(68.3, 45.0); });
                at(10750, function () { f1.classList.remove('is-on'); f2.classList.remove('is-on'); });
                draw(10900);
            };
            length = 14100;
        } else if (pad.dataset.flow === 'charthover') {
            // Chart cards: the pointer moves over each chart in turn and its
            // hover state (tooltip, highlighted point or bar) shows.
            const ptr = pad.querySelector('.case-chart-pointer');
            const hv = ['h1', 'h2', 'h3', 'h4', 'h5'].map(part);
            const route = [[0, 27.52, 17.38], [1, 63.14, 25.95], [2, 22.15, 79.76], [3, 52.99, 65.48], [4, 81.0, 65.48]];
            const aim = function (x, y) { ptr.style.setProperty('--cx', x + '%'); ptr.style.setProperty('--cy', y + '%'); };
            reset = function () {
                pad.classList.add('is-instant');
                hv.forEach(function (e) { e.classList.remove('is-on'); });
                aim(50, 50);
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                route.forEach(function (r, k) {
                    const t = 500 + k * 2300;
                    at(t, function () { aim(r[1], r[2]); });
                    at(t + 650, function () { hv[r[0]].classList.add('is-on'); });
                    at(t + 2100, function () { hv[r[0]].classList.remove('is-on'); });
                });
            };
            length = 500 + 5 * 2300 + 300;
        } else if (pad.dataset.flow === 'personal') {
            // Personal info: "Change info" opens the modal, the country
            // dropdown opens, the search types "An" and filters the list,
            // the dropdown closes and Save changes closes the modal.
            const dim = part('dim'), p = ['p1', 'p2', 'p3', 'p4'].map(part);
            const show = function (n) { p.forEach(function (e, i) { if (i) e.classList.toggle('is-on', i === n); }); };
            reset = function () {
                pad.classList.add('is-instant');
                dim.classList.remove('is-on'); p.forEach(function (e) { e.classList.remove('is-on'); });
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                at(900, function () { press(44.4, 68); });
                at(1050, function () { dim.classList.add('is-on'); p[0].classList.add('is-on'); });
                at(2400, function () { press(49.4, 35.7); });
                at(2550, function () { show(1); });
                at(3700, function () { press(48.2, 41.2); });
                at(4300, function () { show(2); });
                at(5800, function () { show(3); });
                at(6300, function () { show(-1); });
                at(7300, function () { press(48.5, 78.6); });
                at(7450, function () { p[0].classList.remove('is-on'); dim.classList.remove('is-on'); });
            };
            length = 9000;
        } else if (pad.dataset.flow === 'bank' || pad.dataset.flow === 'crypto') {
            // Screen sequences: each step taps (or points), then the next
            // screen crossfades in over the last. [ms, tap x, tap y, screen].
            const seq = Array.from(pad.querySelectorAll('.case-stage-seq'));
            const steps = pad.dataset.flow === 'bank'
                ? [[900, 28.8, 36.9, 2], [2300, null, null, 3], [3500, 21.3, 42.5, 4], [4900, 79.3, 36.6, 5], [7600, null, null, 6]]
                : [[900, 29.3, 36.9, 2], [2400, 17.5, 48.6, 3], [4300, 79.0, 36.6, 4]];
            reset = function () {
                pad.classList.add('is-instant');
                seq.forEach(function (e) { e.classList.remove('is-on'); });
                tap.className = 'case-pass-tap';
                void pad.offsetWidth;
                pad.classList.remove('is-instant');
            };
            cycle = function () {
                steps.forEach(function (st) {
                    if (st[1] !== null) at(st[0], function () { press(st[1], st[2]); });
                    at(st[0] + 150, function () { seq[st[3] - 2].classList.add('is-on'); });
                });
            };
            length = pad.dataset.flow === 'bank' ? 10200 : 8200;
        } else if (pad.dataset.flow === 'otp') {
            // Purchase authentication: a wrong SMS code is keyed in and turns
            // red, the fields clear and the code is resent, the right code
            // lights Submit, and Submit spins.
            const boxes = ['b0', 'b1', 'b2', 'b3', 'b4', 'b5'].map(part);
            const note = part('note'), submit = part('submit');
            const timer = function (s) { note.className = 'otp-note'; note.innerHTML = 'Code not received? You\'ll be able to resend in 00:' + (s < 10 ? '0' : '') + s; };
            const focus = function (k) { boxes.forEach(function (b, n) { b.classList.toggle('is-focus', n === k); }); };
            const type = function (t, digits) {
                digits.forEach(function (d, k) {
                    at(t + k * 260, function () { boxes[k].textContent = d; focus(k + 1 < boxes.length ? k + 1 : -1); });
                });
            };
            reset = function () {
                boxes.forEach(function (b) { b.textContent = ''; b.classList.remove('is-error', 'is-focus'); });
                submit.classList.remove('is-on', 'is-busy');
                focus(0); timer(44);
                tap.className = 'case-pass-tap';
            };
            cycle = function () {
                [43, 42, 41, 40].forEach(function (s, k) { at(1000 + k * 1000, function () { if (note.classList.length === 1) timer(s); }); });
                type(800, ['0', '0', '0', '0', '0', '0']);
                at(2500, function () {
                    boxes.forEach(function (b) { b.classList.add('is-error'); });
                    note.className = 'otp-note is-error';
                    note.textContent = 'The code you have entered is incorrect. Please try again.';
                });
                at(4300, function () {
                    boxes.forEach(function (b) { b.textContent = ''; b.classList.remove('is-error'); });
                    focus(0);
                    note.className = 'otp-note is-link';
                    note.innerHTML = '<i aria-hidden="true"></i>Resend SMS code';
                });
                at(5300, function () { press(49.8, 62.6); });
                at(5450, function () { timer(59); });
                [58, 57, 56, 55].forEach(function (s, k) { at(6450 + k * 1000, function () { if (note.classList.length === 1) timer(s); }); });
                type(6000, ['4', '8', '2', '9', '1', '5']);
                at(7700, function () { submit.classList.add('is-on'); });
                at(8600, function () { press(50, 82.4); });
                at(8750, function () { submit.classList.add('is-busy'); });
            };
            length = 11200;
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
        function loop() { clock.prune(); reset(); cycle(); at(length, function () { if (running) loop(); }); }
        // The checkout's blue "Order expiration time": a live countdown over
        // the screenshot's 15:00 on the browser clips that show it.
        let ticker = null, left = 900, shown = null;
        function startTimer() {
            // Only the MyGuava Payment checkout screens carry that timer.
            if (ticker || ['paycard', 'wallet', 'bank', 'crypto', 'personal'].indexOf(pad.dataset.flow) === -1) return;
            if (!pad.matches('.case-stage[data-flow]')) return;
            shown = pad.querySelector(':scope > .case-timer');
            if (!shown) {
                shown = document.createElement('span');
                shown.className = 'case-timer';
                shown.setAttribute('aria-hidden', 'true');
                pad.appendChild(shown);
            }
            const paint = function () {
                shown.textContent = Math.floor(left / 60) + ':' + ('0' + (left % 60)).slice(-2);
                shown.classList.toggle('is-dim', !!pad.querySelector('.case-stage-dim.is-on, [data-dim].is-on'));
                shown.classList.add('is-on');
            };
            paint();
            ticker = setInterval(function () {
                if (pad.classList.contains('is-frozen')) return;
                left = left > 1 ? left - 1 : 900;
                paint();
            }, 1000);
        }
        function stopTimer() { clearInterval(ticker); ticker = null; }
        function play() { if (running) return; running = true; startTimer(); loop(); }
        function pause() { running = false; clock.clear(); stopTimer(); }
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


// Design system buttons ([data-ds-buttons]): the large button steps through
// the corner radii and the colours of the set, pressing at each change; the
// matching button in the set is picked out. Runs while on screen.
(function () {
    document.querySelectorAll('[data-ds-buttons]').forEach(function (box) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const big = box.querySelector('[data-part="big"]');
        const radius = box.querySelector('[data-part="radius"]');
        const swatch = box.querySelector('[data-part="swatch"]');
        const cells = Array.from(box.querySelectorAll('.ds-btn-grid .ds-btn'));
        const colours = [['#BAF400', 1], ['#6BE3D7', 1], ['#1B74BD', 0], ['#5B44EB', 0], ['#0D0D0D', 0]];
        const radii = ['None', 'Medium', 'Large', 'Full'];
        const steps = [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [4, 2], [3, 1], [2, 0], [1, 1]];
        let i = 0, timer = null;
        function show(k) {
            const c = steps[k][0], r = steps[k][1];
            big.classList.add('is-press');
            setTimeout(function () { big.classList.remove('is-press'); }, 160);
            big.style.setProperty('--bg', colours[c][0]);
            big.style.setProperty('--r', 'var(--r' + r + ')');
            big.classList.toggle('is-light', !!colours[c][1]);
            radius.textContent = 'Radius ' + radii[r];
            swatch.lastChild.textContent = colours[c][0];
            swatch.querySelector('i').style.background = colours[c][0];
            cells.forEach(function (el) { el.classList.toggle('is-pick', +el.dataset.c === c && +el.dataset.r === r); });
        }
        function play() {
            if (timer) return;
            box.classList.add('is-live');
            show(i);
            timer = setInterval(function () { i = (i + 1) % steps.length; show(i); }, 1500);
        }
        function pause() { clearInterval(timer); timer = null; }
        new IntersectionObserver(function (e) {
            if (e[0].isIntersecting && !document.hidden) play(); else pause();
        }, { threshold: 0.3 }).observe(box);
        document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });
    });
})();

// Design system Storybook ([data-storybook]): a component list, a live
// canvas and the Controls panel. Every control re-renders the component;
// the component itself can be used (pressed, typed into, checked, closed).
(function () {
    const root = document.querySelector('[data-storybook]');
    if (!root) return;
    const canvas = root.querySelector('.sb-canvas');
    const panel = root.querySelector('.sb-controls');
    const ICON = {
        plus: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        alert: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v6M12 16.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        help: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.3M12 16.6v.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        card: '<span class="sb-mc" aria-hidden="true"><i></i><i></i></span>',
        app: '<span class="sb-app" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'
    };
    const esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

    // name: [[key, type, options|default, default], ...] and a render.
    const COMPS = {
        button: {
            controls: [
                ['Style', 'select', ['primary', 'secondary', 'outline', 'destructive'], 'primary'],
                ['Size', 'select', ['small', 'medium', 'large'], 'large'],
                ['State', 'select', ['default', 'hover', 'pressed', 'focus', 'disabled', 'loading'], 'default'],
                ['Radius', 'select', ['none', 'small', 'medium', 'large', 'full'], 'medium'],
                ['Label', 'text', 'Button'],
                ['Icon', 'select', ['none', 'leading', 'trailing'], 'none']
            ],
            render: function (o) {
                const inner = o.State === 'loading'
                    ? '<span class="sb-spin" aria-hidden="true"></span>'
                    : (o.Icon === 'leading' ? ICON.plus : '') + '<span>' + esc(o.Label || 'Button') + '</span>' + (o.Icon === 'trailing' ? ICON.plus : '');
                return '<button type="button" class="sb-btn sb-btn--' + o.Style + ' sb-btn--' + o.Size + ' sb-r--' + o.Radius + ' is-' + o.State + '"' + (o.State === 'disabled' ? ' disabled' : '') + '>' + inner + '</button>';
            }
        },
        alert: {
            controls: [
                ['Type', 'select', ['info', 'success', 'warning', 'danger'], 'info'],
                ['Text', 'text', 'Description'],
                ['Show icon', 'toggle', true],
                ['Dismissible', 'toggle', false]
            ],
            render: function (o) {
                const icon = { info: ICON.info, success: ICON.check, warning: ICON.alert, danger: ICON.alert }[o.Type];
                return '<div class="sb-alert sb-alert--' + o.Type + '" role="status">' + (o['Show icon'] ? icon : '') + '<span>' + esc(o.Text) + '</span>' +
                    (o.Dismissible ? '<button type="button" class="sb-alert-x" aria-label="Dismiss">' + ICON.close + '</button>' : '') + '</div>';
            }
        },
        input: {
            controls: [
                ['Show label', 'toggle', true],
                ['Label', 'text', 'Label'],
                ['Placeholder', 'text', 'Placeholder text'],
                ['Leading', 'select', ['none', 'logo'], 'none'],
                ['Trailing', 'select', ['none', 'help', 'card'], 'help'],
                ['State', 'select', ['rest', 'hover', 'active', 'filled', 'focus', 'error', 'disabled'], 'rest']
            ],
            render: function (o) {
                const filled = o.State === 'filled' || o.State === 'focus';
                return '<label class="sb-field is-' + o.State + '">' + (o['Show label'] ? '<span class="sb-label">' + esc(o.Label) + '</span>' : '') +
                    '<span class="sb-input">' + (o.Leading === 'logo' ? ICON.app : '') +
                    '<input type="text" placeholder="' + esc(o.Placeholder) + '"' + (filled ? ' value="' + esc(o.Placeholder) + '"' : '') + (o.State === 'disabled' ? ' disabled' : '') + '>' +
                    (o.State === 'error' ? ICON.alert : o.Trailing === 'help' ? ICON.help : o.Trailing === 'card' ? ICON.card : '') + '</span>' +
                    (o.State === 'error' ? '<span class="sb-help">Helper text</span>' : '') + '</label>';
            }
        },
        search: {
            controls: [
                ['Show label', 'toggle', true],
                ['Label', 'text', 'Label'],
                ['Placeholder', 'text', 'Placeholder text'],
                ['State', 'select', ['rest', 'hover', 'active', 'filled', 'focus', 'error', 'disabled'], 'rest']
            ],
            render: function (o) {
                const filled = o.State === 'filled';
                const clear = o.State === 'active' || o.State === 'filled';
                return '<label class="sb-field sb-field--search is-' + o.State + '">' + (o['Show label'] ? '<span class="sb-label">' + esc(o.Label) + '</span>' : '') +
                    '<span class="sb-input">' + ICON.search + '<input type="search" placeholder="' + esc(o.Placeholder) + '"' + (filled ? ' value="' + esc(o.Placeholder) + '"' : '') + (o.State === 'disabled' ? ' disabled' : '') + '>' +
                    (clear ? '<span class="sb-clear" aria-hidden="true">' + ICON.close + '</span>' : '') + '</span>' +
                    (o.State === 'error' ? '<span class="sb-help">Helper text</span>' : '') + '</label>';
            }
        },
        badge: {
            controls: [
                ['Type', 'select', ['neutral', 'success', 'warning', 'danger', 'info'], 'success'],
                ['Size', 'select', ['small', 'medium'], 'medium'],
                ['Text', 'text', 'Executed'],
                ['Dot', 'toggle', true]
            ],
            render: function (o) {
                return '<span class="sb-badge sb-badge--' + o.Type + ' sb-badge--' + o.Size + '">' + (o.Dot ? '<i aria-hidden="true"></i>' : '') + esc(o.Text) + '</span>';
            }
        },
        checkbox: {
            controls: [
                ['Checked', 'toggle', true],
                ['State', 'select', ['rest', 'hover', 'focus', 'disabled'], 'rest'],
                ['Label', 'text', 'Save the card for future payments']
            ],
            render: function (o) {
                return '<button type="button" role="checkbox" aria-checked="' + !!o.Checked + '" class="sb-check is-' + o.State + (o.Checked ? ' is-checked' : '') + '"' + (o.State === 'disabled' ? ' disabled' : '') + '><i aria-hidden="true">' + ICON.check + '</i><span>' + esc(o.Label) + '</span></button>';
            }
        },
        segmented: {
            controls: [
                ['Options', 'select', ['2', '3'], '3'],
                ['Selected', 'select', ['1', '2', '3'], '1'],
                ['Size', 'select', ['small', 'medium'], 'medium']
            ],
            render: function (o) {
                const names = ['All', 'POS', 'E-Comm'].slice(0, +o.Options);
                const sel = Math.min(+o.Selected, names.length) - 1;
                return '<div class="sb-seg sb-seg--' + o.Size + '" role="tablist">' + names.map(function (n, k) { return '<button type="button" role="tab" aria-selected="' + (k === sel) + '" class="sb-seg-item' + (k === sel ? ' is-on' : '') + '" data-seg="' + (k + 1) + '">' + n + '</button>'; }).join('') + '</div>';
            }
        },
        switch: {
            controls: [
                ['On', 'toggle', true],
                ['State', 'select', ['rest', 'hover', 'focus', 'disabled'], 'rest'],
                ['Label', 'text', 'Tips']
            ],
            render: function (o) {
                return '<button type="button" role="switch" aria-checked="' + !!o.On + '" class="sb-switch is-' + o.State + (o.On ? ' is-on' : '') + '"' + (o.State === 'disabled' ? ' disabled' : '') + '><span>' + esc(o.Label) + '</span><i aria-hidden="true"></i></button>';
            }
        },
        tabs: {
            controls: [
                ['Selected', 'select', ['Overview', 'POS', 'E-Commerce', 'Applications'], 'Overview'],
                ['Style', 'select', ['pill', 'underline'], 'pill']
            ],
            render: function (o) {
                return '<div class="sb-tabs sb-tabs--' + o.Style + '" role="tablist">' + ['Overview', 'POS', 'E-Commerce', 'Applications'].map(function (n) { return '<button type="button" role="tab" aria-selected="' + (n === o.Selected) + '" class="sb-tab' + (n === o.Selected ? ' is-on' : '') + '" data-tab="' + n + '">' + n + '</button>'; }).join('') + '</div>';
            }
        },
        tooltip: {
            controls: [
                ['Theme', 'select', ['dark', 'light'], 'dark'],
                ['Position', 'select', ['top center', 'top left', 'top right', 'down center', 'down left', 'down right'], 'top center'],
                ['Content', 'select', ['title + text', 'text'], 'title + text'],
                ['Title', 'text', 'Title'],
                ['Text', 'text', 'Tooltip']
            ],
            render: function (o) {
                const pos = o.Position.split(' ');
                const body = (o.Content === 'title + text' ? '<b>' + esc(o.Title) + '</b>' : '') + '<span>' + esc(o.Text) + '</span>';
                return '<span class="sb-tip-wrap sb-tip--' + pos[0] + ' sb-tip--' + pos[1] + '"><span class="sb-tip-anchor" aria-hidden="true">' + ICON.help + '</span>' +
                    '<span class="sb-tip sb-tip--' + o.Theme + '" role="tooltip">' + body + '</span></span>';
            }
        },
        radio: {
            controls: [
                ['Checked', 'toggle', true],
                ['State', 'select', ['rest', 'hover', 'focus', 'disabled'], 'rest'],
                ['Label', 'text', 'Pay by card']
            ],
            render: function (o) {
                return '<button type="button" role="radio" aria-checked="' + !!o.Checked + '" class="sb-radio is-' + o.State + (o.Checked ? ' is-checked' : '') + '"' + (o.State === 'disabled' ? ' disabled' : '') + '><i aria-hidden="true"></i><span>' + esc(o.Label) + '</span></button>';
            }
        }
    };

    let current = 'button';
    const values = {};
    Object.keys(COMPS).forEach(function (k) {
        values[k] = {};
        COMPS[k].controls.forEach(function (c) { values[k][c[0]] = c[1] === 'select' ? c[3] : c[2]; });
    });

    function drawControls() {
        const comp = COMPS[current], v = values[current];
        panel.innerHTML = comp.controls.map(function (c) {
                const id = 'sb-' + current + '-' + c[0].replace(/\s+/g, '-').toLowerCase();
                let field;
                if (c[1] === 'select') field = '<span class="sb-select"><select id="' + id + '" data-key="' + c[0] + '">' + c[2].map(function (op) { return '<option' + (op === v[c[0]] ? ' selected' : '') + '>' + op + '</option>'; }).join('') + '</select></span>';
                else if (c[1] === 'toggle') field = '<button type="button" role="switch" id="' + id + '" class="sb-toggle' + (v[c[0]] ? ' is-on' : '') + '" aria-checked="' + !!v[c[0]] + '" data-key="' + c[0] + '"><i></i></button>';
                else field = '<input class="sb-text" id="' + id + '" type="text" value="' + esc(v[c[0]]) + '" data-key="' + c[0] + '">';
                return '<div class="sb-row"><label for="' + id + '">' + c[0] + '</label>' + field + '</div>';
            }).join('');
    }

    function drawCanvas() {
        canvas.innerHTML = '<div class="sb-stage">' + COMPS[current].render(values[current]) + '</div>';
    }

    function set(key, val) {
        values[current][key] = val;
        drawCanvas();
    }

    panel.addEventListener('change', function (e) {
        const t = e.target;
        if (t.matches('select')) set(t.dataset.key, t.value);
    });
    panel.addEventListener('input', function (e) {
        const t = e.target;
        if (t.matches('.sb-text')) set(t.dataset.key, t.value);
    });
    panel.addEventListener('click', function (e) {
        const t = e.target.closest('.sb-toggle');
        if (!t) return;
        const on = !t.classList.contains('is-on');
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-checked', on);
        set(t.dataset.key, on);
    });

    // Using the component on the canvas.
    canvas.addEventListener('click', function (e) {
        const flip = function (sel, key) {
            const el = e.target.closest(sel);
            if (!el || el.disabled) return false;
            values[current][key] = !values[current][key];
            drawControls(); drawCanvas();
            return true;
        };
        if (flip('.sb-check', 'Checked') || flip('.sb-switch', 'On')) return;
        const seg = e.target.closest('.sb-seg-item');
        if (seg) { values.segmented.Selected = seg.dataset.seg; drawControls(); drawCanvas(); return; }
        const tab = e.target.closest('.sb-tab');
        if (tab) { values.tabs.Selected = tab.dataset.tab; drawControls(); drawCanvas(); return; }
        const radio = e.target.closest('.sb-radio');
        if (radio && !radio.disabled) {
            values.radio.Checked = !values.radio.Checked;
            drawControls(); drawCanvas();
            return;
        }
        if (e.target.closest('.sb-alert-x')) {
            canvas.querySelector('.sb-stage').innerHTML = '<button type="button" class="sb-restore">Show alert again</button>';
            return;
        }
        if (e.target.closest('.sb-restore')) { drawCanvas(); return; }
        const btn = e.target.closest('.sb-btn');
        if (btn && !btn.disabled && values.button.State !== 'loading') {
            // A press runs the loading state for a moment.
            const was = values.button.State;
            values.button.State = 'loading'; drawCanvas();
            setTimeout(function () { values.button.State = was; if (current === 'button') drawCanvas(); }, 900);
        }
    });

    root.querySelector('.sb-side').addEventListener('click', function (e) {
        const item = e.target.closest('.sb-item');
        if (!item) return;
        current = item.dataset.comp;
        root.querySelectorAll('.sb-item').forEach(function (i) { i.classList.toggle('is-on', i === item); });
        drawControls(); drawCanvas();
    });

    drawControls(); drawCanvas();
})();

// Outcome figures (.case-stats): when they come into view the numbers count
// up from zero (with their prefix and suffix: -30%, 60 sec, 30+) and the
// accent rules draw in.
(function () {
    document.querySelectorAll('.case-stats').forEach(function (box) {
        const nums = Array.from(box.querySelectorAll('b[data-count]'));
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const text = function (b, n) { return (b.dataset.pre || '') + n + (b.dataset.suf || ''); };
        function run() {
            box.classList.add('is-in');
            nums.forEach(function (b, k) {
                const to = +b.dataset.count;
                if (still) { b.textContent = text(b, to); return; }
                const t0 = performance.now() + k * 150;
                (function tick(now) {
                    const t = Math.max(0, Math.min(1, (now - t0) / 1100));
                    b.textContent = text(b, Math.round(to * (1 - Math.pow(1 - t, 3))));
                    if (t < 1) requestAnimationFrame(tick);
                })(performance.now());
            });
        }
        if (!('IntersectionObserver' in window)) { run(); return; }
        const io = new IntersectionObserver(function (e) {
            if (e[0].isIntersecting) { run(); io.disconnect(); }
        }, { threshold: 0.6 });
        io.observe(box);
    });
})();


// Habbi works card ([data-mascot]): on hover the mascot comes out from
// behind the phone in one second and raises its hand (no wave), and stays like that while the pointer is
// there; on leave it runs back fast and hides. The frames are one 12 x 6
// sprite (the blurred and four-finger frames 33-36 and 40-50 of the 80 are
// left out); the entrance ends on frame 51. Two layers crossfade a frame
// into the next by the fraction in between, so nothing steps.
(function () {
    const stage = document.querySelector('[data-mascot]');
    if (!stage) return;
    const card = stage.closest('.project-card');
    const [a, b] = stage.querySelectorAll('.project-mascot');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const END = 35, INTRO = 1, BACK = 120, FPS = 30;
    // Quick start easing into the clip's own 30 fps, so the hand rises at
    // its natural speed (the last frames) instead of crawling to a stop.
    const K = Math.min(1, FPS * INTRO / END);
    const curve = function (t) { return END * (K * t + (1 - K) * (1 - (1 - t) * (1 - t))); };
    const inverse = function (p) { let lo = 0, hi = 1; for (let n = 0; n < 20; n++) { const m = (lo + hi) / 2; if (curve(m) < p) lo = m; else hi = m; } return lo; };
    let p = -1, t = 0, dir = 0, raf = null, last = 0;
    function cell(el, f) {
        el.style.setProperty('--c', f % 12);
        el.style.setProperty('--r', Math.floor(f / 12));
    }
    function paint() {
        if (p < 0) { a.style.opacity = 0; b.style.opacity = 0; return; }
        const f = Math.floor(p), fr = p - f;
        cell(a, f); a.style.opacity = 1;
        if (f < END) { cell(b, f + 1); b.style.opacity = fr; } else b.style.opacity = 0;
    }
    function step(now) {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        if (dir > 0) { t = Math.min(1, t + dt / INTRO); p = curve(t); }
        else p -= dt * BACK;
        paint();
        if (dir < 0 && p < 0) { p = -1; paint(); raf = null; return; }
        if (dir > 0 && t >= 1) { raf = null; return; }
        raf = requestAnimationFrame(step);
    }
    function go(d) {
        dir = d;
        if (d > 0) { if (p < 0) p = 0; t = inverse(p); }
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    }
    card.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && fine.matches) go(1); });
    card.addEventListener('pointerleave', function () { if (p >= 0) go(-1); });
})();

// Remiton card (home): the purple globe with country flags flying round it
// on two slanted orbits, smaller and dimmer as they pass behind it. Each
// time the card comes into view it plays from the start: the flags circle
// for a moment, then the globe steps back and the phone rises in front.
(function () {
    const panel = document.querySelector('[data-remi]');
    if (!panel) return;
    const globe = panel.querySelector('.remi-globe');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const F = 'images/remiton/flag-';
    const ORBITS = [
        { rx: 150, ry: 42, rot: -14, speed: 0.5, flags: ['gb.svg', 'az.svg', 'br.svg', 'jp.svg', 'ch.svg'] },
        { rx: 132, ry: 58, rot: 26, speed: -0.38, flags: ['eu.png', 'ca.svg', 'es.svg', 'pl.svg', 'se.svg'] }
    ];
    ORBITS.forEach(function (o) {
        const ring = document.createElement('span');
        ring.className = 'remi-orbit';
        ring.style.cssText = 'left:' + -o.rx + 'px;top:' + -o.ry + 'px;width:' + 2 * o.rx + 'px;height:' + 2 * o.ry + 'px;transform:rotate(' + o.rot + 'deg)';
        globe.appendChild(ring);
        o.items = o.flags.map(function (f, i) {
            const img = document.createElement('img');
            img.className = 'remi-flag';
            img.src = F + f;
            img.alt = '';
            img.decoding = 'async';
            globe.appendChild(img);
            return { el: img, a: i * Math.PI * 2 / o.flags.length };
        });
    });

    function place(dt) {
        ORBITS.forEach(function (o) {
            const r = o.rot * Math.PI / 180, cr = Math.cos(r), sr = Math.sin(r);
            o.items.forEach(function (it) {
                it.a += dt * o.speed;
                const x = Math.cos(it.a) * o.rx, y = Math.sin(it.a) * o.ry;
                const depth = Math.sin(it.a);                 // > 0: in front of the globe
                const k = 0.7 + 0.3 * (depth + 1) / 2;
                it.el.style.transform = 'translate(' + (x * cr - y * sr).toFixed(1) + 'px,' + (x * sr + y * cr).toFixed(1) + 'px) scale(' + k.toFixed(3) + ')';
                it.el.style.zIndex = depth > 0 ? 2 : 0;
                it.el.style.filter = depth > 0 ? '' : 'brightness(' + (0.75 + 0.25 * (depth + 1)).toFixed(2) + ')';
            });
        });
    }
    place(0);

    let last = 0, raf = 0, timer = 0;

    function draw(now) {
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        place(dt);
        raf = requestAnimationFrame(draw);
    }

    function play() {
        panel.classList.remove('is-phone');
        clearTimeout(timer);
        if (reduce.matches) { draw(performance.now()); cancelAnimationFrame(raf); raf = 0; panel.classList.add('is-phone'); return; }
        if (!raf) { last = 0; raf = requestAnimationFrame(draw); }
        timer = setTimeout(function () { panel.classList.add('is-phone'); }, 2200);
    }
    function pause() {
        cancelAnimationFrame(raf); raf = 0;
        clearTimeout(timer);
        panel.classList.remove('is-phone');
    }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { e.isIntersecting ? play() : pause(); });
        }, { threshold: 0.35 }).observe(panel);
    } else play();
})();
