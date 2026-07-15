module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    process: 'readonly',
  },
  rules: {
    // PropTypes are currently not used in this legacy codebase.
    'react/prop-types': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.{js,jsx}'],
      env: {
        jest: true,
      },
      globals: {
        vi: 'readonly',
      },
    },
  ],
  ignorePatterns: ['dist/', 'build/'],
};