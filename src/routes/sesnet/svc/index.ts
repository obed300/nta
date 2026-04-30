import { CreateMemberStore, ScopeOfServicesStore, type CreateMemberInput } from '$houdini';
import { callResult, gqlError, queryResult } from '$lib/shared';

export async function createMember(input: CreateMemberInput) {
	try {
		const ret = await new CreateMemberStore().mutate({ input });
		return callResult(ret, ret.data?.createMember.callResult as any);
	} catch (error) {
		return gqlError(error);
	}
}


export async function readScopeOfServices(
	
) {
	try {
		const ret = await new ScopeOfServicesStore().fetch();
		return queryResult(ret, ret.data?.scopeOfServices);
	} catch (error) {
		return gqlError(error);
	}
}
