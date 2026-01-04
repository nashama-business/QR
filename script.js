// --- Elements ---
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const formatSelect = document.getElementById('formatSelect');
const resultCard = document.getElementById('resultCard');
const placeholder = document.getElementById('placeholder');
const qrcodeWrapper = document.getElementById('qrcodeWrapper');
const logoInput = document.getElementById('logoInput');

// Mobile & History
const sidebar = document.getElementById('sidebar');
const mobileOpen = document.getElementById('openSidebar');
const mobileClose = document.getElementById('closeSidebar');
const historyBtn = document.getElementById('openHistory');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const closeHistory = document.getElementById('closeHistory');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Inputs
const inputs = {
    url: document.getElementById('qrText'),
    wifiSSID: document.getElementById('wifiSSID'),
    wifiPass: document.getElementById('wifiPass'),
    wifiEnc: document.getElementById('wifiEnc'),
    vcName: document.getElementById('vcName'),
    vcPhone: document.getElementById('vcPhone'),
    vcEmail: document.getElementById('vcEmail'),
    vcOrg: document.getElementById('vcOrg'),
    waPhone: document.getElementById('waPhone'),
    waMsg: document.getElementById('waMsg'),
    // New
    mailTo: document.getElementById('mailTo'),
    mailSub: document.getElementById('mailSub'),
    mailBody: document.getElementById('mailBody'),
    smsPhone: document.getElementById('smsPhone'),
    smsMsg: document.getElementById('smsMsg'),
    plainText: document.getElementById('plainText'),
    // New
    evtTitle: document.getElementById('evtTitle'),
    evtLoc: document.getElementById('evtLoc'),
    evtStart: document.getElementById('evtStart'),
    evtEnd: document.getElementById('evtEnd'),
    geoLat: document.getElementById('geoLat'),
    geoLon: document.getElementById('geoLon'),
    // Legacy removed
    frameText: null, // document.getElementById('frameText'), 
    frameColor: null // document.getElementById('frameColor')
};

// Colors & Design
const color1Input = document.getElementById('color1'); const alpha1Input = document.getElementById('alpha1');
const color2Input = document.getElementById('color2'); const alpha2Input = document.getElementById('alpha2');
const bgInput = document.getElementById('bg'); const alphaBgInput = document.getElementById('alphaBg');
const eyeColorInput = document.getElementById('eyeColor'); const alphaEyeInput = document.getElementById('alphaEye');
const checkboxGradient = document.getElementById('useGradient');
const color2Wrapper = document.getElementById('color2Wrapper');

const styleShape = document.querySelectorAll('.style-box[data-target="shape"]');
const styleEye = document.querySelectorAll('.style-box[data-target="eye"]');
const tplBtns = document.querySelectorAll('.tpl-btn');

// --- State ---
let state = {
    activeTab: 'url',
    shape: 'square', eyeShape: 'square',
    useGradient: false,
    color1: '#000000', alpha1: '1',
    color2: '#06b6d4', alpha2: '1',
    bg: '#ffffff', alphaBg: '1', // Default White BG
    eyeColor: '#000000', alphaEye: '1', // Default Black Eyes
    logo: null,
    currentCanvas: null
};

// --- Initialization ---

// 1. Tabs Logic
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        state.activeTab = btn.dataset.tab;
    });
});

// 2. Templates Logic
const templates = {
    'default': { color1: '#000000', bg: '#ffffff', eyeColor: '#000000', shape: 'square', eyeShape: 'square' },
    'social': { color1: '#1877f2', bg: '#ffffff', eyeColor: '#1877f2', shape: 'round', eyeShape: 'circle' },
    'neon': { color1: '#00ffea', bg: '#000000', eyeColor: '#d600ff', shape: 'dots', eyeShape: 'square' },
    'gold': { color1: '#ffd700', bg: '#000000', eyeColor: '#ffd700', shape: 'square', eyeShape: 'rounded' },
    'matrix': { color1: '#00ff00', bg: '#000000', eyeColor: '#003300', shape: 'square', eyeShape: 'square' },
    'love': { color1: '#ff0055', bg: '#fff0f5', eyeColor: '#ff0000', shape: 'round', eyeShape: 'rounded' },
    'sunset': { color1: '#ff4500', bg: '#ffffff', eyeColor: '#8a2be2', shape: 'dots', eyeShape: 'circle' }, // Gradient logic needs handling if supported in templates
    'corporate': { color1: '#2d3748', bg: '#e2e8f0', eyeColor: '#2d3748', shape: 'square', eyeShape: 'rounded' }
};

tplBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tpl = templates[btn.dataset.tpl];
        if (!tpl) return;
        // Update State
        state.color1 = tpl.color1; color1Input.value = tpl.color1;
        state.bg = tpl.bg; bgInput.value = tpl.bg;
        state.eyeColor = tpl.eyeColor; eyeColorInput.value = tpl.eyeColor;
        state.shape = tpl.shape; state.eyeShape = tpl.eyeShape;

        // Update UI
        styleShape.forEach(b => b.classList.toggle('active', b.dataset.style === tpl.shape));
        styleEye.forEach(b => b.classList.toggle('active', b.dataset.style === tpl.eyeShape));
        // Trigger regen if active
        if (resultCard.style.display !== 'none') generateQR();
    });
});

// 3. Mobile Sidebar
const toggleSidebar = (o) => sidebar.classList.toggle('open', o);
mobileOpen.onclick = () => toggleSidebar(true);
mobileClose.onclick = () => toggleSidebar(false);

// 4. Styles & Colors Bindings
function bindStyle(nodes, key) {
    nodes.forEach(n => {
        n.addEventListener('click', () => {
            nodes.forEach(x => x.classList.remove('active'));
            n.classList.add('active');
            state[key] = n.dataset.style;
        });
    });
}
bindStyle(styleShape, 'shape');
bindStyle(styleEye, 'eyeShape');

function bindColor(cIn, aIn, kC, kA) {
    cIn.addEventListener('input', e => state[kC] = e.target.value);
    aIn.addEventListener('input', e => state[kA] = e.target.value);
}
bindColor(color1Input, alpha1Input, 'color1', 'alpha1');
bindColor(color2Input, alpha2Input, 'color2', 'alpha2');
bindColor(bgInput, alphaBgInput, 'bg', 'alphaBg');
bindColor(eyeColorInput, alphaEyeInput, 'eyeColor', 'alphaEye');

checkboxGradient.addEventListener('change', e => {
    state.useGradient = e.target.checked;
    color2Wrapper.classList.toggle('hidden', !state.useGradient);
});

logoInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
        const r = new FileReader();
        r.onload = ev => {
            const i = new Image(); i.onload = () => state.logo = i; i.src = ev.target.result;
        };
        r.readAsDataURL(file);
        e.target.parentElement.style.borderColor = '#22d3ee';
    }
});

// --- History Logic ---
let history = JSON.parse(localStorage.getItem('qr_history') || '[]');

function saveHistory(text, type) {
    const item = { text, type, date: new Date().toLocaleTimeString() };
    history.unshift(item);
    if (history.length > 10) history.pop();
    localStorage.setItem('qr_history', JSON.stringify(history));
}

function renderHistory() {
    historyList.innerHTML = history.map(item => `
        <li>
            <span>${item.type}: ${item.text.substring(0, 15)}...</span>
            <span style="color:#666">${item.date}</span>
        </li>
    `).join('');
}

historyBtn.onclick = () => { renderHistory(); historyModal.classList.remove('hidden'); };
closeHistory.onclick = () => historyModal.classList.add('hidden');


// Helpers
document.getElementById('locateBtn')?.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            inputs.geoLat.value = pos.coords.latitude;
            inputs.geoLon.value = pos.coords.longitude;
        });
    } else alert('الجيولوكيشن غير مدعوم');
});


// --- Generation Logic ---

