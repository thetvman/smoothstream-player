
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    minify: 'terser', // Use terser for better minification
    sourcemap: false, // Disable sourcemaps in production for better performance
    chunkSizeWarningLimit: 1000, // Increase warning limit for larger chunks
    // Set explicit build target
    target: 'es2015',
    // Ensure the build is completing
    reportCompressedSize: false,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add base path configuration
  base: '/',
}));
