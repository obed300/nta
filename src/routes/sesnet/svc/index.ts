import { CreateMemberStore, type CreateMemberInput } from '$houdini';
import { callResult, gqlError } from '$lib/shared';

export async function createMember(input: CreateMemberInput) {
	try {
		const ret = await new CreateMemberStore().mutate({ input });
		return callResult(ret, ret.data?.createMember.callResult as any);
	} catch (error) {
		return gqlError(error);
	}
}
