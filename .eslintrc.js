module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      './tsconfig.json',
      './tsconfig.eslint.json',
    ],
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb-typescript',
  ],
  rules: {
    'no-console': 'off',
    'react/jsx-filename-extension': [0],
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
};
