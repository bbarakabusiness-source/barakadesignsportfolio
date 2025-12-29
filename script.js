function toggleMode() {
    document.body.classList.toggle('dark-mode');

    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const btn = document.getElementById('toggleMode');
    const logo = document.getElementById('logoImage');

    if (btn) btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    if (logo) logo.src = isDark ? 'Assets/logos/b.png' : 'Assets/logos/a.png';
}

function showSection(id) {
    document.querySelectorAll('.content-section')
        .forEach(section => section.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    showSection('myWork');
});

/* CONTACT FORM */
const form = document.getElementById('contactForm');
const statusMsg = document.getElementById('formStatus');

if (form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const data = new FormData(form);
        if (data.get('company')) return;

        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            form.reset();
            statusMsg.classList.remove('hidden');
        }
    });
}
