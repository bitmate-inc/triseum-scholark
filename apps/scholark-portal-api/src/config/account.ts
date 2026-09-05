import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export const envSchema = {
	AUTH_CONFIRM_EMAIL_URL: Joi.string().required(),
	AUTH_CONFIRM_EMAIL_FROM: Joi.string().required(),
	AUTH_CONFIRM_EMAIL_SUBJECT: Joi.string().required(),
	AUTH_UPDATE_PASSWORD_URL: Joi.string().required(),
	AUTH_RESET_PASSWORD_EMAIL_FROM: Joi.string().required(),
	AUTH_RESET_PASSWORD_EMAIL_SUBJECT: Joi.string().required(),
};

export default registerAs('account', () => {
	return {
		confirmEmailUrl: process.env.AUTH_CONFIRM_EMAIL_URL,
		confirmEmailFrom: process.env.AUTH_CONFIRM_EMAIL_FROM,
		confirmEmailSubject: process.env.AUTH_CONFIRM_EMAIL_SUBJECT,
		updatePasswordUrl: process.env.AUTH_UPDATE_PASSWORD_URL,
		resetPasswordEmailFrom: process.env.AUTH_RESET_PASSWORD_EMAIL_FROM,
		resetPasswordEmailSubject: process.env.AUTH_RESET_PASSWORD_EMAIL_SUBJECT,
	};
});
