import { CONFIG } from './config.js';

class StorageClass {
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
}

class UserAPIClass {
    constructor() {
        this.storage = new StorageClass();
    }

    save(userData) {
        userData.registeredAt = new Date().toISOString();
        userData.id = Date.now();
        return this.storage.set(CONFIG.STORAGE_KEYS.USER, userData);
    }

    get() {
        return this.storage.get(CONFIG.STORAGE_KEYS.USER);
    }

    update(updates) {
        const user = this.get();
        if (!user) return false;
        const updatedUser = { ...user, ...updates };
        return this.save(updatedUser);
    }

    logout() {
        return this.storage.remove(CONFIG.STORAGE_KEYS.USER);
    }
}

class HackathonAPIClass {
    constructor() {
        this.storage = new StorageClass();
        this.userAPI = new UserAPIClass();
    }

    getAll() {
        const hackathons = this.storage.get(CONFIG.STORAGE_KEYS.HACKATHONS);
        return hackathons || this.getDefaultHackathons();
    }

    getDefaultHackathons() {
        const defaultHackathons = [
            {
                id: 1,
                title: 'AI Innovation Hack',
                date: '15 мая 2026',
                duration: '48 часов',
                description: 'Разработка решений на базе искусственного интеллекта',
                status: 'active',
                participants: 156
            },
            {
                id: 2,
                title: 'Web Dev Challenge',
                date: '22 мая 2026',
                duration: '24 часа',
                description: 'Создание веб-приложений с современным стеком',
                status: 'upcoming',
                participants: 89
            },
            {
                id: 3,
                title: 'Mobile First',
                date: '5 июня 2026',
                duration: '36 часов',
                description: 'Разработка мобильных приложений',
                status: 'upcoming',
                participants: 67
            }
        ];
        
        this.storage.set(CONFIG.STORAGE_KEYS.HACKATHONS, defaultHackathons);
        return defaultHackathons;
    }

    getById(id) {
        const hackathons = this.getAll();
        return hackathons.find(h => h.id === id);
    }

    register(hackathonId) {
        const user = this.userAPI.get();
        if (!user) return false;

        if (!user.registeredHackathons) {
            user.registeredHackathons = [];
        }

        if (!user.registeredHackathons.includes(hackathonId)) {
            user.registeredHackathons.push(hackathonId);
            this.userAPI.save(user);
            return true;
        }

        return false;
    }
}

export const Storage = new StorageClass();
export const UserAPI = new UserAPIClass();
export const HackathonAPI = new HackathonAPIClass();

export default { Storage, UserAPI, HackathonAPI };