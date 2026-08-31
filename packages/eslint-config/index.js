const js = require('@eslint/js');
const globals = require('globals');
const stylisticPlugin = require('@stylistic/eslint-plugin');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const importNewlinesPlugin = require('eslint-plugin-import-newlines');
const perfectionistPlugin = require('eslint-plugin-perfectionist');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const simpleImportSortPlugin = require('eslint-plugin-simple-import-sort');
const tailwindcssPlugin = require('eslint-plugin-tailwindcss');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');

const jsFiles = ['**/*.{js,mjs,cjs}'];
const nodeFiles = ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'];
const typescriptFiles = ['**/*.{ts,tsx,mts,cts}'];

const mergeRules = (...ruleSets) => Object.assign({}, ...ruleSets);

module.exports = [
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/.turbo/**',
			'**/.pnpm/**',
			'**/.pnpm-store/**',
			'**/coverage/**',
			'**/.next/**',
			'**/out/**',
		],
	},
	{
		...js.configs.recommended,
		files: jsFiles,
	},
	{
		files: nodeFiles,
		languageOptions: {
			globals: {
				...globals.node,
				...globals.nodeBuiltin,
			},
		},
	},
	{
		files: typescriptFiles,
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2021,
				ecmaFeatures: {
					jsx: true,
				},
				projectService: true,
				sourceType: 'module',
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			'@stylistic': stylisticPlugin,
			import: importPlugin,
			'import-newlines': importNewlinesPlugin,
			perfectionist: perfectionistPlugin,
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
			'simple-import-sort': simpleImportSortPlugin,
			tailwindcss: tailwindcssPlugin,
			'unused-imports': unusedImportsPlugin,
		},
		settings: {
			'import/extensions': ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.d.ts'],
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
			},
			'import/resolver': {
				node: {
					extensions: ['.js', '.mjs', '.json', '.ts', '.d.ts'],
				},
			},
		},
		rules: mergeRules(
			tsPlugin.configs.recommended.rules,
			importPlugin.configs.recommended.rules,
			importPlugin.configs.typescript.rules,
			{
				'@typescript-eslint/ban-ts-comment': 'off',
				'@typescript-eslint/consistent-type-exports': 'error',
				'@stylistic/indent': [
					'error',
					'tab',
					{
						SwitchCase: 1,
					},
				],
				'@stylistic/jsx-quotes': [2, 'prefer-double'],
				'@stylistic/lines-between-class-members': 'off',
				'@stylistic/max-len': 'off',
				'@stylistic/function-call-spacing': 'off',
				'@stylistic/no-tabs': 'off',
				'@stylistic/object-curly-newline': [
					'error',
					{
						ObjectExpression: {
							consistent: true,
							multiline: true,
						},
						ObjectPattern: {
							consistent: true,
							multiline: true,
						},
						ImportDeclaration: {
							consistent: true,
							multiline: true,
							minProperties: 3,
						},
						ExportDeclaration: {
							consistent: true,
							multiline: true,
							minProperties: 3,
						},
					},
				],
				'@stylistic/object-curly-spacing': ['error', 'always'],
				'@stylistic/padded-blocks': ['error', {
					blocks: 'never',
					classes: 'always',
					switches: 'never',
				}],
				'@typescript-eslint/no-empty-interface': 'off',
				'@typescript-eslint/no-non-null-assertion': 'off',
				'@typescript-eslint/no-shadow': 'off',
				'@typescript-eslint/lines-between-class-members': 'off',
				'@typescript-eslint/no-empty-object-type': 'off',
				'arrow-body-style': 'off',
				'class-methods-use-this': 'off',
				'consistent-return': 'off',
				'global-require': 'off',
				'import-newlines/enforce': ['error', { items: 2, 'max-len': 160, semi: true }],
				'import/extensions': 'off',
				'import/no-unresolved': 'off',
				'import/prefer-default-export': 'off',
				indent: 'off',
				'max-classes-per-file': 'off',
				'no-await-in-loop': 'off',
				'no-console': 'off',
				'no-continue': 'off',
				'no-extra-boolean-cast': 'off',
				'no-nested-ternary': 'off',
				'no-param-reassign': 'off',
				'no-plusplus': 'off',
				'no-restricted-globals': 'off',
				'no-restricted-syntax': 'off',
				'no-underscore-dangle': 'off',
				'perfectionist/sort-exports': ['error', { type: 'natural', order: 'asc' }],
				'perfectionist/sort-named-exports': ['error', { type: 'natural', order: 'asc' }],
				'prefer-destructuring': 'off',
				'react-hooks/exhaustive-deps': 'warn',
				'react-hooks/rules-of-hooks': 'error',
				'react/jsx-curly-spacing': ['error', 'never'],
				'react/jsx-tag-spacing': [
					'error',
					{
						closingSlash: 'never',
						beforeSelfClosing: 'never',
						afterOpening: 'never',
						beforeClosing: 'allow',
					},
				],
				'simple-import-sort/imports': 'error',
				'tailwindcss/no-custom-classname': 'off',
				'unused-imports/no-unused-imports': 'error',
			},
		),
	},
];