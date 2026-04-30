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
		multiple?: boolean;
		onchange?: (event: Event) => void;
	}

	let {
		label,
		name,
		options,
		errors,
		placeholder = 'Select an option...',
		disabled = false,
		multiple = false,
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let selectedValue = $state('');
	let selectedValues = $state<string[]>([]);
	let inputRef: HTMLInputElement | undefined = $state();

	let selectedName = $derived(
		options.find((o) => String(o.value) === selectedValue)?.name || placeholder
	);

	function toggle() {
		if (disabled) return;
		isOpen = !isOpen;
	}

	async function dispatchEvents() {
		await tick();
		if (inputRef) {
			inputRef.dispatchEvent(new Event('input', { bubbles: true }));
			inputRef.dispatchEvent(new Event('change', { bubbles: true }));
		}
	}

	async function select(option: Option) {
		if (multiple) {
			const val = String(option.value);
			selectedValues = selectedValues.includes(val)
				? selectedValues.filter((v) => v !== val)
				: [...selectedValues, val];
			await dispatchEvents();
			if (onchange) {
				const mockEvent = {
					target: { name, value: selectedValues },
					currentTarget: { value: selectedValues }
				} as unknown as Event;
				onchange(mockEvent);
			}
		} else {
			selectedValue = String(option.value);
			isOpen = false;
			await dispatchEvents();
			if (onchange) {
				const mockEvent = {
					target: { name, value: selectedValue },
					currentTarget: { value: selectedValue }
				} as unknown as Event;
				onchange(mockEvent);
			}
		}
	}

	function isSelected(option: Option): boolean {
		if (multiple) return selectedValues.includes(String(option.value));
		return selectedValue === String(option.value);
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
		<div
			role="button"
			tabindex={disabled ? -1 : 0}
			onclick={toggle}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggle() : null)}
			aria-haspopup="listbox"
			aria-expanded={isOpen}
			aria-disabled={disabled}
			class="flex w-full items-center justify-between rounded-xl border bg-white p-3 text-sm transition-all
			{disabled ? 'cursor-not-allowed bg-slate-50' : 'cursor-pointer'}
			{errors
				? 'border-red-500 ring-red-100'
				: 'border-slate-200 hover:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10'}
			{isOpen ? 'border-emerald-500 ring-4 ring-emerald-500/10' : ''}"
		>
			{#if multiple && selectedValues.length > 0}
				<span class="flex flex-wrap gap-1">
					{#each options.filter((o) => selectedValues.includes(String(o.value))) as opt}
						<span
							class="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
						>
							{opt.name}
							<button
								type="button"
								aria-label="Remove {opt.name}"
								onclick={(e) => {
									e.stopPropagation();
									select(opt);
								}}
								class="hover:text-emerald-900"
							>
								<svg
									aria-hidden="true"
									class="h-3 w-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2.5"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</span>
					{/each}
				</span>
			{:else}
				<span
					class={(!multiple && selectedValue) || (multiple && selectedValues.length > 0)
						? 'font-medium text-slate-900'
						: 'text-slate-400'}
				>
					{multiple
						? selectedValues.length > 0
							? options
									.filter((o) => selectedValues.includes(String(o.value)))
									.map((o) => o.name)
									.join(', ')
							: placeholder
						: selectedName}
				</span>
			{/if}
			<svg
				aria-hidden="true"
				class="ml-2 h-4 w-4 shrink-0 text-emerald-600 transition-transform {isOpen
					? 'rotate-180'
					: ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>

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
							class="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-emerald-50 transition-colors hover:bg-emerald-500
							{isSelected(option) ? 'bg-emerald-700 text-white' : ''}"
						>
							{#if multiple}
								<span
									class="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors
									{isSelected(option) ? 'border-white bg-white' : 'border-emerald-300 bg-transparent'}"
								>
									{#if isSelected(option)}
										<svg
											aria-hidden="true"
											class="h-2.5 w-2.5 text-emerald-600"
											fill="currentColor"
											viewBox="0 0 12 12"
										>
											<path
												d="M10 3L5 8.5 2 5.5"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												fill="none"
											/>
										</svg>
									{/if}
								</span>
							{/if}
							{option.name}
						</button>
					{/each}
				</div>

				{#if multiple}
					<div class="border-t border-emerald-500 p-2">
						<button
							type="button"
							onclick={() => (isOpen = false)}
							class="w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
						>
							Done ({selectedValues.length} selected)
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!--
		KEY FIX: single hidden input storing JSON.stringify(selectedValues).
		Felte reads one value → z.preprocess JSON.parses it → string[].
		Multiple inputs with the same name get merged into a comma string by Felte,
		which breaks the JSON.parse preprocess and always produces [].
	-->
	{#if multiple}
		<input type="hidden" {name} value={JSON.stringify(selectedValues)} bind:this={inputRef} />
	{:else}
		<input type="hidden" {name} bind:value={selectedValue} bind:this={inputRef} />
	{/if}

	{#if errors}
		<Helper class="px-2 text-[11px] font-bold text-red-500 uppercase" color="red">
			{Array.isArray(errors) ? errors[0] : errors}
		</Helper>
	{/if}
</div>
