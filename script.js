document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-menu__link, .mobile-menu__btn');
    const bookingForm = document.getElementById('bookingForm');

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    burger.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        burger.classList.toggle('active');
    });

    // Close mobile menu on link click
    mobileLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ===== BOOKING FORM =====
    var TG_BOT_TOKEN = '8640506002:AAGsTPFzI7WsVva381uQmflsB_TAXjJRnfg';
    var TG_CHAT_ID = '-1003831593831';

    // Шостка coordinates: 51.865, 33.468
    var SHOSTKA_LAT = 51.865;
    var SHOSTKA_LNG = 33.468;
    var MAX_DISTANCE_KM = 50;

    var telegramUser = null;
    var userLocation = null;

    // ===== Telegram Login Widget callback =====
    window.onTelegramAuth = function(user) {
        telegramUser = user;
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('formFields').style.display = 'block';

        var userInfo = document.getElementById('userInfo');
        userInfo.innerHTML = '<img src="' + user.photo_url + '" alt="avatar">' +
            '<span>@' + user.username + '</span>' +
            '<span style="color: var(--color-text-secondary); font-weight: 400;">(' + user.first_name + ')</span>';

        checkLocation();
    };

    // ===== Geolocation check =====
    function checkLocation() {
        var locationDiv = document.createElement('div');
        locationDiv.id = 'locationStatus';
        locationDiv.className = 'booking__form-location booking__form-location--pending';
        locationDiv.textContent = '📍 Перевіряємо ваше місцезнаходження...';
        var formFields = document.getElementById('formFields');
        formFields.insertBefore(locationDiv, formFields.firstChild.nextSibling);

        if (!navigator.geolocation) {
            setLocationStatus('fail', '⚠️ Геолокація недоступна. Дозвольте геолокацію для підтвердження.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function(position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                var distance = getDistance(lat, lng, SHOSTKA_LAT, SHOSTKA_LNG);
                userLocation = { lat: lat, lng: lng, distance: Math.round(distance) };

                if (distance <= MAX_DISTANCE_KM) {
                    setLocationStatus('ok', '✅ Ви поруч із Шосткою (' + Math.round(distance) + ' км)');
                } else {
                    setLocationStatus('fail', '⚠️ Ви знаходитесь за ' + Math.round(distance) + ' км від Шостки. Бронювання доступне тільки для місцевих.');
                }
            },
            function(error) {
                setLocationStatus('fail', '⚠️ Дозвольте геолокацію для підтвердження місцезнаходження');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    }

    function setLocationStatus(type, text) {
        var div = document.getElementById('locationStatus');
        if (!div) return;
        div.className = 'booking__form-location booking__form-location--' + type;
        div.textContent = text;
    }

    function getDistance(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // ===== Phone mask =====
    var phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        var digits = e.target.value.replace(/\D/g, '');
        if (digits.length === 0) {
            e.target.value = '';
            return;
        }
        if (digits[0] === '3' && digits[1] === '8') {
            digits = digits.substring(2);
        }
        if (digits[0] === '0') {
            digits = digits.substring(1);
        }
        var formatted = '+38 (0';
        if (digits.length > 0) formatted += digits.substring(0, 2);
        if (digits.length <= 2) {
            e.target.value = formatted;
            return;
        }
        formatted += ') ' + digits.substring(2, 5);
        if (digits.length > 5) formatted += '-' + digits.substring(5, 7);
        if (digits.length > 7) formatted += '-' + digits.substring(7, 9);
        e.target.value = formatted;
    });

    phoneInput.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && e.target.value === '+38 (0)') {
            e.target.value = '';
        }
    });

    // ===== Date mask =====
    var dateInput = document.getElementById('date');
    dateInput.addEventListener('input', function(e) {
        var digits = e.target.value.replace(/\D/g, '');
        if (digits.length === 0) {
            e.target.value = '';
            return;
        }
        var formatted = digits.substring(0, 2);
        if (digits.length > 2) formatted += '.' + digits.substring(2, 4);
        if (digits.length > 4) formatted += '.' + digits.substring(4, 8);
        e.target.value = formatted;
        if (e.target.closest('.booking__form-group').classList.contains('error')) validateDate();
    });

    // ===== Validation =====
    function showError(fieldId, message) {
        var el = document.getElementById(fieldId);
        if (!el) return;
        var group = el.closest('.booking__form-group');
        var error = document.getElementById(fieldId + 'Error');
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (error) error.textContent = message;
    }

    function clearError(fieldId) {
        var el = document.getElementById(fieldId);
        if (!el) return;
        var group = el.closest('.booking__form-group');
        var error = document.getElementById(fieldId + 'Error');
        if (group) group.classList.remove('error');
        if (error) error.textContent = '';
    }

    function markSuccess(fieldId) {
        var el = document.getElementById(fieldId);
        if (!el) return;
        var group = el.closest('.booking__form-group');
        if (group) group.classList.remove('error');
        if (group) group.classList.add('success');
    }

    function validateName() {
        var val = document.getElementById('name').value.trim();
        if (val.length < 2) {
            showError('name', 'Мінімум 2 символи');
            return false;
        }
        if (!/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\-\s']+$/.test(val)) {
            showError('name', 'Тільки літери, дефіс або апостроф');
            return false;
        }
        clearError('name');
        markSuccess('name');
        return true;
    }

    function validatePhone() {
        var val = document.getElementById('phone').value.replace(/\D/g, '');
        if (val.length < 10) {
            showError('phone', 'Введіть повний номер: +38 (0XX) XXX-XX-XX');
            return false;
        }
        if (val.length > 12) {
            showError('phone', 'Надто багато цифр');
            return false;
        }
        clearError('phone');
        markSuccess('phone');
        return true;
    }

    function validateDate() {
        var val = document.getElementById('date').value;
        if (!val) {
            showError('date', 'Оберіть дату');
            return false;
        }
        var parts = val.split('.');
        if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
            showError('date', 'Формат: ДД.ММ.РРРР');
            return false;
        }
        var day = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10);
        var year = parseInt(parts[2], 10);
        if (month < 1 || month > 12) {
            showError('date', 'Невірний місяць (01-12)');
            return false;
        }
        var daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
            showError('date', 'Невірний день для цього місяця');
            return false;
        }
        if (year < 2025 || year > 2030) {
            showError('date', 'Рік має бути від 2025 до 2030');
            return false;
        }
        var selected = new Date(year, month - 1, day);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
            showError('date', 'Дата не може бути в минулому');
            return false;
        }
        var maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        maxDate.setHours(0, 0, 0, 0);
        if (selected > maxDate) {
            showError('date', 'Максимум 3 місяці вперед');
            return false;
        }
        clearError('date');
        markSuccess('date');
        return true;
    }

    document.getElementById('name').addEventListener('blur', validateName);
    document.getElementById('phone').addEventListener('blur', validatePhone);
    document.getElementById('date').addEventListener('blur', validateDate);

    document.getElementById('name').addEventListener('input', function() {
        if (this.closest('.booking__form-group').classList.contains('error')) validateName();
    });
    document.getElementById('phone').addEventListener('input', function() {
        if (this.closest('.booking__form-group').classList.contains('error')) validatePhone();
    });

    // ===== Submit =====
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!telegramUser) {
            var authError = document.getElementById('authError');
            authError.textContent = 'Увійдіть через Telegram';
            return;
        }

        var locationStatus = document.getElementById('locationStatus');
        if (locationStatus && locationStatus.classList.contains('booking__form-location--fail')) {
            alert('Бронювання доступне тільки для жителів Шостки та найближчих районів');
            return;
        }

        var isNameValid = validateName();
        var isPhoneValid = validatePhone();
        var isDateValid = validateDate();

        if (!isNameValid || !isPhoneValid || !isDateValid) return;

        var formData = new FormData(bookingForm);
        var data = Object.fromEntries(formData.entries());

        var zoneLabels = { standard: 'Стандарт', vip: 'VIP', vvip: 'VVIP' };
        var guestLabels = { '1-2': '1-2 особи', '3-5': '3-5 осіб', '6-10': '6-10 осіб', '10+': '10+ осіб' };

        var locationText = userLocation ? userLocation.distance + ' км від Шостки' : 'невідоме';

        var message = '🎾 *Нова заявка на бронювання*\n\n' +
            '🆔 *Telegram:* @' + telegramUser.username + ' (ID: ' + telegramUser.id + ')\n' +
            '👤 *Ім\'я:* ' + data.name.trim() + '\n' +
            '📞 *Телефон:* ' + data.phone + '\n' +
            '📅 *Дата:* ' + data.date + '\n' +
            '👥 *Гості:* ' + (guestLabels[data.guests] || data.guests) + '\n' +
            '💎 *Зона:* ' + (zoneLabels[data.zone] || data.zone) + '\n' +
            '📍 *Місцезнаходження:* ' + locationText;

        var btn = bookingForm.querySelector('.booking__form-btn');
        var originalText = btn.textContent;
        btn.textContent = 'Надсилаємо...';
        btn.disabled = true;

        fetch('https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        })
        .then(function(response) { return response.json(); })
        .then(function(result) {
            if (result.ok) {
                btn.textContent = 'Заявку надіслано!';
                btn.style.background = '#10b981';
                bookingForm.reset();
                document.querySelectorAll('.booking__form-group').forEach(function(g) {
                    g.classList.remove('success', 'error');
                });
            } else {
                throw new Error('API error');
            }
        })
        .catch(function() {
            btn.textContent = 'Помилка. Спробуйте ще раз';
            btn.style.background = '#ef4444';
        })
        .finally(function() {
            setTimeout(function() {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        });
    });

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
});
