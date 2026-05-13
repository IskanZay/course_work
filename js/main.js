import { RegisterForm, Dashboard } from './forms.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('HackHub Platform initialized');

    const currentPage = window.location.pathname;

    if (currentPage.includes('register.html')) {
        console.log('Initializing registration form...');
        RegisterForm.init();
    }

    if (currentPage.includes('dashboard.html')) {
        console.log('Initializing dashboard...');
        Dashboard.init();
    }

    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('change', () => {
            window.onbeforeunload = () => {
                return 'У вас есть несохраненные изменения. Покинуть страницу?';
            };
        });

        form.addEventListener('submit', () => {
            window.onbeforeunload = null;
        });
    });
});

window.HackHub = {
    RegisterForm,
    Dashboard
};

export default { RegisterForm, Dashboard };