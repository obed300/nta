import { HoudiniClient } from '$houdini';
// import { graphqlServerUrl, wsGraphqlServerUrl } from '$data/env.svelte';

import { createClient } from 'graphql-ws';
import { subscription } from '$houdini/plugins';

import { graphqlServerUrl, wsGraphqlServerUrl } from '$data/env.svelte';

let token = '';
let serverUrl = '';
let wsUrl = '';
/* @type { import('$houdini').ClientPlugin } */
const setUrl = () => {
	return {
		start(context, { client, next }) {
			if (client.url !== graphqlServerUrl) {
				console.log('Updating client URL:', client.url, '→', graphqlServerUrl);
				client.url = graphqlServerUrl;
			}
			next(context);
		}
	};
};
export default new HoudiniClient({
	url: serverUrl,
	plugins: [
		setUrl,
		subscription(() =>
			createClient({
				url: wsGraphqlServerUrl,
				connectionParams: () => {
					return {
						headers: {
							Authorization: token ? `Bearer ${token}` : '',
							'GraphQL-Preflight': '1'
						}
					};
				}
			})
		)
	],
	fetchParams() {
		return {
			headers: {
				Authorization: token ? `Bearer ${token}` : '',
				'GraphQL-Preflight': '1'
			}
		};
	}
});
