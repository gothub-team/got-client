/** @type {import("eslint").Linter.Config} */
const config = {
    env: {
        browser: true, // Enables browser globals
        node: true, // Enables Node.js globals
        jest: true,
        es2021: true,
    },
    ignorePatterns: ['**/dist/**', '**/node_modules/**'],
    overrides: [
        {
            extends: ['plugin:@typescript-eslint/recommended-requiring-type-checking'],
            files: ['*.ts', '*d.ts', '*.tsx'],
            excludedFiles: ['**/node_modules/**/*', '**/dist/**/*'],
            parserOptions: {
                project: './tsconfig.json',
            },
            rules: {
                '@typescript-eslint/no-explicit-any': ['off'],
                '@typescript-eslint/no-redundant-type-constituents': ['warn'],
            },
        },
        {
            files: ['*.js', '*.jsx'], // Targeting JavaScript and JSX files
            excludedFiles: ['dist/*', 'dist/*'],
            extends: [
                'eslint:recommended', // Basic JavaScript rules
            ],
            parserOptions: {
                project: './tsconfig.json',
            },
            rules: {
                // JavaScript-specific rules, if needed
            },
        },
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/recommended'],
    rules: {
        'prefer-template': 'error',
        '@typescript-eslint/consistent-type-imports': [
            'warn',
            {
                prefer: 'type-imports',
                fixStyle: 'inline-type-imports',
            },
        ],
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-misused-promises': [
            2,
            {
                checksVoidReturn: {
                    attributes: false,
                },
            },
        ],
    },
};

module.exports = config;
