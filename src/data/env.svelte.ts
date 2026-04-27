export const serverUrl = $state(import.meta.env.VITE_SERVER_URL);
export const graphqlServerUrl = $state(`${serverUrl}/graphql`);
export const wsGraphqlServerUrl = $state(
	graphqlServerUrl.startsWith('https')
		? graphqlServerUrl.replaceAll('https', 'wss')
		: graphqlServerUrl.replaceAll('http', 'ws')
);
