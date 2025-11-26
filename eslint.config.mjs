import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // Browser globals - DOM
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        
        // Browser globals - Timing
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        
        // Browser globals - Events
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        
        // Browser globals - Web APIs
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        
        // Node.js globals
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        global: 'readonly',
        globalThis: 'readonly',
        
        // Jest globals
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        
        // External APIs
        google: 'readonly',
        bootstrap: 'readonly',
        
        // Your application globals
        currentCityName: 'writable',
        markers: 'writable',
        infoWindows: 'writable',
        currentSearchType: 'writable',
        map: 'writable',
        performSearch: 'writable'
      }
    },
    rules: {
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }]
    }
  },
  {
    ignores: [
      'node_modules/**',
      'package-lock.json',
      '**/*.css',
      '**/*.min.js',
      '**/*.min.css',
      'dist/**',
      'build/**',
      'coverage/**',
      '.git/**'
    ]
  }
];
