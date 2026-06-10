// Safe Storage Helper
const memS = {};
function sG(k) { try { return localStorage.getItem(k); } catch (e) { return memS[k] || null; } }
function sS(k, v) { try { localStorage.setItem(k, v); } catch (e) { memS[k] = v; } }

// Intro Animation Logic
document.body.style.overflow = 'hidden';
setTimeout(() => {
    const intro = document.getElementById('intro-overlay');
    if (intro) { intro.style.display = 'none'; intro.remove(); }
    document.body.style.overflow = '';
    initReveal();
}, 5200);

// Scroll To Top
const scrollTopBtn = document.getElementById('scroll-top-btn');
scrollTopBtn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== CANVAS ANIMATION ENGINE =====
const cv = document.getElementById('bg-canvas');
const cx = cv.getContext('2d');
let W, H, curBg = 'stars';
let stars = [], rain = [], bolts = [], bubs = [], pts3d = [], lTimer = 0;

function rsz() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
rsz(); window.addEventListener('resize', rsz);

function gRgb() {
    const t = document.body.getAttribute('data-theme') || 'night';
    return { night: '56,189,248', forest: '156,176,128', cloud: '200,140,50', sage: '138,154,91' }[t] || '56,189,248';
}
function gStarC() {
    const t = document.body.getAttribute('data-theme') || 'night';
    return (t === 'cloud' || t === 'sage') ? '30,41,59' : '220,230,255';
}
function isLight() {
    const t = document.body.getAttribute('data-theme') || 'night';
    return t === 'cloud' || t === 'sage';
}

// Init Functions
function initStars() {
    stars = [];
    for (let i = 0; i < 180; i++) stars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.8+0.3, a: Math.random()*0.7+0.3, sp: Math.random()*0.4+0.08, p: Math.random()*6.28, t: 0 });
    for (let i = 0; i < 25; i++) stars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*2.5+1, dx: (Math.random()-0.5)*0.5, dy: (Math.random()-0.5)*0.5, a: Math.random()*0.35+0.1, t: 1 });
}
function initRain() {
    rain = []; for (let i = 0; i < 280; i++) rain.push({ x: Math.random()*W, y: Math.random()*H, l: Math.random()*22+8, sp: Math.random()*10+7, a: Math.random()*0.25+0.08, w: Math.random()*1.2+0.3 });
}
function initBubbles() {
    bubs = []; for (let i = 0; i < 45; i++) bubs.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*40+6, sp: Math.random()*1+0.3, a: Math.random()*0.12+0.03, dx: (Math.random()-0.5)*0.8, wo: Math.random()*6.28, ws: Math.random()*0.02+0.008 });
}
function init3D() {
    pts3d = []; for (let i = 0; i < 80; i++) pts3d.push({ x: (Math.random()-0.5)*1600, y: (Math.random()-0.5)*1600, z: Math.random()*1800+200, pz: 0 }); lTimer = 0;
}

function switchBg(t) {
    curBg = t; document.body.setAttribute('data-bg', t); sS('gvr-bg', t); cx.clearRect(0, 0, W, H);
    if (t === 'stars') initStars();
    else if (t === 'thunder') { initRain(); bolts = []; lTimer = 0; }
    else if (t === 'bubbles') initBubbles();
    else if (t === '3dlines') init3D();
}

// Draw Functions
function drawStars() {
    const sc = gStarC(), pc = gRgb(), il = isLight();
    for (let i = 0; i < stars.length; i++) { const s = stars[i];
        if (s.t === 1) {
            cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.28); cx.fillStyle = `rgba(${pc},${s.a})`; cx.fill();
            s.x += s.dx; s.y += s.dy;
            if (s.x < -10) s.x = W + 10; if (s.x > W + 10) s.x = -10; if (s.y < -10) s.y = H + 10; if (s.y > H + 10) s.y = -10;
        } else {
            s.p += 0.015; const al = s.a * (0.5 + 0.5 * Math.sin(s.p));
            cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.28); cx.fillStyle = `rgba(${sc},${il ? al*0.35 : al})`; cx.fill();
            if (s.r > 1.2 && !il) { cx.beginPath(); cx.arc(s.x, s.y, s.r*3, 0, 6.28); cx.fillStyle = `rgba(${sc},${al*0.08})`; cx.fill(); }
            s.y -= s.sp; if (s.y < -5) { s.y = H + 5; s.x = Math.random() * W; }
        }
    }
    const ps = stars.filter(s => s.t === 1);
    for (let i = 0; i < ps.length; i++) { for (let j = i + 1; j < ps.length; j++) {
        const dx = ps[i].x-ps[j].x, dy = ps[i].y-ps[j].y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 140) { cx.beginPath(); cx.moveTo(ps[i].x, ps[i].y); cx.lineTo(ps[j].x, ps[j].y); cx.strokeStyle = `rgba(${pc},${(il?0.04:0.08)*(1-d/140)})`; cx.lineWidth = 0.6; cx.stroke(); }
    }}
}

