// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'web-build/*'],
  },
]);
