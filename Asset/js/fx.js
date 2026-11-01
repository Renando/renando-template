// FX: background spotlight, cursor ring, tilt, magnetic buttons, text decode, count-up, REC timecode.
// No dependencies. Pointer effects only on mouse/trackpad; everything respects reduced motion.
(function () {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const pointerFx = finePointer && !reduceMotion;

    document.body.classList.add('fx-ready');

    function make(cls, html) {
        const el = document.createElement('div');
        el.className = cls;
        el.setAttribute('aria-hidden', 'true');
        if (html) el.innerHTML = html;
        document.body.appendChild(el);
        return el;
    }

    make('fx-bg');
    make('fx-grain');
    const progress = make('fx-progress');
    const spot = pointerFx ? make('fx-spot') : null;
    const cursor = pointerFx ? make('fx-cursor', '<span>VIEW</span>') : null;

    // ---------- Scroll progress ----------
    let scrollQueued = false;
    function updateProgress() {
        scrollQueued = false;
        const max = document.documentElement.scrollHeight - innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    }
    addEventListener('scroll', () => {
        if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    updateProgress();

    // ---------- Pointer loop: cursor ring (eased) + spotlight ----------
    if (pointerFx) {
        const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
        const ring = { x: mouse.x, y: mouse.y };
        let running = false;

        function frame() {
            ring.x += (mouse.x - ring.x) * 0.2;
            ring.y += (mouse.y - ring.y) * 0.2;
            cursor.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;

            // Spot element follows the mouse; its marker pattern stays locked to the page grid
            spot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
            const bx = 280 - mouse.x, by = 280 - mouse.y;
            spot.style.backgroundPosition = `0 0, ${bx}px ${by}px`;

            if (Math.abs(mouse.x - ring.x) > 0.2 || Math.abs(mouse.y - ring.y) > 0.2) {
                requestAnimationFrame(frame);
            } else {
                running = false;
            }
        }

        addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            cursor.classList.add('is-on');
            spot.classList.add('is-on');
            if (!running) { running = true; requestAnimationFrame(frame); }
        }, { passive: true });

        document.addEventListener('pointerleave', () => {
            cursor.classList.remove('is-on');
            spot.classList.remove('is-on');
        });

        const viewTargets = '.portfolio-item, .cert-trigger, .card-glass.group';
        const linkTargets = 'a, button, [role="button"], select, label, input, textarea';
        document.addEventListener('pointerover', e => {
            const t = e.target;
            const inModalOrForm = t.closest('.modal, form');
            const view = !inModalOrForm && t.closest(viewTargets);
            cursor.classList.toggle('is-view', !!view);
            cursor.classList.toggle('is-link', !view && !!t.closest(linkTargets));
            if (view) cursor.firstChild.textContent = view.classList.contains('cert-trigger') ? 'OPEN' : 'VIEW';
        });

        // ---------- Card tilt + glare ----------
        document.addEventListener('pointermove', e => {
            const card = e.target.closest && e.target.closest('.portfolio-item, .cert-trigger');
            if (!card) return;
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            card.classList.add('fx-tilt');
            card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 9}deg) translateY(-4px)`;
            card.style.setProperty('--gx', `${px * 100}%`);
            card.style.setProperty('--gy', `${py * 100}%`);
        }, { passive: true });

        document.addEventListener('pointerout', e => {
            const card = e.target.closest && e.target.closest('.portfolio-item, .cert-trigger');
            if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
        });

        // ---------- Magnetic buttons ----------
        document.querySelectorAll('.fx-btn').forEach(btn => {
            btn.addEventListener('pointermove', e => {
                const r = btn.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
                btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
            });
            btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
        });
    }

    // ---------- Hero name: split letters (screen readers keep the word) ----------
    const heroName = document.querySelector('#home h1');
    function splitHeroName() {
        const word = heroName.textContent;
        heroName.setAttribute('aria-label', word);
        heroName.innerHTML = [...word].map(ch => `<span class="fx-letter" aria-hidden="true">${ch}</span>`).join('');
    }

    // ---------- Text decode on section titles ----------
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_<>';
    function decode(el, done) {
        const final = el.textContent;
        const duration = 650 + final.length * 18;
        const start = performance.now();
        let last = 0;
        (function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            if (now - last > 40 || p === 1) {
                last = now;
                el.textContent = [...final].map((ch, i) =>
                    ch === ' ' || p >= (i + 1) / final.length ? ch : glyphs[(Math.random() * glyphs.length) | 0]
                ).join('');
            }
            if (p < 1) requestAnimationFrame(tick);
            else if (done) done();
        })(start);
    }

    // ---------- Count-up stats ----------
    function countUp(h3) {
        const node = [...h3.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
        if (!node) return;
        const text = node.textContent;
        const target = parseInt(text.match(/\d+/)[0], 10);
        const start = performance.now(), duration = 1400;
        (function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            node.textContent = text.replace(/\d+/, Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }

    const titles = [...document.querySelectorAll('section > div h2, #home p.text-accent')]
        .filter(el => el.children.length === 0 && !el.closest('.modal'));
    const stats = [...document.querySelectorAll('section h3.text-4xl')];

    if (reduceMotion) {
        if (heroName) splitHeroName();
    } else {
        const seen = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                seen.unobserve(entry.target);
                const el = entry.target;
                if (el === heroName) decode(el, splitHeroName);
                else if (el.tagName === 'H3') countUp(el);
                else {
                    el.setAttribute('aria-label', el.textContent);
                    decode(el);
                }
            });
        }, { threshold: 0.6 });
        titles.concat(stats, heroName ? [heroName] : []).forEach(el => seen.observe(el));
    }

    // ---------- REC timecode (24fps), only ticks while hero is visible ----------
    const tc = document.querySelector('[data-timecode]');
    if (tc) {
        const t0 = performance.now();
        const pad = n => String(n).padStart(2, '0');
        let timer = null;
        function render() {
            const frames = Math.floor((performance.now() - t0) / 1000 * 24);
            const s = Math.floor(frames / 24);
            tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frames % 24)}`;
        }
        render();
        if (!reduceMotion) {
            new IntersectionObserver(([entry]) => {
                clearInterval(timer);
                if (entry.isIntersecting) timer = setInterval(render, 1000 / 24);
            }).observe(tc);
        }
    }
})();