function makeBolt(sx, sy, ey) {
    const segs = [{x: sx, y: sy}]; let x = sx, y = sy;
    while (y < ey) { x += (Math.random()-0.5)*70; y += 12+Math.random()*18; segs.push({x: x, y: Math.min(y, ey)});
        if (Math.random() < 0.3) { let bx = x, by = y; const br = []; for (let b = 0; b < Math.random()*5+2; b++) { bx += (Math.random()-0.5)*50; by += 10; br.push({x: bx, y: Math.min(by, ey)}); } bolts.push({s: [{x, y}, ...br], l: 0.5}); }
    } return segs;
}

function drawThunder() {
    const rgb = gRgb(), sc = gStarC(), il = isLight(); lTimer++;
    for (let i = 0; i < rain.length; i++) { const d = rain[i];
        cx.beginPath(); cx.moveTo(d.x, d.y); cx.lineTo(d.x+d.l*0.12, d.y+d.l); cx.strokeStyle = `rgba(${il?'60,80,100':rgb},${il?d.a*0.5:d.a})`; cx.lineWidth = d.w; cx.stroke();
        d.y += d.sp; d.x += d.sp*0.06;
        if (d.y > H) { cx.beginPath(); cx.arc(d.x, H-2, Math.random()*2+0.5, 0, Math.PI, true); cx.fillStyle = `rgba(${rgb},${d.a*0.6})`; cx.fill(); d.y = -d.l; d.x = Math.random()*W; }
    }
    const fg = cx.createLinearGradient(0, H-100, 0, H); fg.addColorStop(0, 'transparent'); fg.addColorStop(1, `rgba(${rgb},${il?0.02:0.04})`); cx.fillStyle = fg; cx.fillRect(0, H-100, W, 100);
    if (lTimer > 60+Math.random()*160) { lTimer = 0; const bolt = makeBolt(Math.random()*W*0.7+W*0.15, 0, H*(0.5+Math.random()*0.3)); bolts.push({s: bolt, l: 1}); cx.fillStyle = `rgba(${rgb},${il?0.02:0.05})`; cx.fillRect(0, 0, W, H); }
    bolts = bolts.filter(b => b.l > 0);
    for (let i = 0; i < bolts.length; i++) { const b = bolts[i]; b.l -= 0.03; const a = b.l;
        cx.beginPath(); for (let j = 0; j < b.s.length; j++) { if (j===0) cx.moveTo(b.s[j].x, b.s[j].y); else cx.lineTo(b.s[j].x, b.s[j].y); }
        cx.strokeStyle = `rgba(${rgb},${a*0.2})`; cx.lineWidth = 12; cx.stroke();
        cx.beginPath(); for (let j = 0; j < b.s.length; j++) { if (j===0) cx.moveTo(b.s[j].x, b.s[j].y); else cx.lineTo(b.s[j].x, b.s[j].y); }
        cx.strokeStyle = `rgba(${rgb},${a*0.9})`; cx.lineWidth = 2.5; cx.shadowColor = `rgba(${rgb},${a})`; cx.shadowBlur = 30; cx.stroke(); cx.shadowBlur = 0;
    }
    for (let i = 0; i < 5; i++) { const px = Math.random()*W, py = Math.random()*H; cx.beginPath(); cx.arc(px, py, Math.random()*0.8+0.2, 0, 6.28); cx.fillStyle = `rgba(${sc},${Math.random()*0.1})`; cx.fill(); }
}

