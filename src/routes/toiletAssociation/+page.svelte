<script lang="ts">
	import { createForm } from 'felte';
	import { validator } from '@felte/validator-zod';
	import { z } from 'zod';
	import { Checkbox, Label } from 'flowbite-svelte';
	import { toast } from '@rkosafo/cai.components';
	import { createMember } from '../sesnet/svc';
	import InputField from '$lib/components/ui/InputField.svelte';
	import AddressSection from '$lib/components/AddressSection.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Turnstile } from 'svelte-turnstile';
	import { goto } from '$app/navigation';

	let isReviewing = $state(false);
	let formElement: HTMLFormElement;
	const currentYear = new Date().getFullYear();

	// 2. Updated Schema with all fields from document
	const schema = z.object({
		companyName: z.string().min(2, 'Business name is required'),
		phone: z.string().min(10, 'Valid phone number is required'),
		email: z.email('Invalid email address'),

		houseNo: z.string().optional(),
		streetName: z.string().min(1, 'Street name is required'),
		town: z.string().min(1, 'Town is required'),
		suburb: z.string().min(1, 'Suburb is required'),
		landmark: z.string().min(1, 'Landmark is required'),
		gps: z
			.string()
			.trim()
			.toUpperCase()
			.regex(/^[A-Z]{2}-\d{3,4}-\d{4}$/, {
				message: 'Format: XX-XXX-XXXX'
			})
			.optional()
			.or(z.literal('')),
		assembly: z.string().min(1, 'Required'),
		region: z.string().min(1, 'Required'),
		// Business Ops
		operationalArea: z.string().min(1, 'Required'),
		yearEstablished: z.coerce.number().int().min(1800).max(currentYear),
		regNo: z.string().optional(),
		// Categories & Products
		categories: z.array(z.string()).min(1, 'Select at least one category'),
		products: z.array(z.string()).default([]),
		otherProduct: z.string().optional(),
		toilet_type: z.string().optional(),
		additionalInformation: z.string().optional(),
		token: z.string().min(1, 'Please complete the security check'),
		// Declaration
		declarantName: z.string().min(2, 'Name is required'),
		declarantPosition: z.string().min(2, 'Position is required'),
		declarationConfirmed: z.literal(true, {
			message: 'You must confirm the declaration'
		})
	});

	const { form, errors, data, isSubmitting, validate, setFields } = createForm<
		z.infer<typeof schema>
	>({
		extend: [validator({ schema })],
		initialValues: {
			products: [],
			categories: []
		},
		onSubmit: async (values) => {
			const addressObj = {
				houseNo: values.houseNo,
				street: values.streetName,
				town: values.town,
				suburb: values.suburb,
				landmark: values.landmark,
				gps: values.gps,
				region: values.region,
				district: values.assembly
			};

			const combinedProducts = values.products
				.map((id) => {
					if (id === 'other') return `Other: ${values.otherProduct || ''}`;
					return productsList.find((p) => p.id === id)?.label || id;
				})
				.filter(Boolean);

			if (values.toilet_type) combinedProducts.push(`Toilet Type: ${values.toilet_type}`);

			const declarationObj = {
				declarantName: values.declarantName,
				declarantPosition: values.declarantPosition,
				confirmed: values.declarationConfirmed,
				date: new Date().toLocaleDateString()
			};
			const payload = {
				name: values.companyName,
				organization: 'NATIONAL TOILET ASSOCIATION',
				phoneNumber: values.phone,
				email: values.email,
				address: JSON.stringify(addressObj),
				operationalArea: values.operationalArea,
				commencementYear: values.yearEstablished.toString(),
				redgNo: values.regNo || '',
				category: JSON.stringify(values.categories),
				additionalInformation: values.additionalInformation || '',
				productMaterialCategory: JSON.stringify(combinedProducts),
				membershipDeclaration: JSON.stringify({
					declarantName: values.declarantName,
					declarantPosition: values.declarantPosition,
					confirmed: values.declarationConfirmed,
					date: new Date().toLocaleDateString()
				})
			};

			const result = await createMember(payload as any);
			if (result?.success) {
				toast.success('Registration successful');
				isReviewing = false;
				goto('/');
			} else {
				toast.error(result?.message || 'Submission failed');
			}
		}
	});

	let turnstileToken = $state('');

	const handleShowReview = async () => {
		const result = await validate();

		console.log(result);
		const hasErrors =
			result &&
			Object.values(result).some((v) => v !== null && (Array.isArray(v) ? v.length > 0 : true));

		if (!hasErrors) {
			isReviewing = true;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} else {
			toast.error('Please complete all required fields.');
		}
	};

	// const handleShowReview = async () => {
	// 	const result = await validate();
	// 	const hasErrors = result && Object.keys(result).length > 0;
	// 	if (!result || Object.keys(result).length === 0) {
	// 		isReviewing = true;
	// 		window.scrollTo({ top: 0, behavior: 'smooth' });
	// 	} else {
	// 		console.error('❌ Validation Failed', result);
	// 		toast.error('Please fix the errors before reviewing.');
	// 	}
	// };

	const categories = ['Manufacturer', 'Supplier', 'Distributor', 'Wholesaler', 'Retailer'];
	const productsList = [
		{ id: 'cement', label: 'Cement' },
		{ id: 'wc_bowl', label: 'WC bowl' },
		{ id: 'handwash', label: 'Handwash basin' },
		{ id: 'sand', label: 'Sand' },
		{ id: 'gravels', label: 'Gravels (chippings)' },
		{ id: 'sandcrete', label: 'Sandcrete (cement) Block' },
		{ id: 'mesh', label: 'Roll/flat mesh' },
		{ id: 'timber', label: 'Timber products (e.g. wawa boards, wood, doors, etc.)' },
		{ id: 'tiles', label: 'Ceramic Tiles' },
		{ id: 'paint', label: 'Paint' },
		{ id: 'pipes', label: 'Pipes' },
		{ id: 'fixtures', label: 'Pipe/plumbing fixtures' },
		{ id: 'roofing', label: 'Roofing sheets' },
		{ id: 'ironmongery', label: 'Ironmongery (e.g. door handles, hinges, locks, etc.)' },
		{ id: 'other', label: 'Other', hasInput: true }
	];
