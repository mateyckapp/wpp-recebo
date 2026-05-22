/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@wpp-recebo/eslint-config/nestjs'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
