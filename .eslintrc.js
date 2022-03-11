'use strict';

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
      project: './tsconfig.json'
  },
  plugins: [
    'eslint-plugin-tsdoc',
  ],
  extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
      'no-unused-vars': 'off',
      'curly': ['error'],
      'lines-around-comment': [ 'error', {
          'beforeBlockComment': true,
          'allowClassStart': true,
          'allowBlockStart': true,
          'allowObjectStart': true,
          'allowArrayStart': true,
      }],
      'padding-line-between-statements': [
          'error',
          { 'blankLine': 'always', 'prev': '*', "next": 'return' },
          { 'blankLine': 'always', 'prev': '*', "next": 'throw' },
          { 'blankLine': 'always', 'prev': '*', "next": 'try' },
          { 'blankLine': 'always', 'prev': '*', "next": 'function' },
      ],
      'prefer-const': ['error'],
      'comma-dangle': ['error', 'always-multiline'],
      '@typescript-eslint/no-unused-vars': [
          'error',
          { 'argsIgnorePattern': '^_' }
      ],
      '@typescript-eslint/class-literal-property-style': [
          'error',
          'fields',
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/prefer-for-of': ['error'],
      '@typescript-eslint/semi': ['error'],
      'max-len': [
          'error',
          { 'code': 140 },
      ],
      '@typescript-eslint/member-delimiter-style': ['error', {
          "multiline": { "delimiter": "comma", "requireLast": true },
          "singleline": { "delimiter": "comma", "requireLast": false },
          "multilineDetection": "last-member"
      }],
      'no-console': ['error'],
      'arrow-parens': ['error', 'as-needed'],
      'arrow-body-style': ['error', 'as-needed'],
      'no-confusing-arrow': ['error'],
      'arrow-spacing': ['error', { "before": true, "after": true }],
      'brace-style': ['error', '1tbs'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'always', { 'objectsInArrays': false }],
      'computed-property-spacing': ['error'],
      'space-in-parens': ['error'],
      'func-call-spacing': ['error'],
      'no-trailing-spaces': ['error'],
      'no-multi-spaces': ['error'],
      'block-spacing': ['error'],
      'key-spacing': ['error'],
      'keyword-spacing': ['error'],
      'no-eq-null': ['error'],
      '@typescript-eslint/explicit-function-return-type': ['error'],
      '@typescript-eslint/naming-convention': [
          "error",
          { "selector": "default", "format": ["camelCase"], "leadingUnderscore": "forbid" },
          { "selector": "variable", "format": ["camelCase"] },
          { "selector": "variable", "modifiers": ["const"], "format": ["camelCase", "UPPER_CASE"] },
          { "selector": "parameter", "format": ["camelCase"], "leadingUnderscore": "allow" },
          { "selector": "memberLike", "modifiers": ["private"], "format": ["camelCase"] },
          { "selector": "enumMember", "format": ["PascalCase"] },
          { "selector": "typeLike", "format": ["PascalCase"] },
          { "selector": "property", "format": ["camelCase", "snake_case"] },
      ],
      'indent': ['error', 2, { "SwitchCase": 1 }],
      '@typescript-eslint/strict-boolean-expressions': ['error', {
          allowNullableString: true,
          allowNullableNumber: true,
          allowNullableBoolean: true
      }],
      'quotes': ['error', 'single', {
          avoidEscape: true,
          allowTemplateLiterals: false
      }],
      'tsdoc/syntax': 'warn',
  },
  overrides: [
      {
          files: ['*.spec.ts'],
          rules: {
              '@typescript-eslint/no-floating-promises': 'off',
              '@typescript-eslint/unbound-method': 'off',
              '@typescript-eslint/explicit-function-return-type': 'off',
              '@typescript-eslint/naming-convention': 'off',
          }
      },
  ],
};
