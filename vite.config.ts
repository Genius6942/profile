import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
// @ts-expect-error balls
import path from 'node:path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib/'),
			$css: path.resolve('./src/css/'),
			$: path.resolve('./src/')
		}
	}
});