function drawBubbles() {
    const rgb = gRgb(), il = isLight();
    for (let i = 0; i < bubs.length; i++) { const b = bubs[i];
        b.wo += b.ws; const sx = Math.sin(b.wo)*b.r*0.15; const bx = b.x+sx;
        cx.beginPath(); cx.arc(bx, b.y, b.r, 0, 6.28);
        const gr = cx.createRadialGradient(bx-b.r*0.3, b.y-b.r*0.3, b.r*0.1, bx, b.y, b.r);
        gr.addColorStop(0, `rgba(${rgb},${il?b.a*1.5:b.a})`); gr.addColorStop(1, `rgba(${rgb},${b.a*0.3})`);
        cx.fillStyle = gr; cx.fill();
        cx.beginPath(); cx.arc(bx, b.y, b.r, 0, 6.28); cx.strokeStyle = `rgba(${rgb},${il?b.a*2:b.a*1.5})`; cx.lineWidth = 0.8; cx.stroke();
        cx.beginPath(); cx.ellipse(bx-b.r*0.25, b.y-b.r*0.3, b.r*0.15, b.r*0.22, -0.4, 0, 6.28); cx.fillStyle = `rgba(255,255,255,${il?0.15:0.12})`; cx.fill();
        cx.beginPath(); cx.arc(bx+b.r*0.3, b.y+b.r*0.2, b.r*0.06, 0, 6.28); cx.fillStyle = 'rgba(255,255,255,0.08)'; cx.fill();
        b.y -= b.sp; b.x += b.dx;
        if (b.y < -b.r*2) { b.y = H+b.r*2; b.x = Math.random()*W; } if (b.x < -b.r*2) b.x = W+b.r; if (b.x > W+b.r*2) b.x = -b.r;
    }
}

function draw3DLines() {
    const rgb = gRgb(), il = isLight(), cxP = W/2, cyP = H/2, proj = []; const focal = 350;
    for (let i = 0; i < pts3d.length; i++) { const p = pts3d[i];
        p.pz = p.z; p.z -= 5;
        if (p.z < 1) { p.z = 1800; p.pz = 1800; p.x = (Math.random()-0.5)*1600; p.y = (Math.random()-0.5)*1600; }
        const sc1 = focal/Math.max(p.z, 1), sc2 = focal/Math.max(p.pz, 1);
        const sx = p.x*sc1+cxP, sy = p.y*sc1+cyP; const px = p.x*sc2+cxP, py = p.y*sc2+cyP;
        const al = Math.max(0, 1-p.z/1800);
        cx.beginPath(); cx.moveTo(px, py); cx.lineTo(sx, sy); cx.strokeStyle = `rgba(${rgb},${al*0.5})`; cx.lineWidth = al*2+0.3; cx.stroke();
        cx.beginPath(); cx.arc(sx, sy, al*3+0.5, 0, 6.28); cx.fillStyle = `rgba(${rgb},${il?al*0.7:al})`; cx.fill();
        if (al > 0.5) { cx.beginPath(); cx.arc(sx, sy, al*8, 0, 6.28); cx.fillStyle = `rgba(${rgb},${al*0.04})`; cx.fill(); }
        proj.push({x: sx, y: sy, a: al});
    }
    for (let i = 0; i < proj.length; i++) { for (let j = i + 1; j < proj.length; j++) {
        const dx = proj[i].x-proj[j].x, dy = proj[i].y-proj[j].y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 110) { const la = (1-d/110)*0.12*Math.min(proj[i].a, proj[j].a); cx.beginPath(); cx.moveTo(proj[i].x, proj[i].y); cx.lineTo(proj[j].x, proj[j].y); cx.strokeStyle = `rgba(${rgb},${la})`; cx.lineWidth = 0.5; cx.stroke(); }
    }}
}

function animLoop() {
    cx.clearRect(0, 0, W, H);
    if (curBg === 'stars') drawStars(); else if (curBg === 'thunder') drawThunder(); else if (curBg === 'bubbles') drawBubbles(); else if (curBg === '3dlines') draw3DLines();
    requestAnimationFrame(animLoop);
}
const sbg = sG('gvr-bg') || 'stars'; switchBg(sbg); animLoop();

// ===== SETTINGS PANEL =====
const sBtn = document.getElementById('settings-btn');
const sPanel = document.getElementById('settings-panel');
let sOpen = false;
sBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); sOpen = !sOpen; if (sOpen) { sPanel.classList.add('open'); sBtn.classList.add('active'); } else { sPanel.classList.remove('open'); sBtn.classList.remove('active'); } });
document.addEventListener('click', (e) => { if (sOpen && !sPanel.contains(e.target) && !sBtn.contains(e.target)) { sOpen = false; sPanel.classList.remove('open'); sBtn.classList.remove('active'); } });

function applyTheme(t) { document.body.setAttribute('data-theme', t); sS('gvr-theme', t); document.querySelectorAll('.settings-color').forEach(d => d.classList.toggle('active', d.getAttribute('data-theme') === t)); if (curBg === 'bubbles') initBubbles(); }
document.querySelectorAll('.settings-color').forEach(d => d.addEventListener('click', () => applyTheme(d.getAttribute('data-theme'))));
const st = sG('gvr-theme'); if (st) applyTheme(st);

