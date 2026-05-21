function syncThemeUI(isDark) {
    const btn = document.getElementById('toggleMode');
    const logo = document.getElementById('logoImage');

    if (btn) btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    if (logo) {
        logo.src = logo.src.replace(isDark ? /a\.png$/ : /b\.png$/, isDark ? 'b.png' : 'a.png');
    }
}

function formatKES(value) {
    return `KSh ${value.toLocaleString('en-KE')}`;
}

function updateLeadContactLinks() {
    document.querySelectorAll('[data-email-user][data-email-domain]').forEach(node => {
        const user = node.getAttribute('data-email-user');
        const domain = node.getAttribute('data-email-domain');
        const email = `${user}@${domain}`;

        if (node.tagName === 'A') {
            node.href = `mailto:${email}`;
        }
        node.textContent = email;
    });

    document.querySelectorAll('[data-phone-parts]').forEach(node => {
        const parts = node.getAttribute('data-phone-parts').split('|');
        const phone = parts.join('');

        if (node.tagName === 'A') {
            node.href = `tel:${phone.replace(/\s+/g, '')}`;
        }
        node.textContent = phone;
    });
}

function updateQuoteSummary() {
    const summary = document.getElementById('quoteSummary');
    const total = document.getElementById('quoteTotal');
    const totalNote = document.getElementById('quoteTotalNote');
    const hiddenSummary = document.getElementById('serviceSummary');
    const hiddenBudget = document.getElementById('budgetRange');

    if (!summary || !total || !totalNote) return;

    const selected = [...document.querySelectorAll('input[name="services"]:checked')];

    if (!selected.length) {
        summary.innerHTML = '<p>Select one or more services to see an estimated market range.</p>';
        total.textContent = 'KSh 0';
        totalNote.textContent = 'No services selected yet.';
        if (hiddenSummary) hiddenSummary.value = '';
        if (hiddenBudget) hiddenBudget.value = '';
        return;
    }

    let min = 0;
    let max = 0;
    const items = selected.map(input => {
        const card = input.closest('.service-option');
        const service = JSON.parse(card.getAttribute('data-service'));
        min += service.min;
        max += service.max;
        return `<li><strong>${service.label}</strong> <span>${formatKES(service.min)} - ${formatKES(service.max)}</span></li>`;
    });

    summary.innerHTML = `<ul class="quote-list">${items.join('')}</ul>`;
    total.textContent = `${formatKES(min)} - ${formatKES(max)}`;
    totalNote.textContent = 'Indicative Kenya market ranges only. Final pricing depends on scope and turnaround.';
    if (hiddenSummary) hiddenSummary.value = selected.map(input => JSON.parse(input.closest('.service-option').getAttribute('data-service')).label).join(', ');
    if (hiddenBudget) hiddenBudget.value = `${formatKES(min)} - ${formatKES(max)}`;
}

function initQuotePage() {
    const serviceInputs = document.querySelectorAll('input[name="services"]');
    if (!serviceInputs.length) return;

    const params = new URLSearchParams(window.location.search);
    const preselect = params.get('service');
    const selectedValues = preselect ? preselect.split(',') : [];

    serviceInputs.forEach(input => {
        input.addEventListener('change', updateQuoteSummary);
        if (selectedValues.includes(input.value)) {
            input.checked = true;
        }
    });

    updateQuoteSummary();
}

function initFacebookPixel() {
    const config = window.BARAKA_CONFIG || {};
    const pixelId = config.facebookPixelId;

    if (config.environment !== 'production' || !pixelId || window.fbq) return;

    !(function(f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    if (window.location.pathname.includes('/quote-thanks')) {
        window.fbq('track', 'Lead');
    }
}

function toggleMode() {
    document.body.classList.toggle('dark-mode');

    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    syncThemeUI(isDark);
}

function showSection(id) {
    const sections = document.querySelectorAll('.content-section');
    const target = document.getElementById(id);

    if (!sections.length || !target) return;

    sections.forEach(section => section.classList.add('hidden'));
    target.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme !== 'light';
    if (isDark) document.body.classList.add('dark-mode');
    syncThemeUI(isDark);
    updateLeadContactLinks();
    initFacebookPixel();

    const workSection = document.getElementById('myWork');
    if (workSection) {
        const hashTarget = window.location.hash.replace('#', '');
        showSection(hashTarget && document.getElementById(hashTarget) ? hashTarget : 'myWork');
    }

    initQuotePage();
});
