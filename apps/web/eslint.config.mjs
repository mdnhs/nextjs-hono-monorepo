import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import boundariesPlugin from 'eslint-plugin-boundaries';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      boundaries: boundariesPlugin,
    },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        {
          mode: 'full',
          type: 'shared',
          pattern: [
            'src/components/**/*',
            'src/contexts/**/*',
            'src/hooks/**/*',
            'src/lib/**/*',
            'src/types/**/*',
            'src/services/**/*',
            'src/validations/**/*',
            'src/styles/**/*',
            'src/proxy.ts',
            'src/instrumentation.ts',
          ],
        },
        {
          mode: 'full',
          type: 'feature',
          capture: ['featureName'],
          pattern: ['src/features/*/**/*'],
        },
        {
          mode: 'full',
          type: 'app',
          capture: ['_', 'fileName'],
          pattern: ['src/app/**/*'],
        },
      ],
    },
    rules: {
      'boundaries/no-unknown': ['error'],
      'boundaries/no-unknown-files': ['error'],
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            // Shared layer can only import from shared
            { from: ['shared'], allow: ['shared'] },
            // Features can import from shared and from other features
            // (for cross-module communication — use sparingly)
            { from: ['feature'], allow: ['shared', 'feature'] },
            // App layer can import from anywhere
            { from: ['app'], allow: ['shared', 'feature'] },
          ],
        },
      ],
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];

export default eslintConfig;
