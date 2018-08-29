module.exports = {
  root: true,
  plugins: ['prettier'],
  extends: ['eslint-config-webpack'],
  rules: {
    'arrow-parens': 'off',
    'comma-dangle': [ 'error', 'always-multiline' ],
    'no-empty': [ 'error', { 'allowEmptyCatch': true } ],
    'prettier/prettier': [
      'error',
      { singleQuote: true, trailingComma: 'es5', arrowParens: 'always' },
    ],
  },
};
