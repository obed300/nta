<script lang="ts">
	// Import the logo to ensure Vite processes it correctly for production
	import logo from '$lib/assets/nta-logo.png';
	import { slide } from 'svelte/transition';

	let mobileMenuOpen = $state(false);
	const toggleMenu = () => (mobileMenuOpen = !mobileMenuOpen);
</script>

<header class="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md">
	<nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
		<!-- Logo Section -->
		<a href="/" class="group flex items-center gap-3 transition-opacity hover:opacity-90">
			<div class="flex items-center justify-center">
				<img
					src={logo}
					alt="NTAG Ghana Logo"
					class="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 md:h-14"
				/>
			</div>
			<div class="flex flex-col justify-center leading-none">
				<span class="text-xl font-black tracking-tighter text-emerald-900 md:text-2xl"> NTAG </span>
				<span class="text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase">
					Ghana
				</span>
			</div>
		</a>

		<!-- Desktop Navigation -->
		<!-- <div class="hidden md:flex md:items-center md:gap-x-8">
			<a
				href="/"
				class="text-sm font-semibold text-slate-700 transition-colors hover:text-emerald-600"
			>
				Home
			</a>
			<a
				href="/about"
				class="text-sm font-semibold text-slate-700 transition-colors hover:text-emerald-600"
			>
				About
			</a>
			<div class="h-5 w-px bg-slate-200"></div>
			<a
				href="/login"
				class="text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
			>
				Login
			</a>
			<a
				href="/signup"
				class="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 hover:shadow-emerald-200 active:scale-95"
			>
				Sign Up
			</a>
		</div>

	
		<button
			class="rounded-lg p-2 text-emerald-900 transition-colors hover:bg-emerald-50 md:hidden"
			onclick={toggleMenu}
			aria-label="Toggle Menu"
		>
			{#if mobileMenuOpen}
				<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			{:else}
				<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			{/if}
		</button> -->
	</nav>

	<!-- {#if mobileMenuOpen}
		<div
			transition:slide={{ duration: 200 }}
			class="absolute w-full border-t border-emerald-50 bg-white p-6 shadow-xl md:hidden"
		>
			<div class="flex flex-col gap-4">
				<a href="/" class="text-lg font-semibold text-slate-700" onclick={toggleMenu}>Home</a>
				<a href="/about" class="text-lg font-semibold text-slate-700" onclick={toggleMenu}>About</a>
				<hr class="my-2 border-slate-100" />
				<a href="/login" class="text-lg font-semibold text-slate-600" onclick={toggleMenu}>Login</a>
				<a
					href="/signup"
					class="w-full rounded-xl bg-emerald-600 py-4 text-center text-lg font-bold text-white shadow-md"
					onclick={toggleMenu}
				>
					Join Association
				</a>
			</div>
		</div>
	{/if} -->
</header>
