// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'commonjs',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            // =================== TYPE SAFETY RULES - ALL WARNINGS ===================
            // These help improve code quality but shouldn't block CI
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-call': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-unsafe-return': 'warn',
            '@typescript-eslint/no-explicit-any': 'off', // Allow any without warning

            // =================== ASYNC/PROMISE HANDLING ===================
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-misused-promises': 'warn',
            '@typescript-eslint/unbound-method': 'warn',
            '@typescript-eslint/await-thenable': 'error', // Keep as error - indicates real bug

            // =================== CRITICAL CODE ISSUES - ERRORS ===================
            // These should block CI as they indicate actual problems
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }],
            '@typescript-eslint/require-await': 'warn', // Change to warning - not always a problem

            // =================== GENERAL JAVASCRIPT RULES ===================
            'no-prototype-builtins': 'warn',
            'no-useless-escape': 'warn',
            'no-control-regex': 'warn',
            'no-case-declarations': 'warn',

            // =================== PRETTIER FORMATTING ===================
            "prettier/prettier": ["error", { endOfLine: "auto" }],
        },
    },
    {
        // =================== TEST FILE OVERRIDES ===================
        // More permissive rules for test files since they often need mocking
        files: ['**/*.spec.ts', '**/*.test.ts', '**/test/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
);