</script>

{#snippet ReviewItem(label: string, value: any)}
	<div class="flex flex-col gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
		<span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</span>
		<span class="text-sm font-semibold break-words text-slate-700">{value || '—'}</span>
	</div>
{/snippet}

<div class="min-h-screen bg-slate-50/50 px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<!-- 1. FORM VIEW -->
		<form use:form bind:this={formElement} class="space-y-8 {isReviewing ? 'hidden' : 'block'}">
			<header>
				<h2 class="text-3xl font-black tracking-tight text-slate-900 uppercase italic">
					NTA Registration
				</h2>
				<p class="text-slate-500">National Toilet Association Membership Portal</p>
			</header>

			<!-- Business Identity -->
			<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
				<h3 class="mb-6 text-lg font-bold text-slate-800">Business Identity</h3>
				<div class="space-y-6">
					<InputField
						label="Name of Enterprise/Company"
						name="companyName"
						errors={$errors.companyName}
					/>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<InputField label="Contact/Phone No." name="phone" errors={$errors.phone} />
						<InputField label="Email Address" name="email" type="email" errors={$errors.email} />
					</div>
				</div>
			</section>

			<AddressSection errors={$errors} />

			<!-- Operational Details -->
			<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
				<h3 class="mb-6 text-lg font-bold text-slate-800">Operational Details</h3>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					<InputField
						label="Business Operational Area"
						name="operationalArea"
						errors={$errors.operationalArea}
					/>
					<InputField
						label="Year Established"
						name="yearEstablished"
						type="number"
						errors={$errors.yearEstablished}
					/>
					<InputField label="Business Reg. No" name="regNo" errors={$errors.regNo} />
				</div>
			</section>

			<!-- Membership Category -->
			<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
				<Label class="mb-4 text-sm font-bold text-slate-800 uppercase">Category of Membership</Label
				>
				<div class="grid grid-cols-2 gap-3 md:grid-cols-5">
					{#each categories as cat}
						<label
							class="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-emerald-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50"
						>
							<Checkbox
								name="categories"
								value={cat}
								class="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
							/>
							<span
								class="mt-2 text-center text-[10px] font-black text-slate-500 uppercase group-has-[:checked]:text-emerald-700"
								>{cat}</span
							>
						</label>
					{/each}
				</div>
				{#if $errors.categories}<p class="mt-2 text-xs text-red-500">{$errors.categories}</p>{/if}
			</section>

			<section class="rounded-2xl border border-emerald-100 bg-white p-6 shadow-md md:p-8">
				<h3 class="mb-6 text-lg font-bold text-slate-800">Product/Building Material Category</h3>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<InputField
						label="Toilet type (please specify e.g. Digni loo, biodigester, etc.)"
						name="toilet_type"
						errors={$errors.toilet_type}
					/>
					{#each productsList as prod}
						<label
							class="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent py-3 transition-colors hover:bg-emerald-50/50 has-[:checked]:bg-emerald-50/80"
						>
							<Checkbox
								name="products"
								value={prod.id}
								class="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
							/>
							<span class="text-sm font-medium text-slate-700">{prod.label}</span>
						</label>
					{/each}
					{#if $data.products.includes('other')}
						<div class="animate-in fade-in slide-in-from-top-2 mt-4 duration-300">
							<InputField
								label="Please specify other products"
								name="otherProduct"
								placeholder="Type other materials here..."
								errors={$errors.otherProduct}
							/>
						</div>
					{/if}
				</div>
			</section>

			<section class="rounded-2xl border border-emerald-100 bg-white p-6 shadow-md md:p-8">
				<h3 class="mb-6 text-lg font-bold text-slate-800">Additional Information</h3>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<InputField name="otherProduct" errors={$errors.additionalInformation} />
				</div>
			</section>

			<!-- Membership Declaration -->
			<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
				<!-- Section Header - Matching the others -->
				<div class="mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
					<h3 class="text-lg font-bold text-slate-800 uppercase italic">Membership Declaration</h3>
				</div>

				<!-- Declaration Text -->
				<div class="mb-6 rounded-xl border-l-4 border-emerald-500 bg-slate-50 p-4">
					<p class="text-sm leading-relaxed text-slate-600">
						By completing this section, I/We wish to confirm the above information provided is true
						and pledge to support the objectives of the <span class="font-bold text-emerald-900"
							>National Toilet Association</span
						>.
					</p>
				</div>

				<!-- Signatory Fields - Using standard InputField (No 'inverted') -->
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<InputField
						label="Full Name of Declarant"
						name="declarantName"
						placeholder="Enter full name"
						errors={$errors.declarantName}
					/>
					<InputField
						label="Position / Designation"
						name="declarantPosition"
						placeholder="e.g. Managing Director"
						errors={$errors.declarantPosition}
					/>
				</div>

				<!-- Confirmation Checkbox - Styled like your Product/Category cards -->
				<label
					class="mt-8 flex cursor-pointer items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:border-emerald-200 hover:bg-emerald-50/30 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50"
				>
					<Checkbox
						name="declarationConfirmed"
						value={true}
						class="mt-1 h-5 w-5 text-emerald-600 focus:ring-emerald-500"
					/>
					<div class="flex flex-col">
						<span class="text-sm font-bold text-slate-800">Official Confirmation</span>
						<span class="text-xs text-slate-500"
							>I confirm that all information provided in this application is accurate and true.</span
						>
					</div>
				</label>

				{#if $errors.declarationConfirmed}
					<p class="mt-2 text-xs font-semibold text-red-500">
						{$errors.declarationConfirmed}
					</p>
				{/if}
			</section>

			<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h4 class="mb-4 text-xs font-black tracking-widest text-emerald-600 uppercase">
					Security Check
				</h4>

				<Turnstile
					siteKey="0x4AAAAAACoo0H0YI0vme0JJ"
					on:callback={(e) => {
						turnstileToken = e.detail.token;
						setFields('token', e.detail.token);
					}}
					on:error={() => {
						turnstileToken = '';
						setFields('token', '');
					}}
				/>

				{#if $errors.token}
					<p class="mt-2 text-xs font-semibold text-red-500">{$errors.token}</p>
				{/if}
			</div>

			<Button
				type="button"
				onclick={handleShowReview}
				class="mx-auto w-full max-w-md px-4 py-3 text-base shadow-lg disabled:cursor-not-allowed disabled:bg-green-200 sm:text-lg lg:text-xl "
				disabled={!turnstileToken}
			>
				Review Application
			</Button>
		</form>

		<div
			class="{isReviewing
				? 'block'
				: 'hidden'} animate-in fade-in slide-in-from-bottom-6 space-y-8 duration-500"
		>
			<header class="mb-8 flex items-center justify-between border-b border-slate-200 pb-8">
				<div>
					<h2 class="text-3xl font-black tracking-tight text-slate-900 uppercase italic">
						Review Details
					</h2>
					<p class="font-medium text-slate-500">Confirm your NTA registration details.</p>
				</div>
				<span class="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white uppercase"
					>Final Step</span
				>
			</header>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Business Identity -->
				<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h4 class="mb-4 text-xs font-black text-emerald-600 uppercase">Business Identity</h4>
					<div class="space-y-3">
						{@render ReviewItem('Company Name', $data.companyName)}
						{@render ReviewItem('Phone', $data.phone)}
						{@render ReviewItem('Email', $data.email)}
					</div>
				</div>

				<!-- Operational Details -->
				<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h4 class="mb-4 text-xs font-black text-emerald-600 uppercase">Operations</h4>
					<div class="space-y-3">
						{@render ReviewItem('Operational Area', $data.operationalArea)}
						<div class="grid grid-cols-2 gap-3">
							{@render ReviewItem('Year Est.', $data.yearEstablished)}
							{@render ReviewItem('Reg No.', $data.regNo)}
						</div>
					</div>
				</div>

				<!-- Location Details -->
				<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
					<h4 class="mb-4 text-xs font-black tracking-widest text-emerald-600 uppercase">
						Physical Address
					</h4>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div class="space-y-3">
							{@render ReviewItem('Region', $data.region)}
							{@render ReviewItem('Assembly', $data.assembly)}
						</div>
						<div class="space-y-3">
							{@render ReviewItem('Town', $data.town)}
							{@render ReviewItem('Suburb', $data.suburb)}
						</div>
						<div class="space-y-3">
							{@render ReviewItem('Street', $data.streetName)}
							{@render ReviewItem('GPS', $data.gps)}
						</div>
						<div class="md:col-span-3">
							{@render ReviewItem('Landmark', $data.landmark)}
						</div>
					</div>
				</div>

				<!-- Membership Portfolio (Missing Categories & Products) -->
				<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
					<h4 class="mb-4 text-xs font-black text-emerald-600 uppercase">Membership Portfolio</h4>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<span class="mb-2 block text-[10px] font-bold text-slate-400 uppercase"
								>Categories</span
							>
							<div class="flex flex-wrap gap-2">
								{#each $data.categories as cat}
									<span
										class="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800"
									>
										{cat}
									</span>
								{/each}
							</div>
						</div>
						<div>
							<span class="mb-2 block text-[10px] font-bold text-slate-400 uppercase"
								>Selected Products</span
							>
							<div class="flex flex-wrap gap-2">
								{#each $data.products as prodId}
									<span
										class="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
									>
										{productsList.find((p) => p.id === prodId)?.label || prodId}
									</span>
								{/each}
							</div>
						</div>
						{#if $data.toilet_type || $data.otherProduct}
							<div class="border-t pt-4 md:col-span-2">
								<span class="mb-2 block text-[10px] font-bold text-slate-400 uppercase"
									>Special Specifications</span
								>
								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									{#if $data.toilet_type}
										{@render ReviewItem('Toilet Type Spec', $data.toilet_type)}
									{/if}
									{#if $data.otherProduct}
										{@render ReviewItem('Additional Info', $data.otherProduct)}
									{/if}
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Declaration -->
				<div class="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
					<h4 class="mb-4 text-xs font-black text-slate-900 uppercase">Declaration Details</h4>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{@render ReviewItem('Signed By', $data.declarantName)}
						{@render ReviewItem('Position', $data.declarantPosition)}
					</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-col gap-4 pt-6 sm:pt-8 md:flex-row md:items-center">
				<Button
					type="button"
					class="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-xs font-black tracking-widest text-slate-500 uppercase transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 sm:py-4 sm:text-sm md:flex-1"
					onclick={() => (isReviewing = false)}
					disabled={$isSubmitting}
				>
					Modify Details
				</Button>

				<Button
					type="button"
					class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black tracking-widest text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 sm:py-4 sm:text-sm md:flex-[2]"
					onclick={() => formElement.requestSubmit()}
					disabled={$isSubmitting}
				>
					{$isSubmitting ? 'Processing...' : 'Submit Application'}
				</Button>
			</div>
		</div>
		<!-- ... rest of file ... -->
	</div>
</div>
