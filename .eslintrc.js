module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.eslint.config.js',
      },
    },
  },
  globals: {
    Swiper: 'readonly',
  },
  rules: {},
  ignorePatterns: ['assets/*.js'],
};
