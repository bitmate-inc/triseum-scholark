import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from '@repo/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
	{
		ignores: ['build/**', 'next-env.d.ts'],
	},
	...config,
	{
		plugins: {
			'@next/next': nextPlugin,
		},
		rules: {
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules,
		},
	},
	{
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: __dirname,
			},
		},
	},
	{
		files: ['feature/api/client/api/generated-api.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
];