document.querySelectorAll('.settings-bg-opt').forEach(o => o.addEventListener('click', () => { const bg = o.getAttribute('data-bg'); switchBg(bg); document.querySelectorAll('.settings-bg-opt').forEach(x => x.classList.toggle('active', x.getAttribute('data-bg') === bg)); }));
document.querySelectorAll('.settings-bg-opt').forEach(o => o.classList.toggle('active', o.getAttribute('data-bg') === curBg));

function applyFont(f) { document.body.style.fontFamily = f; sS('gvr-font', f); document.querySelectorAll('.settings-font-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-font') === f)); }
document.querySelectorAll('.settings-font-btn').forEach(b => b.addEventListener('click', () => applyFont(b.getAttribute('data-font'))));
const sf = sG('gvr-font'); if (sf) applyFont(sf);

// ===== MOBILE SIDEBAR =====
const hm = document.getElementById('hamburger'), sb2 = document.getElementById('mobile-sidebar'), ov = document.getElementById('sidebar-overlay'), sc = document.getElementById('sidebar-close');
function oSB() { sb2.classList.add('open'); ov.classList.add('open'); hm.classList.add('active'); document.body.style.overflow = 'hidden'; }
function cSB() { sb2.classList.remove('open'); ov.classList.remove('open'); hm.classList.remove('active'); document.body.style.overflow = ''; }
hm.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); sb2.classList.contains('open') ? cSB() : oSB(); });
ov.addEventListener('click', (e) => { e.preventDefault(); cSB(); });
sc.addEventListener('click', (e) => { e.preventDefault(); cSB(); });
document.querySelectorAll('.sidebar-nav a').forEach(l => l.addEventListener('click', (e) => { e.preventDefault(); cSB(); const t = l.getAttribute('href'); if (t && t.startsWith('#')) setTimeout(() => { const el = document.querySelector(t); if (el) el.scrollIntoView({behavior: 'smooth'}); }, 150); }));

// ===== SCROLL & REVEAL =====
function initReveal() {
    const r = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(en => en.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), {threshold: 0.1, rootMargin: '0px 0px -40px 0px'});
    r.forEach(el => obs.observe(el));
    const sbl = document.querySelectorAll('.skill-bar-fill');
    const so = new IntersectionObserver(en => en.forEach(e => { if (e.isIntersecting) e.target.style.width = e.target.getAttribute('data-width') + '%'; }), {threshold: 0.3});
    sbl.forEach(b => so.observe(b));
}

function uScr() {
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    if (dh > 0) document.getElementById('scroll-progress').style.width = (window.scrollY / dh * 100) + '%';
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);

    // Scroll To Top Visibility
    if (window.scrollY > 400) scrollTopBtn.classList.add('visible'); else scrollTopBtn.classList.remove('visible');

    const secs = document.querySelectorAll('.section'), nls = document.querySelectorAll('.nav-links a'); let cur = '';
    secs.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.getAttribute('id'); });
    nls.forEach(l => { l.classList.remove('active'); if (l.getAttribute('href') === '#' + cur) l.classList.add('active'); });
}
window.addEventListener('scroll', uScr);

// ===== CONTACT FORM =====
const cf = document.getElementById('contact-form'), tt = document.getElementById('toast');
cf.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!document.getElementById('name').value.trim() || !document.getElementById('email').value.trim() || !document.getElementById('message').value.trim()) { shT('Please fill in all required fields.', false); return; }
    const b = cf.querySelector('button[type="submit"]'); b.innerHTML = '<span class="iconify" data-icon="mdi:loading" style="animation:spin 1s linear infinite"></span> Sending...'; b.disabled = true;
    setTimeout(() => { shT('Message sent successfully!', true); cf.reset(); b.innerHTML = '<span class="iconify" data-icon="mdi:check"></span> Sent!'; setTimeout(() => { b.innerHTML = '<span class="iconify" data-icon="mdi:send"></span> Send Message'; b.disabled = false; }, 2000); }, 1500);
});
function shT(m, ok) { tt.textContent = m; tt.style.borderColor = ok ? 'var(--accent)' : '#f87171'; tt.style.color = ok ? 'var(--accent)' : '#f87171'; tt.classList.add('show'); setTimeout(() => tt.classList.remove('show'), 3500); }
document.getElementById('resume-btn').addEventListener('click', (e) => { e.preventDefault(); shT('Resume download will be available soon!', true); });
