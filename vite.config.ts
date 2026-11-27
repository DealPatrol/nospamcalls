import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			// The built-in Origin check can't exempt single routes, and Twilio webhooks (form POSTs with no Origin
			// header) must reach /api/burner/{voice,sms,voicemail-callback}. The same check runs in hooks.server.ts
			// for every other route; the Twilio routes are authenticated by X-Twilio-Signature instead.
			csrf: { trustedOrigins: ['*'] }
		})
	]
});
