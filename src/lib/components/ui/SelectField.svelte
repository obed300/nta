<script lang="ts">
	import { Label, Helper } from 'flowbite-svelte';
	import { slide } from 'svelte/transition';
	import { tick } from 'svelte';

	interface Option {
		name: string;
		value: string | number;
	}

	interface Props {
		label: string;
		name: string;
		options: Option[];
		errors?: string | string[] | null;
		placeholder?: string;
		disabled?: boolean;
		onchange?: (event: Event) => void;
	}

	let {
		label,
		name,
		options,
		errors,
		placeholder = 'Select an option...',
		disabled = false,
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let selectedValue = $state('');
	let inputRef: HTMLInputElement | undefined = $state(); // Reference to hidden input

	let selectedName = $derived(options.find((o) => o.value === selectedValue)?.name || placeholder);

	function toggle() {
		if (disabled) return;
		isOpen = !isOpen;
	}

	async function select(option: Option) {
		selectedValue = String(option.value);
		isOpen = false;

		// IMPORTANT: Wait for Svelte to update the hidden input value
		await tick();

		// IMPORTANT: Manually trigger events so Felte sees the change
		if (inputRef) {
			inputRef.dispatchEvent(new Event('input', { bubbles: true }));
			inputRef.dispatchEvent(new Event('change', { bubbles: true }));
		}

		if (onchange) {
			const mockEvent = {
				target: { name, value: selectedValue },
				currentTarget: { value: selectedValue }
			} as unknown as Event;
			onchange(mockEvent);
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest(`.custom-select-${name}`)) isOpen = false;
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="custom-select-{name} group space-y-2 {disabled ? 'opacity-60' : ''}">
	<Label class="ml-1 text-[11px] font-black tracking-widest text-slate-500 uppercase">{label}</Label
	>

	<div class="relative">
		<button
			type="button"
			onclick={toggle}
			{disabled}
			class="flex w-full items-center justify-between rounded-xl border bg-white p-3 text-sm transition-all
			{disabled ? 'cursor-not-allowed bg-slate-50' : 'cursor-pointer'}
			{errors
				? 'border-red-500 ring-red-100'
				: 'border-slate-200 hover:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10'}
			{isOpen ? 'border-emerald-500 ring-4 ring-emerald-500/10' : ''}"
		>
			<span class={selectedValue ? 'font-medium text-slate-900' : 'text-slate-400'}
				>{selectedName}</span
			>
			<svg
				class="h-4 w-4 text-emerald-600 transition-transform {isOpen ? 'rotate-180' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if isOpen && !disabled}
			<div
				transition:slide={{ duration: 200 }}
				class="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-emerald-500 bg-emerald-600 shadow-xl shadow-emerald-900/20"
			>
				<div class="max-h-60 overflow-y-auto p-1">
					{#each options as option}
						<button
							type="button"
							onclick={() => select(option)}
							class="flex w-full items-center rounded-xl px-4 py-2.5 text-left text-sm font-medium text-emerald-50 transition-colors hover:bg-emerald-500
							{selectedValue === String(option.value) ? 'bg-emerald-700 text-white' : ''}"
						>
							{option.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- The hidden input Felte actually tracks -->
	<input type="hidden" {name} bind:value={selectedValue} bind:this={inputRef} />

	{#if errors}
		<Helper class="px-2 text-[11px] font-bold text-red-500 uppercase" color="red">
			{Array.isArray(errors) ? errors[0] : errors}
		</Helper>
	{/if}
</div>
