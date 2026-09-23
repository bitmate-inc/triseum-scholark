import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from '@repo/eslint-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
	{
		ignores: ['dist/**'],
	},
	...config,
	{
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: __dirname,
			},
		},
	},
];