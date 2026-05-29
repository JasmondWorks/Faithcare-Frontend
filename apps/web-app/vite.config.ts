import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",
  plugins: [

    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      // Shared UI package
      '@faithcare/ui': path.resolve(__dirname, '../../shared/index.ts'),
    },
    // Force a single copy of these packages across all modules — including any
    // code resolved outside the project root (e.g. ../../shared). Without this,
    // Vite can bundle two React instances, which causes Radix UI's Slot
    // (used by asChild) to fail React.Children.only in production builds.
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
