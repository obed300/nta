<script lang="ts">
	import { createForm } from 'felte';
	import { validator } from '@felte/validator-zod';
	import { z } from 'zod';
	import { Checkbox, Label, Helper } from 'flowbite-svelte';
	import { toast } from '@rkosafo/cai.components';

	import InputField from './ui/InputField.svelte';
	import AddressSection from './AddressSection.svelte';
	import Button from './ui/Button.svelte';
	import { createMember } from '../../routes/sesnet/svc';

	// 1. Define the Schema (Matches the UI fields)
	const schema = z.object({
		companyName: z.string().min(2, 'Business name is required'),
		phone: z.string().min(10, 'Valid phone number is required'),
		email: z.string().email('Invalid email address'),
		operationalArea: z.string().min(1, 'Required'),
		yearEstablished: z.string().min(4, 'Enter YYYY'),
		regNo: z.string().optional(),

		// Address fields for JSON stringification
		houseNo: z.string().optional(),
		streetName: z.string().min(1, 'Street name is required'),
		suburb: z.string().min(1, 'Suburb is required'),
		landmark: z.string().min(1, 'Landmark is required'),
		gps: z
			.string()
			.trim()
			.toUpperCase()
			// Regex explanation:
			// ^[A-Z]{2}    -> Starts with exactly 2 letters (Region code)
			// -            -> A mandatory hyphen
			// \d{3,4}      -> 3 or 4 digits
			// -            -> A mandatory hyphen
			// \d{4}$       -> Exactly 4 digits at the end
			.regex(/^[A-Z]{2}-\d{3,4}-\d{4}$/, {
				message: 'Address must match Ghana GPS format (e.g., GA-123-4567)'
			})
			// If you want it to be truly optional (allow empty strings)
			.optional()
			.or(z.literal('')),
		assembly: z.string().min(1, 'Assembly selection is required'),
		region: z.string().min(1, 'Region is required'),

		// NTA Specific Fields
		categories: z.array(z.string()).min(1, 'Please select at least one membership category'),
		products: z.array(z.string()).default([]),
		otherProduct: z.string().optional()
	});

	// 2. Initialize Felte
	const { form, errors, isSubmitting } = createForm<z.infer<typeof schema>>({
		extend: [validator({ schema })],
		onSubmit: async (values) => {
			// A. Create the Address JSON object
			const addressObj = {
				houseNo: values.houseNo || 'N/A',
				street: values.streetName,
				suburb: values.suburb,
				landmark: values.landmark,
				gps: values.gps || 'N/A',
				region: values.region,
				district: values.assembly
			};

			// B. Map to the API Input structure (CreateMemberInput)
			const payload = {
				name: values.companyName,
				organization: 'NATIONAL TOILET ASSOCIATION',
				phoneNumber: values.phone,
				email: values.email,
				address: JSON.stringify(addressObj),
				operationalArea: values.operationalArea,
				commencementYear: values.yearEstablished,
				redgNo: values.regNo || '',
				category: JSON.stringify(values.categories),
				productMaterialCategory: JSON.stringify(values.products),
				description: 'NTA Membership Registration',
				additionalInformation: values.otherProduct || '',
				membershipDeclaration: 'Confirmed'
			};

			const result = await createMember(payload as any);

			if (result?.success) {
				toast.success('NTA Registration submitted successfully!');
			} else {
				toast.error('Error: ' + (result?.message || 'Submission failed'));
			}
		}
	});

	const categories = ['Manufacturer', 'Supplier', 'Distributor', 'Wholesaler', 'Retailer'];
	const products = [
		'Toilet type (Digni loo)',
		'Cement',
		'WC bowl',
		'Handwash basin',
		'Sand',
		'Gravels',
		'Sandcrete Block',
		'Ceramic Tiles',
		'Paint',
		'Pipes',
		'Roofing sheets'
	];
</script>

