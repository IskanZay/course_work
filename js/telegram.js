
import { CONFIG } from './config.js';


export const bot = {
    /**
     * Отправить сообщение в Telegram
     * @param {number} chatId - ID чата (обычно CONFIG.CHAT_ID)
     * @param {string} text - Текст сообщения
     * @param {string} parseMode - Форматирование: 'HTML' | 'Markdown' | null
     * @returns {Promise<Object>} Результат: { success: boolean, data?: Object, error?: string }
     */
    async sendMessage(chatId, text, parseMode = null) {
        const url = `${CONFIG.API_BASE_URL}${CONFIG.TELEGRAM_TOKEN}/sendMessage`;
        
        const payload = {
            chat_id: chatId,
            text: text
        };
        
        // Добавляем parse_mode только если указан
        if (parseMode) {
            payload.parse_mode = parseMode;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (data.ok) {
                console.log('Telegram: сообщение отправлено', data.result?.message_id);
                return { success: true, data };
            } else {
                console.error('Telegram ошибка:', data.description);
                return { success: false, error: data.description };
            }
            
        } catch (error) {
            console.error('Telegram сетевая ошибка:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Отправить уведомление о новой регистрации
     * @param {Object} userData - Данные пользователя { name, email, telegram, skills }
     */
    async sendRegistration(userData) {
        const text = `
<b>Новая регистрация на хакатон!</b>

<b>Имя:</b> ${userData.name}
<b>Email:</b> ${userData.email}
<b>Telegram:</b> ${userData.telegram}
<b>Навыки:</b> ${userData.skills || 'не указаны'}
<b>Дата:</b> ${new Date().toLocaleString('ru-RU')}
        `.trim();
        
        return await this.sendMessage(CONFIG.CHAT_ID, text, 'HTML');
    },

    /**
     * Отправить тестовое уведомление
     * @param {string} userName - Имя пользователя для персонализации
     */
    async sendTest(userName) {
        const text = `
<b>Тестовое уведомление</b>

Привет, ${userName}!

Если вы видите это сообщение — 
интеграция с Telegram работает! 

Платформа: HackHub
        `.trim();
        
        return await this.sendMessage(CONFIG.CHAT_ID, text, 'HTML');
    }
};

export default bot;