function getQRData() {
    const type = state.activeTab;

    if (type === 'url') return inputs.url.value.trim();

    if (type === 'text') return inputs.plainText.value.trim();

    if (type === 'wifi') {
        const ssid = inputs.wifiSSID.value;
        const pass = inputs.wifiPass.value;
        const enc = inputs.wifiEnc.value;
        if (!ssid) return null;
        return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
    }

    if (type === 'vcard') {
        const n = inputs.vcName.value; const p = inputs.vcPhone.value;
        if (!n) return null;
        return `BEGIN:VCARD\nVERSION:3.0\nN:${n}\nTEL:${p}\nEMAIL:${inputs.vcEmail.value}\nORG:${inputs.vcOrg.value}\nEND:VCARD`;
    }

    if (type === 'whatsapp') {
        const p = inputs.waPhone.value;
        if (!p) return null;
        return `https://wa.me/${p.replace(/\+/g, '')}?text=${encodeURIComponent(inputs.waMsg.value)}`;
    }

    if (type === 'email') {
        const to = inputs.mailTo.value;
        if (!to) return null;
        return `mailto:${to}?subject=${encodeURIComponent(inputs.mailSub.value)}&body=${encodeURIComponent(inputs.mailBody.value)}`;
    }

    if (type === 'sms') {
        const p = inputs.smsPhone.value;
        if (!p) return null;
        return `SMSTO:${p}:${inputs.smsMsg.value}`;
    }

    if (type === 'event') {
        const t = inputs.evtTitle.value;
        if (!t) return null;
        // Format dates to YYYYMMDDTHHMMSSZ roughly or local
        const fmt = d => d.replace(/[-:]/g, '') + '00';
        return `BEGIN:VEVENT\nSUMMARY:${t}\nLOCATION:${inputs.evtLoc.value}\nDTSTART:${fmt(inputs.evtStart.value)}\nDTEND:${fmt(inputs.evtEnd.value)}\nEND:VEVENT`;
    }

    if (type === 'location') {
        const lat = inputs.geoLat.value; const lon = inputs.geoLon.value;
        if (!lat || !lon) return null;
        return `geo:${lat},${lon}`;
    }

    return null;
}

generateBtn.onclick = generateQR;
resetBtn.onclick = () => { resultCard.style.display = 'none'; placeholder.style.display = 'block'; };

// UX Helpers
function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = type === 'error' ? `❌ ${msg}` : `✨ ${msg}`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Params
const spinner = document.getElementById('loadingSpinner');

function generateQR() {
    const text = getQRData();
    if (!text) { showToast('الرجاء إدخال البيانات المطلوبة', 'error'); return; }

    toggleSidebar(false);
    saveHistory(text, state.activeTab);

    // Show Loader for UX
    if (resultCard.style.display === 'flex') {
        spinner.classList.add('active');
    }

    const temp = document.createElement('div');
    new QRCode(temp, { text: text, width: 1000, height: 1000, correctLevel: QRCode.CorrectLevel.H });

    // Slight delay to allow UI to render Spinner
    setTimeout(() => {
        const el = temp.querySelector('canvas') || temp.querySelector('img');
        if (el) {
            if (el.tagName === 'CANVAS') {
                const i = new Image(); i.src = el.toDataURL(); i.onload = () => {
                    draw(i);
                    spinner.classList.remove('active');
                    if (resultCard.style.display !== 'flex') {
                        placeholder.style.display = 'none'; resultCard.style.display = 'flex';
                        showToast('تم توليد الباركود بنجاح', 'success');
                    }
                };
            } else {
                draw(el);
                spinner.classList.remove('active');
            }
        }
    }, 500); // 500ms delay for visual feedback
}

