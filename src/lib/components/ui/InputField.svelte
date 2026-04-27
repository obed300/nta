<script lang="ts">
	import { Input, Label, Helper } from 'flowbite-svelte';

	// 1. Define the interface to tell TS what is optional (?)
	interface Props {
		name: string;
		label?: string; // ? makes it optional
		errors?: any; // ? makes it optional
		placeholder?: string;
		[key: string]: any; // Allows for ...rest (type, class, etc.)
	}

	let { label, name, errors = null, placeholder = '', ...rest }: Props = $props();

	const color = $derived(errors ? 'red' : 'gray');
</script>

<div class="space-y-1.5">
	<!-- 3. Only show the Label if a label prop was actually passed -->
	{#if label}
		<Label for={name} class="text-sm font-semibold text-slate-700">{label}</Label>
	{/if}

	<Input
		{name}
		{placeholder}
		id={name}
		color={color as any}
		class="rounded-lg border-slate-200 shadow-sm transition-all focus:border-emerald-500 focus:ring-emerald-500"
		{...rest}
	/>

	{#if errors}
		<Helper class="mt-1 text-xs font-medium" color="red">
			{Array.isArray(errors) ? errors[0] : errors}
		</Helper>
	{/if}
</div>