// ---------- Loader: dial, stage, frame counter, messages (driven by the existing progress updates) ----------
(function () {
    const loader = document.getElementById('globalSpinner');
    const bar = document.getElementById('loadingProgressBar');
    if (!loader || !bar) return;

    const ring = loader.querySelector('.fx-dial-progress');
    const stage = loader.querySelector('[data-loader-stage]');
    const frame = loader.querySelector('[data-loader-frame]');
    const tc = loader.querySelector('[data-loader-tc]');
    const msg = loader.querySelector('[data-loader-msg]');
    const CIRC = 565.49, TOTAL_FRAMES = 240;
    const stages = [[20, 'TRACKING CAMERA'], [40, 'ROTOSCOPING PLATES'], [60, 'COMPOSITING LAYERS'], [80, 'COLOR GRADING'], [100, 'RENDERING FINAL'], [101, 'DONE']];
    const messages = [
        'sabar yaa lagi download dulu nih..',
        'lagi nge-render, jangan kabur dulu..',
        'pixel-pixelnya lagi disusun satu-satu..',
        'dikit lagi, ambil napas dulu..',
        'kualitas bagus butuh waktu sebentar..'
    ];
    const pad = (n, len = 2) => String(n).padStart(len, '0');

    function sync() {
        const p = Math.max(0, Math.min(100, parseFloat(bar.style.width) || 0));
        ring.style.strokeDashoffset = CIRC * (1 - p / 100);
        const label = stages.find(([limit]) => p < limit)[1];
        if (stage.textContent !== label) {
            stage.textContent = label;
            stage.dataset.text = label;
        }
        frame.textContent = `FRAME ${pad(Math.round(TOTAL_FRAMES * p / 100), 4)} / ${pad(TOTAL_FRAMES, 4)}`;
    }
    new MutationObserver(sync).observe(bar, { attributes: true, attributeFilter: ['style'] });

    let tcTimer = null, msgTimer = null, msgIndex = 0;
    new MutationObserver(() => {
        clearInterval(tcTimer);
        clearInterval(msgTimer);
        if (!loader.classList.contains('active')) return;
        sync();
        const t0 = performance.now();
        tcTimer = setInterval(() => {
            const f = Math.floor((performance.now() - t0) / 1000 * 24);
            tc.textContent = `00:00:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
        }, 1000 / 24);
        msgTimer = setInterval(() => {
            msg.classList.add('is-swapping');
            setTimeout(() => {
                msgIndex = (msgIndex + 1) % messages.length;
                msg.textContent = messages[msgIndex];
                msg.classList.remove('is-swapping');
            }, 300);
        }, 2600);
    }).observe(loader, { attributes: true, attributeFilter: ['class'] });
})();
