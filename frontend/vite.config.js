import { ViteAliases } from "vite-aliases";
import { defineConfig } from "vite";
import eslintPlugin from "@nabla/vite-plugin-eslint";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		// For more information
		// https://github.com/subwaytime/vite-aliases
		ViteAliases({ prefix: "#" }),
		eslintPlugin()
	]
});
