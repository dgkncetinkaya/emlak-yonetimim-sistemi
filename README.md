# Emlak Yönetim Sistemi

A comprehensive real estate management system built with React 18, Vite, and modern web technologies.

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Chakra UI
- **State Management**: Redux Toolkit, React Query
- **Backend**: Node.js, Express
- **Other**: TypeScript

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend
```

### Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Package Management

### Check for Duplicate Dependencies

To ensure there are no duplicate React packages that could cause context errors:

```bash
npm run check:dedupe
```

This command checks for duplicate installations of `react`, `react-dom`, and `react-redux`. All packages should show as "deduped" to avoid React context issues.

## Project Structure

- `src/` - Frontend source code
  - `components/` - Reusable UI components
  - `pages/` - Page components
  - `store/` - Redux store and slices
  - `context/` - React contexts
  - `routes/` - Route protection components
- `server/` - Backend API server

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