<div class="min-h-screen bg-slate-50/50 px-4 py-12 sm:px-6">
	<form use:form class="mx-auto max-w-4xl space-y-8">
		<!-- SECTION 1: IDENTITY -->
		<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
			<div class="mb-6 flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
						/>
					</svg>
				</div>
				<h3 class="text-xl font-bold tracking-tight text-slate-800">Business Identity</h3>
			</div>

			<div class="space-y-6">
				<InputField
					label="Name of Enterprise / Organisation"
					name="companyName"
					placeholder="Legal name of business"
					errors={$errors.companyName}
				/>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<InputField
						label="Contact/Phone No."
						name="phone"
						placeholder="024 000 0000"
						errors={$errors.phone}
					/>
					<InputField
						label="Email Address"
						name="email"
						type="email"
						placeholder="info@company.com"
						errors={$errors.email}
					/>
				</div>
			</div>
		</section>

		<!-- SECTION 2: ADDRESS -->
		<AddressSection errors={$errors} />

		<!-- SECTION 3: OPERATIONAL DETAILS -->
		<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
			<div class="mb-6 flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
				</div>
				<h3 class="text-xl font-bold tracking-tight text-slate-800">Operational Details</h3>
			</div>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<InputField
					label="Operational Area"
					name="operationalArea"
					placeholder="e.g. Accra"
					errors={$errors.operationalArea}
				/>
				<InputField
					label="Year Established"
					name="yearEstablished"
					placeholder="YYYY"
					errors={$errors.yearEstablished}
				/>
				<InputField
					label="Reg. No (If registered)"
					name="regNo"
					placeholder="Optional"
					errors={$errors.regNo}
				/>
			</div>
		</section>

		<!-- SECTION 4: CATEGORIES -->
		<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
			<div class="mb-6 space-y-1">
				<h3 class="text-xl font-bold tracking-wide text-slate-800 uppercase">
					Membership Category
				</h3>
				<p class="text-sm text-slate-500 italic">
					Select the role that best describes your operations
				</p>
			</div>

			<div class="grid grid-cols-2 gap-3 md:grid-cols-5">
				{#each categories as cat}
					<label
						class="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-emerald-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50"
					>
						<Checkbox
							name="categories"
							value={cat}
							class="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
						/>
						<span
							class="mt-2 text-center text-[10px] font-black tracking-tighter text-slate-600 uppercase group-hover:text-emerald-700"
						>
							{cat}
						</span>
					</label>
				{/each}
			</div>
			{#if $errors.categories}
				<Helper class="mt-4 font-bold text-red-500 uppercase" color="red">
					{$errors.categories}
				</Helper>
			{/if}
		</section>

		<!-- SECTION 5: PRODUCTS -->
		<section class="rounded-2xl border border-emerald-100 bg-white p-6 shadow-md md:p-8">
			<div class="mb-6 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
							/>
						</svg>
					</div>
					<h3 class="text-xl font-bold text-slate-800">Product Portfolio</h3>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{#each products as prod}
					<label
						class="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-4 py-3 transition-colors hover:bg-emerald-50/50 has-[:checked]:bg-emerald-50/80"
					>
						<Checkbox
							name="products"
							value={prod}
							class="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
						/>
						<span class="text-sm font-medium text-slate-700">{prod}</span>
					</label>
				{/each}
			</div>

			<div class="mt-6 border-t border-slate-100 pt-6">
				<InputField
					label="Other Products (Please specify)"
					name="otherProduct"
					placeholder="List any other products offered..."
					errors={$errors.otherProduct}
				/>
			</div>
		</section>

		<!-- SUBMIT BUTTON -->
		<div class="pt-4">
			<Button type="submit" disabled={$isSubmitting} class="h-16 w-full text-xl shadow-emerald-200">
				{$isSubmitting ? 'Submitting Application...' : 'Submit NTA Application'}
			</Button>
			<p class="mt-4 text-center text-xs font-medium text-slate-400">
				By submitting, you agree to further verification of company details.
			</p>
		</div>
	</form>
</div>
