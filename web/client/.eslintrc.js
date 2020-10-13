module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended'
  ],
  rules: {
    // Errors & best practices
    'no-var': 'error',
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': ['error', { 'argsIgnorePattern': 'next|res|req' }],
    'curly': 'error',

    // ES6
    'arrow-spacing': 'error',
    'arrow-parens': 'error',

    // Style
    'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    'semi': ['error', 'never'],
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'camelcase': 'error',

    // Spacing
    'func-call-spacing': 'error',
    'block-spacing': 'error',
    'object-curly-spacing': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'no-whitespace-before-property': 'error',
    'comma-spacing': 'error',
    'keyword-spacing': 'error',

    // Vue
    'vue/html-closing-bracket-newline': 'off',
    'vue/max-attributes-per-line': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
