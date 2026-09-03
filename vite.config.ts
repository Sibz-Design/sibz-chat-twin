import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,

    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },

  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // The portfolio knowledge base is shared verbatim between the browser and
      // the Supabase edge function. It lives under supabase/functions/_shared so
      // that `supabase functions deploy` bundles it; this alias lets frontend
      // code import it as `@profile` without reaching across the tree by hand.
      "@profile": path.resolve(__dirname, "./supabase/functions/_shared/profile"),
    },
  },
}));
