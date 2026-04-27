<script lang="ts">
	import { Textarea, Label, Helper } from 'flowbite-svelte';

	interface Props {
		label: string;
		name: string;
		errors?: string | string[] | null;
		rows?: number;
		placeholder?: string;
		[key: string]: any;
	}

	let { label, name, errors, rows = 4, placeholder, ...rest }: Props = $props();

	// Reactive state for visual feedback
	const statusColor = $derived(errors ? 'red' : 'gray');
</script>

<div class="group space-y-2">
	<!-- Refined Label: Uppercase, small, and bold for a modern SaaS look -->
	<Label
		for={name}
		class="ml-1 text-[11px] font-black tracking-[0.12em] text-slate-500 uppercase transition-colors group-focus-within:text-emerald-700"
	>
		{label}
	</Label>

	<div class="relative">
		<Textarea
			{name}
			id={name}
			{rows}
			{placeholder}
			color={statusColor as any}
			class="
                w-full rounded-2xl border-slate-200 bg-slate-50/50 p-4 text-slate-900 
                shadow-sm transition-all duration-200 
                placeholder:text-slate-400
                hover:border-emerald-200 hover:bg-slate-50
                focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
            "
			{...rest}
		/>

		<!-- Subtle decorative accent that glows when the textarea is focused -->
		<div
			class="pointer-events-none absolute right-3 bottom-3 opacity-20 transition-opacity group-focus-within:opacity-100"
		>
			<svg class="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
				/>
			</svg>
		</div>
	</div>

	{#if errors}
		<div class="flex items-center gap-1.5 px-2">
			<svg class="h-3.5 w-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
					clip-rule="evenodd"
				></path>
			</svg>
			<Helper class="text-[11px] font-bold tracking-wider text-red-500 uppercase" color="red">
				{Array.isArray(errors) ? errors[0] : errors}
			</Helper>
		</div>
	{/if}
</div>

<style>
	/* Ensures the Flowbite focus ring doesn't overlap our custom rounded corners weirdly */
	:global(textarea) {
		resize: vertical;
		min-height: 80px;
	}
</style>
