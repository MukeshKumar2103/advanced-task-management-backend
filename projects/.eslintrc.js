module.exports = {
  env: {
    node: true,
    es6: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // Enable eslint-plugin-prettier and display prettier errors as ESLint errors
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "semi": ["error", "never"]
  },
};