function hexToRgba(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function draw(srcImg) {
    // Legacy frame removed
    const hasFrame = false;

    const qrSize = 1000;
    const padding = hasFrame ? 150 : 0; // Extra space for frame text
    const totalSize = qrSize + (padding * 2); // Only add padding if frame?
    // Actually, usually frames wrap around. Let's say canvas is 1000x1200 if frame text exists.

    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = hasFrame ? 1150 : 1000;
    const ctx = canvas.getContext('2d');

    // Draw BG
    ctx.fillStyle = hexToRgba(state.bg, state.alphaBg);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR Logic (Same as V6, but optimized)
    const tCv = document.createElement('canvas'); tCv.width = 1000; tCv.height = 1000;
    const tCtx = tCv.getContext('2d'); tCtx.drawImage(srcImg, 0, 0, 1000, 1000);

    // Analyze Grid
    let count = 21, minRun = 1000, cRun = 0;
    const d = tCtx.getImageData(0, 500, 1000, 1).data;
    for (let i = 0; i < 1000; i++) {
        if (d[i * 4] < 128) cRun++;
        else { if (cRun > 0 && cRun < minRun) minRun = cRun; cRun = 0; }
    }
    if (cRun > 0 && cRun < minRun) minRun = cRun;
    if (minRun < 5) minRun = 1000 / 21;
    count = Math.round(1000 / minRun);
    const mod = 1000 / count;

    // Draw Modules
    let fill = hexToRgba(state.color1, state.alpha1);
    if (state.useGradient) {
        const g = ctx.createLinearGradient(0, 0, 1000, 1000);
        g.addColorStop(0, hexToRgba(state.color1, state.alpha1));
        g.addColorStop(1, hexToRgba(state.color2, state.alpha2));
        fill = g;
    }

    ctx.fillStyle = fill;
    for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
            const cx = Math.floor(c * mod + mod / 2); const cy = Math.floor(r * mod + mod / 2);
            if (isInEye(r, c, count)) continue;
            if (tCtx.getImageData(cx, cy, 1, 1).data[0] < 128) {
                const x = c * mod; const y = r * mod;
                if (state.shape === 'dots') {
                    ctx.beginPath(); ctx.arc(x + mod / 2, y + mod / 2, mod * 0.4, 0, Math.PI * 2); ctx.fill();
                } else if (state.shape === 'round') {
                    roundRect(ctx, x, y, mod, mod, mod * 0.35); ctx.fill();
                } else {
                    ctx.fillRect(x, y, mod + 0.5, mod + 0.5);
                }
            }
        }
    }

    // Eyes
    ctx.fillStyle = hexToRgba(state.eyeColor, state.alphaEye);
    const bg = hexToRgba(state.bg, state.alphaBg);
    drawEye(ctx, 0, 0, mod, state.eyeShape, bg);
    drawEye(ctx, (count - 7) * mod, 0, mod, state.eyeShape, bg);
    drawEye(ctx, 0, (count - 7) * mod, mod, state.eyeShape, bg);

    // Logo
    if (state.logo) {
        const s = 1000 * 0.22;
        const p = (1000 - s) / 2;
        ctx.fillStyle = bg;
        if (state.alphaBg > 0) { roundRect(ctx, p - 10, p - 10, s + 20, s + 20, 20); ctx.fill(); }
        ctx.drawImage(state.logo, p, p, s, s);
    }

    // Frame Text
    if (hasFrame) {
        ctx.fillStyle = inputs.frameColor.value;
        ctx.font = "bold 80px Tajawal, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(frameTxt, 500, 1100);
    }

    // Output
    state.currentCanvas = canvas;
    qrcodeWrapper.innerHTML = '';
    const out = new Image(); out.src = canvas.toDataURL();
    qrcodeWrapper.appendChild(out);
    placeholder.style.display = 'none'; resultCard.style.display = 'flex';
}

function isInEye(r, c, count) {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= count - 7) return true;
    if (r >= count - 7 && c < 7) return true;
    return false;
}

function drawEye(ctx, x, y, mod, style, bg) {
    const s = mod * 7;
    const cx = x + s / 2; const cy = y + s / 2;
    if (style === 'square') {
        ctx.fillRect(x, y, s, s); ctx.clearRect(x + mod, y + mod, mod * 5, mod * 5);
        ctx.fillStyle = bg; ctx.fillRect(x + mod, y + mod, mod * 5, mod * 5);
        ctx.fillStyle = hexToRgba(state.eyeColor, state.alphaEye); ctx.fillRect(x + mod * 2, y + mod * 2, mod * 3, mod * 3);
    } else if (style === 'circle') {
        ctx.beginPath(); ctx.arc(cx, cy, s / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, s / 2 - mod, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = hexToRgba(state.eyeColor, state.alphaEye); ctx.beginPath(); ctx.arc(cx, cy, mod * 1.5, 0, Math.PI * 2); ctx.fill();
    } else {
        roundRect(ctx, x, y, s, s, mod * 1.5); ctx.fill();
        ctx.fillStyle = bg; roundRect(ctx, x + mod, y + mod, s - mod * 2, s - mod * 2, mod); ctx.fill();
        ctx.fillStyle = hexToRgba(state.eyeColor, state.alphaEye); roundRect(ctx, x + mod * 2, y + mod * 2, s - mod * 4, s - mod * 4, mod / 2); ctx.fill();
    }
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// Download
downloadBtn.onclick = () => {
    if (!state.currentCanvas) return;
    const fmt = formatSelect.value;
    const name = `QRABD-${Date.now()}`;
    const link = document.createElement("a");
    link.download = `${name}.${fmt}`;

    if (fmt === 'svg') {
        alert('تصدير SVG غير مدعوم لرسم الإطارات والنصوص حالياً، سيتم تحميل PNG.');
        link.href = state.currentCanvas.toDataURL('image/png');
    } else {
        let mime = fmt === 'jpg' ? 'image/jpeg' : `image/${fmt}`;
        link.href = state.currentCanvas.toDataURL(mime, 1.0);
    }
    link.click();
};
