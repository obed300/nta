<script lang="ts">
	import logo from '$lib/assets/nta-logo.png';
	import sesnetLogo from '$lib/assets/logo.svg';
	import { slide } from 'svelte/transition';
	import { page } from '$app/stores'; // Import page store

	// Use $derived to reactively check the path
	let isSesnet = $derived($page.url.pathname.startsWith('/sesnet'));

	// Derived branding values
	let currentLogo = $derived(isSesnet ? sesnetLogo : logo);
	let brandTitle = $derived(isSesnet ? 'SESNET' : 'NTAG');
	let brandSubtitle = $derived(isSesnet ? 'Africa' : 'Ghana');

	let mobileMenuOpen = $state(false);
	const toggleMenu = () => (mobileMenuOpen = !mobileMenuOpen);
</script>

<header class="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md">
	<nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
		<!-- Logo Section -->
		<a href="/" class="group flex items-center gap-3 transition-opacity hover:opacity-90">
			<div class="flex items-center justify-center">
				<img
					src={currentLogo}
					alt="{brandTitle} Logo"
					class="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 md:h-14"
				/>
			</div>
			<div class="flex flex-col justify-center leading-none">
				<span class="text-xl font-black tracking-tighter text-emerald-900 md:text-2xl">
					{brandTitle}
				</span>
				<span class="text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase">
					{brandSubtitle}
				</span>
			</div>
		</a>

		<!-- Desktop Navigation (Uncommented and kept if needed) -->
		<!-- ... (Menu buttons logic) -->
	</nav>
</header>
