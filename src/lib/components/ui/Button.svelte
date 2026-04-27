<script lang="ts">
	import { Button as FlowbiteButton } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		color?:
			| 'emerald'
			| 'alternative'
			| 'blue'
			| 'dark'
			| 'green'
			| 'light'
			| 'primary'
			| 'purple'
			| 'red'
			| 'yellow'
			| 'none';
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
		[key: string]: any;
	}

	let { children, color = 'emerald', class: customClass = '', ...rest }: Props = $props();

	// Define high-end styles that match our Emerald theme
	const baseStyles = `
		relative overflow-hidden
		font-bold uppercase tracking-widest text-xs
		rounded-xl transition-all duration-300 ease-out
		shadow-lg hover:shadow-emerald-500/40
		hover:-translate-y-1 active:translate-y-0 active:scale-95
		flex items-center justify-center gap-2
	`;

	// Map 'emerald' to the primary green colors we defined in tailwind config
	const colorMap = {
		emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white border-none'
	};
</script>

<FlowbiteButton
	{...rest as any}
	class="{baseStyles} {color === 'emerald' ? colorMap.emerald : ''} {customClass}"
>
	{@render children?.()}

	<!-- Subtle gloss effect layer -->
	<div
		class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity hover:opacity-100"
	></div>
</FlowbiteButton>
