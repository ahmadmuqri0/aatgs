import { defineConfig } from 'oxfmt';

export default defineConfig({
  printWidth: 100,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  sortImports: true,
  sortTailwindcss: true,
  ignorePatterns: ['dist/**', 'src/components/ui/**', 'src/routeTree.gen.ts'],
});
