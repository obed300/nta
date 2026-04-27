<script lang="ts">
	import { createForm } from 'felte';
	import { validator } from '@felte/validator-zod';
	import { z } from 'zod';
	import { Checkbox, Label } from 'flowbite-svelte';

	// Components
	import InputField from './ui/InputField.svelte';
	import TextareaField from './ui/TextareaField.svelte';
	import AddressSection from './AddressSection.svelte';
	import Button from './ui/Button.svelte';
	import { toast } from '@rkosafo/cai.components';
	import { createMember } from '../../routes/sesnet/svc';

	// API Action

	// 1. Zod Schema
	const schema = z.object({
		companyName: z.string().min(1, 'Required'),
		phone: z.string().min(10, 'Required'),
		email: z.email(),
		operationalArea: z.string().min(1, 'Required'),
		yearEstablished: z.string().min(4, 'Enter YYYY'),
		regNo: z.string().optional(),
		description: z.string().min(5, 'Description required'),

		// Address fields used for concatenation
		houseNo: z.string().optional(),
		streetName: z.string().min(1, 'Required'),
		suburb: z.string().min(1, 'Required'),
		landmark: z.string().min(1, 'Required'),
		gps: z.string().optional(),
		region: z.string().min(1, 'Required'),
		assembly: z.string().min(1, 'Required'),

		// Selection arrays
		categories: z.array(z.string()).default([]),
		products: z.array(z.string()).default([])
	});

	// 2. Felte Form
	const { form, errors, isSubmitting } = createForm<z.infer<typeof schema>>({
		extend: [validator({ schema })],
		onSubmit: async (values) => {
			// CONCATENATE ADDRESS: Merge separate fields into the single 'address' field expected by API
			const addressObj = {
				houseNo: values.houseNo,
				street: values.streetName,
				suburb: values.suburb,
				landmark: values.landmark,
				gps: values.gps,
				region: values.region,
				district: values.assembly
			};

			// MAP TO CreateMemberInput
			const payload = {
				name: values.companyName,
				organization: 'SESNET-AFRICA', // Or toggle based on form
				phoneNumber: values.phone,
				email: values.email,
				address: JSON.stringify(addressObj),
				operationalArea: values.operationalArea,
				commencementYear: values.yearEstablished,
				redgNo: values.regNo || '',
				category: JSON.stringify(values.categories),
				productMaterialCategory: JSON.stringify(values.products),
				description: values.description,
				membershipDeclaration: 'Confirmed'
			};

			const result = await createMember(payload as any);

			console.log(result);

			if (result?.success) {
				toast.success('Member registered successfully!');
			} else {
				toast.error('Error: ' + result.message);
			}
		}
	});

	const categories = ['Manufacturer', 'Supplier', 'Distributor', 'Wholesaler', 'Retailer'];
</script>

<div class="min-h-screen bg-slate-50/50 px-4 py-12">
	<form use:form class="mx-auto max-w-4xl space-y-8">
		<!-- IDENTITY SECTION -->
		<section class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
			<h3 class="mb-6 text-xl font-bold tracking-tight text-slate-800">Entity Information</h3>
			<div class="grid grid-cols-1 gap-6">
				<InputField
					label="Name of Enterprise / Company"
					name="companyName"
					errors={$errors.companyName}
				/>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<InputField label="Phone Number" name="phone" errors={$errors.phone} />
					<InputField label="Email Address" name="email" type="email" errors={$errors.email} />
				</div>
			</div>
		</section>

		<!-- ADDRESS SECTION (The refactored component) -->
		<AddressSection errors={$errors} />

		<!-- OPERATIONAL SECTION -->
		<section class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
			<h3 class="mb-6 text-xl font-bold tracking-tight text-slate-800">Operational Details</h3>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<InputField
					label="Operational Area"
					name="operationalArea"
					errors={$errors.operationalArea}
				/>
				<InputField
					label="Year Established"
					name="yearEstablished"
					errors={$errors.yearEstablished}
				/>

				<InputField label="Reg. No (If registered)" name="regNo" errors={$errors.regNo} />
			</div>
			<div class="mt-6">
				<TextareaField
					label="Brief Description of Facilities / Services"
					name="description"
					errors={$errors.description}
				/>
			</div>
		</section>

		<!-- CATEGORY SECTION -->
		<section class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
			<Label class="mb-4 text-lg font-bold text-slate-800 uppercase">Category of Membership</Label>
			<div class="grid grid-cols-2 gap-3 md:grid-cols-5">
				{#each categories as cat}
					<label
						class="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-emerald-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50"
					>
						<Checkbox
							name="categories"
							value={cat}
							class="text-emerald-600 focus:ring-emerald-500"
						/>
						<span
							class="mt-2 text-center text-[10px] font-black tracking-tighter text-slate-500 uppercase group-hover:text-emerald-700"
							>{cat}</span
						>
					</label>
				{/each}
			</div>
		</section>

		<!-- SUBMIT -->
		<Button type="submit" disabled={$isSubmitting} class="h-16 w-full text-xl shadow-emerald-200">
			{$isSubmitting ? 'Registering...' : 'Register Member'}
		</Button>
	</form>
</div>
