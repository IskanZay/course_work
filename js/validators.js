class ValidatorsClass {
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidName(name) {
        return name.length >= 2 && name.length <= 50;
    }

    isValidTelegram(username) {
        const re = /^@?[\w]{5,32}$/;
        return re.test(username);
    }

    isValidSkills(skills) {
        return skills.length > 0 && skills.length <= 200;
    }

    validateRegisterForm(data) {
        const errors = [];

        if (!this.isValidName(data.name)) {
            errors.push('Имя должно быть от 2 до 50 символов');
        }

        if (!this.isValidEmail(data.email)) {
            errors.push('Введите корректный email');
        }

        if (!this.isValidTelegram(data.telegram)) {
            errors.push('Некорректный Telegram username');
        }

        if (!this.isValidSkills(data.skills)) {
            errors.push('Навыки должны быть от 1 до 200 символов');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

export const Validators = new ValidatorsClass();
export default Validators;