// ===== Telegram Mini App Init =====
var tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
var TG_BOT_TOKEN = '8640506002:AAGsTPFzI7WsVva381uQmflsB_TAXjJRnfg';
var TG_CHAT_ID = '-1003831593831';

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#1a1a2e');
    tg.setBackgroundColor('#1a1a2e');
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        var user = tg.initDataUnsafe.user;
        document.getElementById('name').value = user.first_name || '';
        if (user.last_name) {
            document.getElementById('name').value += ' ' + user.last_name;
        }
    }
}

// ===== Phone mask =====
var phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function(e) {
    var digits = e.target.value.replace(/\D/g, '');
    if (digits.length === 0) { e.target.value = ''; return; }
    if (digits[0] === '3' && digits[1] === '8') digits = digits.substring(2);
    if (digits[0] === '0') digits = digits.substring(1);
    var f = '+38 (0';
    if (digits.length > 0) f += digits.substring(0, 2);
    if (digits.length <= 2) { e.target.value = f; return; }
    f += ') ' + digits.substring(2, 5);
    if (digits.length > 5) f += '-' + digits.substring(5, 7);
    if (digits.length > 7) f += '-' + digits.substring(7, 9);
    e.target.value = f;
});

phoneInput.addEventListener('keydown', function(e) {
    if (e.key === 'Backspace' && e.target.value === '+38 (0)') e.target.value = '';
});

// ===== Date mask =====
var dateInput = document.getElementById('date');
dateInput.addEventListener('input', function(e) {
    var digits = e.target.value.replace(/\D/g, '');
    if (digits.length === 0) { e.target.value = ''; return; }
    var f = digits.substring(0, 2);
    if (digits.length > 2) f += '.' + digits.substring(2, 4);
    if (digits.length > 4) f += '.' + digits.substring(4, 8);
    e.target.value = f;
    if (e.target.closest('.form-group').classList.contains('error')) validateDate();
});

// ===== Validation =====
function showError(fieldId, msg) {
    var el = document.getElementById(fieldId);
    var g = el.closest('.form-group');
    var err = document.getElementById(fieldId + 'Error');
    g.classList.add('error');
    g.classList.remove('success');
    err.textContent = msg;
}

function clearError(fieldId) {
    var g = document.getElementById(fieldId).closest('.form-group');
    var err = document.getElementById(fieldId + 'Error');
    g.classList.remove('error');
    err.textContent = '';
}

function markOk(fieldId) {
    var g = document.getElementById(fieldId).closest('.form-group');
    g.classList.remove('error');
    g.classList.add('success');
}

function validateName() {
    var v = document.getElementById('name').value.trim();
    if (v.length < 2) { showError('name', 'Мінімум 2 символи'); return false; }
    if (!/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\-\s']+$/.test(v)) { showError('name', 'Тільки літери, дефіс або апостроф'); return false; }
    clearError('name'); markOk('name'); return true;
}

function validatePhone() {
    var v = document.getElementById('phone').value.replace(/\D/g, '');
    if (v.length < 10) { showError('phone', 'Введіть повний номер'); return false; }
    if (v.length > 12) { showError('phone', 'Надто багато цифр'); return false; }
    clearError('phone'); markOk('phone'); return true;
}

function validateDate() {
    var v = document.getElementById('date').value;
    if (!v) { showError('date', 'Оберіть дату'); return false; }
    var p = v.split('.');
    if (p.length !== 3 || p[0].length !== 2 || p[1].length !== 2 || p[2].length !== 4) { showError('date', 'Формат: ДД.ММ.РРРР'); return false; }
    var d = parseInt(p[0], 10), m = parseInt(p[1], 10), y = parseInt(p[2], 10);
    if (m < 1 || m > 12) { showError('date', 'Невірний місяць'); return false; }
    var dim = new Date(y, m, 0).getDate();
    if (d < 1 || d > dim) { showError('date', 'Невірний день'); return false; }
    if (y < 2025 || y > 2030) { showError('date', 'Рік 2025-2030'); return false; }
    var sel = new Date(y, m - 1, d), now = new Date(); now.setHours(0,0,0,0);
    if (sel < now) { showError('date', 'Дата в минулому'); return false; }
    var max = new Date(); max.setMonth(max.getMonth() + 3); max.setHours(0,0,0,0);
    if (sel > max) { showError('date', 'Максимум 3 місяці'); return false; }
    clearError('date'); markOk('date'); return true;
}

document.getElementById('name').addEventListener('blur', validateName);
document.getElementById('phone').addEventListener('blur', validatePhone);
document.getElementById('date').addEventListener('blur', validateDate);
document.getElementById('name').addEventListener('input', function() { if (this.closest('.form-group').classList.contains('error')) validateName(); });
document.getElementById('phone').addEventListener('input', function() { if (this.closest('.form-group').classList.contains('error')) validatePhone(); });

// ===== Submit =====
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var n = validateName(), p = validatePhone(), d = validateDate();
    if (!n || !p || !d) {
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        return;
    }

    var formData = new FormData(this);
    var data = Object.fromEntries(formData.entries());
    var user = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) ? tg.initDataUnsafe.user : null;

    var zoneLabels = { standard: 'Стандарт', vip: 'VIP', vvip: 'VVIP' };
    var guestLabels = { '1-2': '1-2 особи', '3-5': '3-5 осіб', '6-10': '6-10 осіб', '10+': '10+ осіб' };

    var msg = '🎾 *Нова заявка на бронювання*\n\n';
    if (user) msg += '🆔 *Telegram:* @' + (user.username || 'немає') + ' (ID: ' + user.id + ')\n';
    msg += '👤 *Ім\'я:* ' + data.name.trim() + '\n';
    msg += '📞 *Телефон:* ' + data.phone + '\n';
    msg += '📅 *Дата:* ' + data.date + '\n';
    msg += '👥 *Гості:* ' + (guestLabels[data.guests] || data.guests) + '\n';
    msg += '💎 *Зона:* ' + (zoneLabels[data.zone] || data.zone);

    var btn = document.getElementById('submitBtn');
    btn.textContent = 'Надсилаємо...';
    btn.disabled = true;

    fetch('https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text: msg, parse_mode: 'Markdown' })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
        if (res.ok) {
            btn.textContent = '✅ Заявку надіслано!';
            btn.style.background = '#10b981';
            document.getElementById('bookingForm').reset();
            document.querySelectorAll('.form-group').forEach(function(g) { g.classList.remove('success', 'error'); });
            if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            if (tg) tg.close();
        } else { throw new Error(); }
    })
    .catch(function() {
        btn.textContent = '❌ Помилка. Спробуйте ще раз';
        btn.style.background = '#ef4444';
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    })
    .finally(function() {
        setTimeout(function() {
            btn.textContent = 'Надіслати заявку';
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    });
});
