
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const PORT = 3000;

export default defineConfig({
  plugins: [react()],
  server: {
    port: PORT,
    open: true,
    historyApiFallback: true,
  },
});

console.log(`Vite server is running on http://localhost:${PORT}`);
