// ===== Telegram detection =====
var tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
var isMiniApp = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
var TG_BOT_TOKEN = '8640506002:AAGsTPFzI7WsVva381uQmflsB_TAXjJRnfg';
var TG_CHAT_ID = '-1003831593831';

// ===== Init Telegram Mini App =====
if (tg && isMiniApp) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#000000');
    tg.setBackgroundColor('#000000');
    var user = tg.initDataUnsafe.user;
    var userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv) {
        userInfoDiv.style.display = 'flex';
        userInfoDiv.innerHTML = '<img src="' + (user.photo_url || '') + '" alt="avatar" onerror="this.style.display=\'none\'">' +
            '<span>@' + (user.username || user.first_name) + '</span>';
    }
    var nameInput = document.getElementById('name');
    if (nameInput && user.first_name) {
        nameInput.value = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    }
}

// ===== Header scroll effect =====
window.addEventListener('scroll', function() {
    var header = document.getElementById('header');
    if (header) {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// ===== Mobile menu =====
var burger = document.getElementById('burger');
var mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
    burger.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        burger.classList.toggle('active');
    });
    document.querySelectorAll('.mobile-menu__link, .mobile-menu__btn').forEach(function(link) {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ===== Smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ===== Phone mask =====
var phoneInput = document.getElementById('phone');
if (phoneInput) {
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
}

// ===== Date mask =====
var dateInput = document.getElementById('date');
if (dateInput) {
    dateInput.addEventListener('input', function(e) {
        var digits = e.target.value.replace(/\D/g, '');
        if (digits.length === 0) { e.target.value = ''; return; }
        var f = digits.substring(0, 2);
        if (digits.length > 2) f += '.' + digits.substring(2, 4);
        if (digits.length > 4) f += '.' + digits.substring(4, 8);
        e.target.value = f;
        if (e.target.closest('.booking__form-group').classList.contains('error')) validateDate();
    });
}

// ===== Validation =====
function showError(fieldId, msg) {
    var el = document.getElementById(fieldId);
    if (!el) return;
    var g = el.closest('.booking__form-group');
    var err = document.getElementById(fieldId + 'Error');
    if (g) g.classList.add('error');
    if (g) g.classList.remove('success');
    if (err) err.textContent = msg;
}

function clearError(fieldId) {
    var el = document.getElementById(fieldId);
    if (!el) return;
    var g = el.closest('.booking__form-group');
    var err = document.getElementById(fieldId + 'Error');
    if (g) g.classList.remove('error');
    if (err) err.textContent = '';
}

function markOk(fieldId) {
    var el = document.getElementById(fieldId);
    if (!el) return;
    var g = el.closest('.booking__form-group');
    if (g) g.classList.remove('error');
    if (g) g.classList.add('success');
}

function validateName() {
    var v = document.getElementById('name').value.trim();
    if (v.length < 2) { showError('name', 'Мінімум 2 символи'); return false; }
    if (!/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\-\s']+$/.test(v)) { showError('name', 'Тільки літери, дефіс або апостроф'); return false; }
    clearError('name'); markOk('name'); return true;
}

function validatePhone() {
    var v = document.getElementById('phone').value.replace(/\D/g, '');
    if (v.length < 10) { showError('phone', 'Введіть повний номер: +38 (0XX) XXX-XX-XX'); return false; }
    if (v.length > 12) { showError('phone', 'Надто багато цифр'); return false; }
    clearError('phone'); markOk('phone'); return true;
}

function validateDate() {
    var v = document.getElementById('date').value;
    if (!v) { showError('date', 'Оберіть дату'); return false; }
    var p = v.split('.');
    if (p.length !== 3 || p[0].length !== 2 || p[1].length !== 2 || p[2].length !== 4) { showError('date', 'Формат: ДД.ММ.РРРР'); return false; }
    var d = parseInt(p[0], 10), m = parseInt(p[1], 10), y = parseInt(p[2], 10);
    if (m < 1 || m > 12) { showError('date', 'Невірний місяць (01-12)'); return false; }
    var dim = new Date(y, m, 0).getDate();
    if (d < 1 || d > dim) { showError('date', 'Невірний день для цього місяця'); return false; }
    if (y < 2025 || y > 2030) { showError('date', 'Рік має бути від 2025 до 2030'); return false; }
    var sel = new Date(y, m - 1, d), now = new Date(); now.setHours(0,0,0,0);
    if (sel < now) { showError('date', 'Дата не може бути в минулому'); return false; }
    var max = new Date(); max.setMonth(max.getMonth() + 3); max.setHours(0,0,0,0);
    if (sel > max) { showError('date', 'Максимум 3 місяці вперед'); return false; }
    clearError('date'); markOk('date'); return true;
}

var nameEl = document.getElementById('name');
var phoneEl = document.getElementById('phone');
var dateEl = document.getElementById('date');
if (nameEl) { nameEl.addEventListener('blur', validateName); nameEl.addEventListener('input', function() { if (this.closest('.booking__form-group').classList.contains('error')) validateName(); }); }
if (phoneEl) { phoneEl.addEventListener('blur', validatePhone); phoneEl.addEventListener('input', function() { if (this.closest('.booking__form-group').classList.contains('error')) validatePhone(); }); }
if (dateEl) { dateEl.addEventListener('blur', validateDate); }

// ===== Submit =====
var bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var n = validateName(), p = validatePhone(), d = validateDate();
        if (!n || !p || !d) {
            if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
            return;
        }

        var formData = new FormData(bookingForm);
        var data = Object.fromEntries(formData.entries());
        var zoneLabels = { standard: 'Стандарт', vip: 'VIP', vvip: 'VVIP' };
        var guestLabels = { '1-2': '1-2 особи', '3-5': '3-5 осіб', '6-10': '6-10 осіб', '10+': '10+ осіб' };

        var msg = '🎾 *Нова заявка на бронювання*\n\n';
        if (isMiniApp && tg.initDataUnsafe.user) {
            var u = tg.initDataUnsafe.user;
            msg += '🆔 *Telegram:* @' + (u.username || 'немає') + ' (ID: ' + u.id + ')\n';
        }
        msg += '👤 *Ім\'я:* ' + data.name.trim() + '\n';
        msg += '📞 *Телефон:* ' + data.phone + '\n';
        msg += '📅 *Дата:* ' + data.date + '\n';
        msg += '👥 *Гості:* ' + (guestLabels[data.guests] || data.guests) + '\n';
        msg += '💎 *Зона:* ' + (zoneLabels[data.zone] || data.zone);

        var btn = document.getElementById('submitBtn');
        var originalText = btn.textContent;
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
                bookingForm.reset();
                document.querySelectorAll('.booking__form-group').forEach(function(g) { g.classList.remove('success', 'error'); });
                if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
                if (isMiniApp) setTimeout(function() { tg.close(); }, 2000);
            } else { throw new Error(); }
        })
        .catch(function() {
            btn.textContent = '❌ Помилка. Спробуйте ще раз';
            btn.style.background = '#ef4444';
            if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        })
        .finally(function() {
            setTimeout(function() {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        });
    });
}

// ===== Intersection Observer for animations =====
var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.about__card, .event-card, .gallery__item, .contacts__item').forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

var style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);
