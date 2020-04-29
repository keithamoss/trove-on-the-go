module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-typescript',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'react-app',
    'prettier/@typescript-eslint'
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  "rules": {
    // Disable <Fragment> => <> replacement. Feel free to change
    "react/jsx-fragments": "off",
    // Disable prefer default export
    "import/prefer-default-export": "off",
    // Don't bother us about long lines
    // Note: Couldn't set line length, just off/on. Seemed to think I was using an older version of eslint before the more advanced config options came in. Weird, but didn't bother investigating.
    "max-len": "off",
    // Because I like spreading props on the PhotoPlaceholder component
    "react/jsx-props-no-spreading": "off"
  }
};