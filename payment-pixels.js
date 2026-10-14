// Payment works card: a few random neighbouring pixels exchange colours.
// Every displayed colour is sampled from the original image. Independent
// start times keep the rest of the picture still; the pattern loops exactly.
(function () {
    const canvas = document.querySelector('.project-payment-pixels');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const panel = canvas.parentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const PERIOD = 14000, COLS = 96, COUNT = 180, STEPS = 32;
    const events = [];
    let ready = false, visible = !('IntersectionObserver' in window);
    let frame = null, elapsed = 0, lastTick = 0, lastPaint = 0;
    let cellWidth = 0, cellHeight = 0;

    function tile(index, color) {
        const x = index % COLS, y = Math.floor(index / COLS);
        const left = Math.round(x * cellWidth), top = Math.round(y * cellHeight);
        ctx.fillStyle = color;
        ctx.fillRect(left, top,
            Math.round((x + 1) * cellWidth) - left,
            Math.round((y + 1) * cellHeight) - top);
    }

    function paint(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        events.forEach(function (event) {
            const local = (time - event.start + PERIOD) % PERIOD;
            if (local >= event.duration) return;
            const blend = 0.5 - 0.5 * Math.cos(local / event.duration * Math.PI * 2);
            const step = Math.round(blend * (STEPS - 1));
            if (step === 0) return;
            tile(event.a, event.path[step]);
            tile(event.b, event.path[STEPS - 1 - step]);
        });
    }

    function tick(now) {
        elapsed = (elapsed + Math.min(100, Math.max(0, now - lastTick))) % PERIOD;
        lastTick = now;
        if (now - lastPaint >= 1000 / 30) {
            paint(elapsed);
            lastPaint = now;
        }
        frame = requestAnimationFrame(tick);
    }

    function sync() {
        const play = ready && visible && !document.hidden && !reduce.matches;
        if (play && frame === null) {
            lastTick = performance.now();
            lastPaint = 0;
            frame = requestAnimationFrame(tick);
        } else if (!play && frame !== null) {
            cancelAnimationFrame(frame);
            frame = null;
        }
    }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            sync();
        }).observe(panel);
    }
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener('change', sync);

    const image = new Image();
    image.onload = function () {
        const rows = Math.max(1, Math.round(COLS * image.naturalHeight / image.naturalWidth));
        const sample = document.createElement('canvas');
        sample.width = COLS;
        sample.height = rows;
        const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
        if (!sampleCtx) return;
        sampleCtx.imageSmoothingEnabled = false;
        sampleCtx.drawImage(image, 0, 0, COLS, rows);
        let data;
        try {
            data = sampleCtx.getImageData(0, 0, COLS, rows).data;
        } catch (_) {
            return; // The original CSS background remains visible.
        }

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        cellWidth = canvas.width / COLS;
        cellHeight = canvas.height / rows;
        const colors = [], unique = new Map();
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const key = r * 65536 + g * 256 + b;
            if (!unique.has(key)) unique.set(key, { r: r, g: g, b: b, css: 'rgb(' + r + ',' + g + ',' + b + ')' });
            colors.push(unique.get(key));
        }
        const palette = Array.from(unique.values());
        // Quantize the transition to actual image colours. No hue rotation,
        // invented colours, or full-image recolouring is involved.
        function pathBetween(a, b) {
            const path = [a.css];
            for (let step = 1; step < STEPS - 1; step++) {
                const t = step / (STEPS - 1);
                const r = a.r + (b.r - a.r) * t;
                const g = a.g + (b.g - a.g) * t;
                const blue = a.b + (b.b - a.b) * t;
                let best = a, distance = Infinity;
                palette.forEach(function (color) {
                    const dr = color.r - r, dg = color.g - g, db = color.b - blue;
                    const d = dr * dr + dg * dg + db * db;
                    if (d < distance) { distance = d; best = color; }
                });
                path.push(best.css);
            }
            path.push(b.css);
            return path;
        }

        let seed = 13041;
        function random() {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            return seed / 4294967296;
        }
        const used = new Set();
        for (let attempt = 0; events.length < COUNT && attempt < COUNT * 40; attempt++) {
            const a = Math.floor(random() * colors.length);
            const x = a % COLS, y = Math.floor(a / COLS);
            const dx = Math.floor(random() * 3) - 1, dy = Math.floor(random() * 3) - 1;
            if ((!dx && !dy) || x + dx < 0 || x + dx >= COLS || y + dy < 0 || y + dy >= rows) continue;
            const b = (y + dy) * COLS + x + dx;
            if (used.has(a) || used.has(b)) continue;
            const ca = colors[a], cb = colors[b];
            if (Math.max(ca.r, ca.g, ca.b) - Math.min(ca.r, ca.g, ca.b) < 20) continue;
            const dr = ca.r - cb.r, dg = ca.g - cb.g, db = ca.b - cb.b;
            const contrast = dr * dr + dg * dg + db * db;
            if (contrast < 625 || contrast > 32400) continue;
            used.add(a); used.add(b);
            events.push({
                a: a, b: b, path: pathBetween(ca, cb),
                start: random() * PERIOD,
                duration: 3500 + random() * 2000
            });
        }
        paint(0);
        ready = true;
        canvas.classList.add('is-ready');
        sync();
    };
    image.src = new URL('images/pay-card-bg.webp', document.baseURI).href;
})();
