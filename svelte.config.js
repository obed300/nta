import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		alias: {
			$cmps: path.resolve('.', 'src', 'components'),
			$data: path.resolve('.', 'src', 'data'),
			$houdini: path.resolve('.', '$houdini')
		},
		adapter: adapter({
			fallback: 'index.html'
		}),
		prerender: {
			handleHttpError: 'warn' // ignore 404s instead of crashing
		}
	}
};

export default config;
