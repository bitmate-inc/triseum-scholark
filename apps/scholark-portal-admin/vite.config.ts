import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const { API_SERVER_BASE_URL } = loadEnv(mode, process.cwd(), 'API_SERVER_BASE_URL');

	return {
		plugins: [react(), tailwindcss()],
		server: {
			port: 3002,
			proxy: {
				'/api': {
					changeOrigin: true,
					target: API_SERVER_BASE_URL || 'http://localhost:3001',
				},
			},
		},
	};
});