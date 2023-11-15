// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/** @type {import("eslint").Linter.Config} */
const config = {
    overrides: [
        {
            extends: ['plugin:@typescript-eslint/recommended-requiring-type-checking'],
            files: ['*.ts', '*d.ts', '*.tsx'],
            parserOptions: {
                project: path.join(__dirname, 'tsconfig.json'),
            },
            rules: {
                '@typescript-eslint/no-explicit-any': ['off'],
                '@typescript-eslint/no-redundant-type-constituents': ['warn'],
            },
        },
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: path.join(__dirname, 'tsconfig.json'),
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
