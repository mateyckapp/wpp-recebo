/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@wpp-recebo/eslint-config/nextjs'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
