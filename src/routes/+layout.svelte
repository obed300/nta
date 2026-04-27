<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/nta-logo.png';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { Toaster } from 'svelte-french-toast';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>NTAG Ghana | National Toilet Association</title>
</svelte:head>

<div class="flex min-h-screen flex-col font-sans text-slate-900">
	<Toaster
		toastOptions={{
			style: 'background: #363636; color: #fff;'
		}}
	/>

	<Header />
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
