import { CONFIG } from './config.js';
class BotClass {
    constructor() {
        this.lastUpdateId = 0;
        this.isPolling = false;
        this.messageHandlers = new Map();
        this.onMessageCallback = null;
    }

    async sendMessage(chatId, text, parseMode = null) {
        const url = `${CONFIG.API_BASE_URL}${CONFIG.TELEGRAM_TOKEN}/sendMessage`;
        const payload = { chat_id: chatId, text: text };
        if (parseMode) payload.parse_mode = parseMode;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return data.ok ? { success: true, data } : { success: false, error: data.description };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async sendRegistration(userData) {
        const text = `<b>Новая регистрация на хакатон!</b>\n\n<b>Имя:</b> ${userData.name}\n<b>Email:</b> ${userData.email}\n<b>Telegram:</b> ${userData.telegram}\n<b>Навыки:</b> ${userData.skills || 'не указаны'}\n<b>Дата:</b> ${new Date().toLocaleString('ru-RU')}`.trim();
        return await this.sendMessage(CONFIG.CHAT_ID, text, 'HTML');
    }

    async sendTest(userName) {
        const text = `<b>Тестовое уведомление</b>\n\nПривет, ${userName}!\nИнтеграция с Telegram работает!\nПлатформа: HackHub`.trim();
        return await this.sendMessage(CONFIG.CHAT_ID, text, 'HTML');
    }

    async getUpdates() {
        const url = `${CONFIG.API_BASE_URL}${CONFIG.TELEGRAM_TOKEN}/getUpdates`;
        const params = new URLSearchParams({
            offset: this.lastUpdateId + 1,
            timeout: '10'
        });

        try {
            const response = await fetch(`${url}?${params}`);
            const data = await response.json();
            return data.ok && data.result ? data.result : [];
        } catch (error) {
            console.error('Ошибка getUpdates:', error);
            return [];
        }
    }

    async processUpdate(update) {
        this.lastUpdateId = update.update_id;

        if (update.message) {
            const msg = update.message;
            const chatId = msg.chat.id;
            const text = msg.text || '';
            const userName = msg.from?.first_name || 'Пользователь';

            if (this.onMessageCallback) {
                this.onMessageCallback({ userName, text, time: new Date().toLocaleTimeString() });
            }

            let handled = false;
            for (const [pattern, handler] of this.messageHandlers) {
                if (text.match(pattern)) {
                    await handler(chatId, text, msg);
                    handled = true;
                    break;
                }
            }

            if (!handled && text.trim() !== '') {
                await this.sendMessage(chatId, `Привет, ${userName}! Я получил твоё сообщение: "${text}". Используй /help для списка команд.`);
            }
        }
    }

    onCommand(pattern, handler) {
        this.messageHandlers.set(pattern, handler);
    }

    setOnMessageCallback(callback) {
        this.onMessageCallback = callback;
    }

    startPolling(interval = 2000) {
        if (this.isPolling) return;
        this.isPolling = true;
        console.log('Telegram Bot: Polling запущен');

        const poll = async () => {
            if (!this.isPolling) return;
            const updates = await this.getUpdates();
            for (const update of updates) {
                await this.processUpdate(update);
            }
            setTimeout(poll, interval);
        };
        poll();
    }

    stopPolling() {
        this.isPolling = false;
        console.log('Telegram Bot: Polling остановлен');
    }

    init() {
        this.onCommand(/^\/start$/i, async (chatId, text, msg) => {
            await this.sendMessage(chatId, `Добро пожаловать в HackHub, ${msg.from.first_name}! Используйте /help.`);
        });

        this.onCommand(/^\/help$/i, async (chatId) => {
            await this.sendMessage(chatId, 'Доступные команды:\n/start - начать\n/help - помощь\n/status - статус платформы');
        });
        
        this.onCommand(/^\/status$/i, async (chatId) => {
            await this.sendMessage(chatId, 'Платформа HackHub работает в штатном режиме. Ожидайте уведомлений.');
        });
    }
}

export const bot = new BotClass();
export default bot;