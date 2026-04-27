import type { QueryResult } from 'houdini';

export interface ICallResult<T> {
	success: boolean;
	message: string | null;
	data: T | undefined;
}
export interface INoDataCallResult {
	success: boolean;
	message: string | null;
}
export interface IOk {
	success: true;
	message: string;
	code?: string;
}
export interface IOkResult<T> {
	success: true;
	message: string;
	data: T;
}
export interface IFailureResult {
	success: false;
	message: string;
}
export interface ICallResult2<T> {
	success: boolean;
	message: string | undefined | null;
	result: T | undefined | null;
	code: number | undefined | null;
}
export interface IOkResult2<T> {
	success: true;
	message: string | undefined;
	result: T;
}

export interface IErrorResult {
	success: false;
	message: string;
	code: number;
}

export function result<R, T>(rawResponse: QueryResult<R>, data: ICallResult2<T>) {
	if (rawResponse.errors) {
		return <ICallResult2<T>>{
			success: false,
			message: rawResponse.errors.map((x) => x.message).join('.\n')
		};
	}
	if (data.success) return data as IOkResult2<T>;
	return data as IErrorResult;
}
export function gqlResponse<R, T>(rawResponse: QueryResult<R>, data: T) {
	if (rawResponse.errors) {
		return <ICallResult2<T>>{
			success: false,
			message: rawResponse.errors.map((x) => x.message).join('.\n')
		};
	}
	return <ICallResult2<T>>{ success: true, result: data };
}
// type NonNullable<T> = Exclude<T, null | undefined>
export function gqlCallResult<R, T>(
	rawResponse: QueryResult<R>,
	result: ICallResult<T> | undefined
) {
	if (rawResponse.errors) {
		return <IFailureResult>{
			success: false,
			message: rawResponse.errors.map((x) => x.message).join('.\n')
		};
	}
	if (!result) {
		return <IFailureResult>{ success: false, message: 'No valid response was received' };
	}
	if (!result.success) return result as IFailureResult;
	return <IOkResult<NonNullable<T>>>{
		success: result.success,
		message: result.message || '',
		data: result.data!
	};
}
export function callResult<R>(rawResponse: QueryResult<R>, result: INoDataCallResult | undefined) {
	if (rawResponse.errors) {
		return <IFailureResult>{
			success: false,
			message: rawResponse.errors.map((x) => x.message).join('.\n')
		};
	}
	if (!result) {
		return <IFailureResult>{ success: false, message: 'No valid response was received' };
	}
	return <IOk>{ success: result.success, message: result.message || '' };
}
export function queryResult<R, T>(rawResponse: QueryResult<R>, data: T) {
	if (rawResponse.errors) {
		return <IFailureResult>{
			success: false,
			message: rawResponse.errors.map((x) => x.message).join('.\n')
		};
	}
	return <IOkResult<NonNullable<T>>>{ success: true, message: '', data: data! };
}
export function queryResultMapped<R, T, X>(
	rawResponse: QueryResult<R>,
	data: T,
	mapper: (v: NonNullable<T>) => X
) {
	if (rawResponse.errors) {
		return <IFailureResult>{
			success: false,
			message: rawResponse.errors.map((x) => x.message).join('.\n')
		};
	}
	return <IOkResult<X>>{ success: true, message: '', data: mapper(data!) };
}
export function queryResultMapped2<R, T, X>(
	rawResponse: QueryResult<R>,
	data: T,
	mapper: (v: NonNullable<T>) => X
) {
	if (rawResponse.errors) {
		return <IFailureResult>{
			success: false,
			message: rawResponse.errors.map((x) => x.message).join('.\n')
		};
	}
	return mapper(data!);
}

export function getOne<T, X>(
	input: IFailureResult | IOkResult<T>,
	mapper: (src: T | null) => X[] | null
) {
	if (input.success) {
		const xs = mapper(input.data);
		if (xs?.length) {
			return { success: true, message: input.message, data: xs[0] } as IOkResult<X>;
		}
		return {
			success: false,
			message: 'No record was found with the given entity'
		} as IFailureResult;
	} else {
		return { success: false, message: input.message } as IFailureResult;
	}
}
// export function parseResponse<R, T>(rawResponse: QueryResult<R>, data: T) {
//   if (rawResponse.errors) {
//     return <ICallResult2<T>>{ success: false, message: rawResponse.errors.map(x => x.message).join('.\n') }
//   }
//   return data
// }

interface IGeneralCallResult {
	readonly success: boolean;
	readonly message: string | null;
}
function instanceOfCallResult(object: any): object is IGeneralCallResult {
	return 'success' in object;
}
// function instanceOfCallResult<T>(object: T): object
export function gqlResult<T>(x?: T) {
	if (!x) return { success: false, message: 'error' } as IFailureResult;
	if (instanceOfCallResult(x)) {
		if (!x.success) return { success: false, message: x.message } as IFailureResult;
		return x;
	}
	return { success: true, data: x } as IOkResult<T>;
}

export function gqlError(e: unknown) {
	console.log(e);
	return <IFailureResult>{ success: false, message: (e as any)?.message || e };
}

export function gqlOk<R, T extends IGeneralCallResult>(rawResponse: QueryResult<R>, data: T) {
	if (rawResponse.errors) return gqlError(rawResponse.errors.map((x) => x.message).join('.\n'));
	return gqlResult(data);
}

export function getPageInfo(page: number, pageSize: number) {
	if (pageSize === 0) {
		// default to 500 records
		pageSize = 500;
	}
	return { take: pageSize, skip: (page - 1) * pageSize };
}

export type ExtractOkResultType<T> = T extends IOkResult<infer U> ? U : never;
