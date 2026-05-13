import { Validators } from './validators.js';
import { UserAPI, HackathonAPI } from './api.js';
import { bot } from './telegram.js';
import { UI } from './ui.js';
import { CONFIG } from './config.js'

// Обработчик формы регистрации
export const RegisterForm = {
    init() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(form);
        });


        this.addRealTimeValidation(form);
    },

    async handleSubmit(form) {
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            telegram: document.getElementById('telegram').value.trim(),
            skills: document.getElementById('skills').value.trim()
        };


        const validation = Validators.validateRegisterForm(formData);
        if (!validation.isValid) {
            UI.showError('message', validation.errors.join(', '));
            return;
        }


        UI.showLoading('message', 'Регистрация...');

        try {
            const saved = UserAPI.save(formData);
            if (!saved) {
                throw new Error('Не удалось сохранить данные');
            }

            // Увед в тг
            const telegramResult = await bot.sendRegistration(formData);
            
            if (telegramResult.success) {
                UI.showSuccess('message', 'Регистрация успешна! Переходим в личный кабинет...');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                UI.showSuccess('message', 'Регистрация успешна, но уведомление не отправлено');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Registration error:', error);
            UI.showError('message', 'Ошибка: ' + error.message);
        }
    },

    addRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                input.classList.remove('error');
            });
        });
    },

    validateField(input) {
        const value = input.value.trim();
        let isValid = true;

        switch(input.id) {
            case 'name':
                isValid = Validators.isValidName(value);
                break;
            case 'email':
                isValid = Validators.isValidEmail(value);
                break;
            case 'telegram':
                isValid = Validators.isValidTelegram(value);
                break;
            case 'skills':
                isValid = Validators.isValidSkills(value);
                break;
        }

        if (!isValid && value.length > 0) {
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }

        return isValid;
    }
};

// Обработчик личного кабинета
export const Dashboard = {
    async init() {
        const userInfo = document.getElementById('userInfo');
        if (!userInfo) return;

        await this.loadUserData();
        this.initNotificationButton();
        this.renderHackathons();
    },

    async loadUserData() {
        const user = UserAPI.get();
        
        if (!user) {
            window.location.href = 'register.html';
            return;
        }

        UI.updateText('userName', user.name);
        UI.updateText('userEmail', user.email);
        UI.updateText('userTelegram', user.telegram);
        UI.updateText('userSkills', user.skills);


        const regDate = document.getElementById('registrationDate');
        if (regDate && user.registeredAt) {
            UI.updateText('registrationDate', UI.formatDate(user.registeredAt));
        }
    },

    initNotificationButton() {
        const notifyBtn = document.getElementById('notifyBtn');
        if (!notifyBtn) return;

        notifyBtn.addEventListener('click', async () => {
            const user = UserAPI.get();
            if (!user) return;

            notifyBtn.disabled = true;
            UI.updateText('notifyStatus', 'Отправка...');

            try {
                const result = await bot.sendTest(user.name);
                
                if (result.success) {
                    UI.updateText('notifyStatus', 'Уведомление отправлено!');
                    UI.addClass('notifyStatus', 'success');
                } else {
                    UI.updateText('notifyStatus', 'Ошибка: ' + result.error);
                    UI.addClass('notifyStatus', 'error');
                }
            } catch (error) {
                UI.updateText('notifyStatus', 'Ошибка соединения');
                UI.addClass('notifyStatus', 'error');
            }

            notifyBtn.disabled = false;

            setTimeout(() => {
                UI.removeClass('notifyStatus', 'success');
                UI.removeClass('notifyStatus', 'error');
            }, 3000);
        });
    },

    renderHackathons() {
        const hackathons = HackathonAPI.getAll();
        const container = document.querySelector('.my-hackathons');
        
        if (!container) return;

        const user = UserAPI.get();
        const registeredIds = user?.registeredHackathons || [];

        const html = hackathons.map(hack => {
            const isRegistered = registeredIds.includes(hack.id);
            const statusClass = isRegistered ? 'registered' : '';
            const statusText = isRegistered ? 'Зарегистрирован' : 'Доступна регистрация';
            
            return `
                <div class="event-card ${statusClass}">
                    <h4>${hack.title}</h4>
                    <p>${hack.date} | ${hack.duration}</p>
                    <p>${hack.description}</p>
                    <p>Участников: ${hack.participants}</p>
                    <p class="status">${statusText}</p>
                    ${!isRegistered ? `<button class="btn-small" onclick="RegisterHackathon.register(${hack.id})">Зарегистрироваться</button>` : ''}
                </div>
            `;
        }).join('');

        UI.updateHTML('hackathonsList', html);
    }
};

// Регистрация 
export const RegisterHackathon = {
    async register(hackathonId) {
        const user = UserAPI.get();
        if (!user) {
            alert('Сначала зарегистрируйтесь!');
            window.location.href = 'register.html';
            return;
        }

        const success = HackathonAPI.register(hackathonId);
        
        if (success) {
            const hackathon = HackathonAPI.getById(hackathonId);
            
            // Увед
            await bot.sendMessage(
                CONFIG.CHAT_ID,
                `${user.name} зарегистрировался на хакатон "${hackathon.title}"!`
            );

            alert('Вы успешно зарегистрировались!');
            Dashboard.renderHackathons();
        } else {
            alert('Вы уже зарегистрированы на этот хакатон');
        }
    }
};

export default { RegisterForm, Dashboard, RegisterHackathon };