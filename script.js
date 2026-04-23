/* ============ HEADER HEIGHT VAR ============ */
(function () {
    const header = document.querySelector('header');
    if (!header) return;
    function setHeaderH() {
        document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    }
    setHeaderH();
    window.addEventListener('resize', setHeaderH, { passive: true });
})();

/* ============ INTRO SPLASH ============ */
(function () {
    const overlay = document.getElementById('introOverlay');
    if (!overlay) return;
    overlay.addEventListener('animationend', function () {
        overlay.classList.add('hidden');
    }, { once: true });
})();

/* ============ HAMBURGER MENU ============ */
(function () {
    const header = document.querySelector('header');
    const nav = header && header.querySelector('.navbar');
    const menu = document.querySelector('.menu-mobile');
    if (!nav || !menu) return;

    const btn = document.createElement('button');
    btn.className = 'menu-hamburguesa';
    btn.setAttribute('aria-label', 'Abrir menú');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'menu-mobile-nav');
    btn.innerHTML =
        '<span class="hamburguesa-line"></span>' +
        '<span class="hamburguesa-line"></span>' +
        '<span class="hamburguesa-line"></span>';
    nav.appendChild(btn);
    menu.id = 'menu-mobile-nav';

    function closeMenu() {
        menu.classList.remove('activo');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Abrir menú');
    }

    btn.addEventListener('click', function () {
        const isOpen = menu.classList.toggle('activo');
        btn.setAttribute('aria-expanded', String(isOpen));
        btn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
        if (!header.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('scroll', closeMenu, { passive: true });
}());


/* ============ SCROLL ANIMATIONS (IntersectionObserver) ============ */
(function () {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || !('IntersectionObserver' in window)) {
        document.querySelectorAll('.scroll-animate, .img-animate, .title-animate').forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    function addAndObserve(selector, baseClass, delayClass) {
        document.querySelectorAll(selector).forEach(function (el, i) {
            if (!el.classList.contains(baseClass)) {
                el.classList.add(baseClass);
                if (delayClass) el.classList.add('delay-' + Math.min(i + 1, 4));
            }
            observer.observe(el);
        });
    }

    addAndObserve('.servicios-item', 'scroll-animate', true);
    addAndObserve('.resultado-content', 'scroll-animate', true);
    addAndObserve('.review-card', 'scroll-animate', true);
    addAndObserve('.contact-form-container', 'scroll-animate', false);

    document.querySelectorAll('.scroll-animate, .img-animate, .title-animate').forEach(function (el) {
        observer.observe(el);
    });
}());


/* ============ RESULTADOS OVERLAY (mobile tap toggle) ============ */
(function () {
    var cards = document.querySelectorAll('.resultado-content');

    cards.forEach(function (card) {
        card.addEventListener('pointerup', function (e) {
            if (e.pointerType !== 'touch') return;
            var isActive = card.classList.contains('active');
            cards.forEach(function (c) { c.classList.remove('active'); });
            if (!isActive) card.classList.add('active');
        });
    });

    document.addEventListener('pointerup', function (e) {
        if (e.pointerType !== 'touch') return;
        if (!e.target.closest('.resultado-content')) {
            cards.forEach(function (c) { c.classList.remove('active'); });
        }
    });

    window.addEventListener('scroll', function () {
        cards.forEach(function (c) { c.classList.remove('active'); });
    }, { passive: true });
}());


/* ============ CONTACT FORM ============ */
(function () {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var successBox = document.getElementById('form-success');

    function getError(field) {
        var val = field.value.trim();
        if (field.required && !val) return 'Este campo es obligatorio.';
        if (field.type === 'tel' && val && !/^[\d\s()+\-]{7,16}$/.test(val)) {
            return 'Ingresa un número de teléfono válido.';
        }
        return '';
    }

    function applyValidation(field) {
        var errorEl = document.getElementById(field.id + '-error');
        var msg = getError(field);
        var hasVal = !!field.value.trim();

        field.classList.toggle('is-error', !!msg);
        field.classList.toggle('is-valid', !msg && hasVal);
        if (errorEl) errorEl.textContent = msg;
        return !msg;
    }

    function clearAllErrors() {
        form.querySelectorAll('.is-error').forEach(function (field) {
            field.classList.remove('is-error');
            var errEl = document.getElementById(field.id + '-error');
            if (errEl) errEl.textContent = '';
        });
    }

    window.addEventListener('scroll', clearAllErrors, { passive: true });

    document.addEventListener('click', function (e) {
        if (!form.contains(e.target)) clearAllErrors();
    });

    ['nombre', 'telefono', 'servicio'].forEach(function (id) {
        var field = document.getElementById(id);
        if (!field) return;
        field.addEventListener('blur', function () { applyValidation(field); });
        field.addEventListener('input', function () {
            if (field.classList.contains('is-error')) applyValidation(field);
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var requiredIds = ['nombre', 'telefono', 'servicio'];
        var allValid = requiredIds.every(function (id) {
            var f = document.getElementById(id);
            return f ? applyValidation(f) : true;
        });

        if (!allValid) {
            var firstErr = form.querySelector('.is-error');
            if (firstErr) firstErr.focus();
            return;
        }

        var btn = form.querySelector('.form-submit-btn');
        var btnText = btn.querySelector('.btn-text');
        btn.disabled = true;
        btnText.textContent = 'Enviando…';

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
        })
        .then(function (res) {
            if (res.ok) {
                form.reset();
                form.style.display = 'none';
                successBox.hidden = false;
                successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                throw new Error('server');
            }
        })
        .catch(function () {
            btnText.textContent = 'Error. Inténtalo de nuevo.';
            btn.disabled = false;
            setTimeout(function () { btnText.textContent = 'Solicitar servicio ahora'; }, 3000);
        });
    });
}());
