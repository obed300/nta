<script lang="ts">
	import { createForm } from 'felte';
	import { validator } from '@felte/validator-zod';
	import { z } from 'zod';
	import { Checkbox, Label } from 'flowbite-svelte';
	import { toast } from '@rkosafo/cai.components';
	import { createMember, readScopeOfServices } from './svc';

	// Components
	import InputField from '$lib/components/ui/InputField.svelte';
	import AddressSection from '$lib/components/AddressSection.svelte';
	import TextareaField from '$lib/components/ui/TextareaField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Turnstile } from 'svelte-turnstile';
	import FileUpload from '$lib/components/ui/FileUpload.svelte';
	import { goto } from '$app/navigation';
	import SelectField from '$lib/components/ui/SelectField.svelte';
	import { onMount } from 'svelte';

	const toBase64 = (file: File): Promise<string> =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});

	// 1. UI State & Form Reference
	let isReviewing = $state(false);
	let formElement: HTMLFormElement;
	let scopeOfServiceOptions = $state<{ name: string; value: string }[]>([]);
	let isLoading = $state(true);
	const currentYear = new Date().getFullYear();
	// 2. Schema
	const schema = z.object({
		companyName: z.string().min(1, 'Required'),
		registerAs: z.string().min(1, 'Required'),
		scopeOfServices: z.preprocess(
			(val) => {
				// If it's a string (from hidden input), parse it
				if (typeof val === 'string') {
					try {
						return JSON.parse(val);
					} catch {
						return [];
					}
				}
				return val;
			},
			z.array(z.string()).min(1, 'Pick at least one')
		),
		phone: z.string().min(10, 'Required'),
		email: z.email(),
		ghCardNumber: z.preprocess(
			(val) => {
				if (typeof val !== 'string') return val;
				let cleaned = val.toUpperCase().replace(/\s+/g, ''); // Uppercase and remove spaces

				// If they typed it without dashes (e.g., GHA1234567890), insert them
				if (/^GHA\d{10}$/.test(cleaned)) {
					return `GHA-${cleaned.slice(3, 12)}-${cleaned.slice(12)}`;
				}
				return cleaned;
			},
			z
				.string()
				.min(1, 'Ghana Card No. is required')
				.regex(/^GHA-\d{9}-\d$/, 'Invalid format. Expected: GHA-XXXXXXXXX-X')
		),
		ghanaCardScan: z.any().optional(),

		houseNo: z.string().optional(),
		streetName: z.string().min(1, 'Required'),
		town: z.string().min(1, 'Town is required'),
		suburb: z.string().min(1, 'Required'),
		landmark: z.string().min(1, 'Required'),
		gps: z
			.string()
			.trim()
			.toUpperCase()
			.regex(/^[A-Z]{2}-\d{3,4}-\d{4}$/, {
				message: 'Format: XX-XXX-XXXX'
			})
			.optional()
			.or(z.literal('')),
		region: z.string().min(1, 'Required'),
		assembly: z.string().min(1, 'Required'),
		// categories: z.array(z.string()).min(1, 'Select at least one'),

		operationalArea: z.string().min(1, 'Required'),
		yearEstablished: z.coerce.number().int().min(1800).max(currentYear),
		regNo: z.string().optional(),
		picturesOfFacilities: z.any().optional(),
		description: z.string().min(5, 'Description required'),

		employees: z.record(
			z.string(),
			z.object({
				total: z.coerce.number().default(0),
				trained: z.coerce.number().default(0),
				certified: z.string().default('')
			})
		),

		// products: z.array(z.string()).default([]),
		declarantName: z.string().min(2, 'Name is required'),
		declarantPosition: z.string().min(2, 'Position is required'),
		// token: z.string().min(1, 'Please complete the security check'),
		declarationConfirmed: z.literal(true, {
			message: 'You must confirm the declaration'
		})
	});

	// 3. Felte Form (Removed 'submit' as it doesn't exist)
	const { form, errors, data, isSubmitting, validate, setFields } = createForm<
		z.infer<typeof schema>
	>({
		extend: [validator({ schema })],
		initialValues: {
			// token: '',
			employees: {
				Mason: { total: 0, trained: 0, certified: '' },
				Carpenter: { total: 0, trained: 0, certified: '' },
				Tiler: { total: 0, trained: 0, certified: '' },
				Painter: { total: 0, trained: 0, certified: '' },
				Plumber: { total: 0, trained: 0, certified: '' }
			}
		},
		onSubmit: async (values) => {
			try {
				const input = {
					name: values.companyName,
					registerAs: values.registerAs,
					organization: 'SESNET-AFRICA',
					phoneNumber: values.phone,
					email: values.email,
					ghCardNumber: values.ghCardNumber,
					scopeOfServices: values.scopeOfServices,
					address: JSON.stringify({
						houseNo: values.houseNo,
						street: values.streetName,
						suburb: values.suburb,
						landmark: values.landmark,
						town: values.town,
						gps: values.gps,
						region: values.region,
						assembly: values.assembly
					}),
					operationalArea: values.operationalArea,
					commencementYear: values.yearEstablished.toString(),
					redgNo: values.regNo || '',
					description: values.description,

					employeeDetails: JSON.stringify(values.employees),

					membershipDeclaration: JSON.stringify({
						declarantName: values.declarantName,
						declarantPosition: values.declarantPosition,
						confirmed: values.declarationConfirmed,
						date: new Date().toLocaleDateString()
					})
				};

				const result = await createMember(input);

				if (result?.success) {
					toast.success('Registration Submitted Successfully');
					isReviewing = false;
					goto('https://afrisesnet.org/index.html');
				} else {
					toast.error('Server Error: ' + result.message);
				}
			} catch (err) {
				console.error(err);
				toast.error('Failed to process files for upload.');
			}
		}
	});

	let turnstileToken = $state('');
	const handleShowReview = async () => {
		const result = await validate();
		console.log('Validation Results:', result);

		// Helper function to deep-check for actual error messages
		const hasActualErrors = (obj: any): boolean => {
			if (!obj) return false;
			// If it's an array (like companyName: ["Required"]), check if it has items
			if (Array.isArray(obj)) return obj.length > 0;
			// If it's an object (like employees: { Mason: {...} }), check its children
			if (typeof obj === 'object') {
				return Object.values(obj).some(hasActualErrors);
			}
			return false;
		};

		// Filter out the 'token' because the user hasn't seen the captcha yet
		const errorsToBlock = Object.entries(result || {}).filter(([key, value]) => {
			if (key === 'token') return false;
			return hasActualErrors(value);
		});

		if (errorsToBlock.length === 0) {
			isReviewing = true;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} else {
			// Log exactly which fields are failing to the console
			console.warn(
				'Blocking Fields:',
				errorsToBlock.map((e) => e[0])
			);
			toast.error('Please correct the highlighted errors.');
		}
	};
	const employeeCategories = ['Mason', 'Carpenter', 'Tiler', 'Painter', 'Plumber'];

	onMount(async () => {
		try {
			const res = await readScopeOfServices();

			if (res?.success && Array.isArray(res.data)) {
				scopeOfServiceOptions = res.data.map((item: string) => ({
					name: item,
					value: item
				}));
			}
		} catch (e) {
			console.error('Failed to fetch scope of services:', e);
		} finally {
			isLoading = false;
		}
	});

	const registerOptions = [
		{ name: 'Individual Artisan', value: 'Individual Artisan' },
		{ name: 'Enterprise or Company', value: 'Enterprise or Company' },
		{ name: 'Small Work Constructors', value: 'Small Work Constructors' }
	];
</script>

{#snippet ReviewItem(label: string, value: string | undefined)}
	<div class="flex flex-col gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
		<span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</span>
		<span class="text-sm font-semibold break-words text-slate-700">{value || '—'}</span>
	</div>
{/snippet}

<div class="min-h-screen bg-slate-50/50 px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<form use:form bind:this={formElement} class="space-y-8 {isReviewing ? 'hidden' : 'block'}">
			<header>
				<h2 class="text-3xl font-black tracking-tight text-slate-900 uppercase italic">
					SESNET-AFRICA Registration
				</h2>
				<p class="text-slate-500">Sesnet-africa Membership Portal</p>
			</header>

			<section class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
				<h3 class="mb-6 text-lg font-bold text-slate-800">1. Entity Information</h3>
				<div class="grid grid-cols-1 gap-6">
					<InputField label="Name of Enterprise" name="companyName" errors={$errors.companyName} />
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<SelectField
							label="Register As"
							name="registerAs"
							options={registerOptions}
							errors={$errors.registerAs}
						/>
						<SelectField
							label="Scope Of Services"
							name="scopeOfServices"
							multiple
							options={scopeOfServiceOptions}
							errors={errors.scopeOfServices}
							placeholder={'Select applicable toilet technology option(s)'}
						/>
						<InputField label="Phone Number" name="phone" errors={$errors.phone} />
						<InputField label="Email Address" name="email" type="email" errors={$errors.email} />
						<InputField label="Ghana Card No." name="ghCardNumber" errors={$errors.ghCardNumber} />
						<FileUpload
							label="Upload Scan/Picture of Ghana Card"
							name="ghanaCardScan"
							onChange={(d: any) => setFields('ghanaCardScan', d?.value)}
						/>
					</div>
				</div>
			</section>

			<AddressSection errors={$errors} />

			<section class="overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
				<h3 class="mb-6 border-b pb-2 text-lg font-bold text-slate-800">4. Employee Details</h3>
				<div
					class="mb-4 hidden grid-cols-4 gap-4 px-2 text-[10px] font-black tracking-wider text-slate-400 uppercase md:grid"
				>
					<div>Category</div>
					<div>No. Employees</div>
					<div>No. Trained</div>
					<div>Names of Certified</div>
				</div>
				<div class="space-y-4">
					{#each employeeCategories as cat}
						<div
							class="grid grid-cols-1 items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-4"
						>
							<span class="font-bold text-slate-700">{cat}</span>
							<InputField placeholder="Total" type="number" name="employees.{cat}.total" />
							<InputField placeholder="Trained" type="number" name="employees.{cat}.trained" />
							<InputField placeholder="Certified Names" name="employees.{cat}.certified" />
						</div>
					{/each}
				</div>
			</section>

			<section class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
				<h3 class="mb-6 text-lg font-bold text-slate-800">3. Operational Details</h3>
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
					<InputField label="Company Reg. No" name="regNo" errors={$errors.regNo} />
				</div>

				<div class="mt-6">
					<FileUpload
						label="Upload pictures of facilities/services"
						name="picturesOfFacilities"
						imageOnly={true}
						allowMultiple
						acceptedFileTypes={['image/png', 'image/jpeg']}
						onChange={(detail: any) => setFields('picturesOfFacilities', detail?.value)}
					/>
					<TextareaField
						label="Brief Description"
						name="description"
						errors={$errors.description}
					/>
				</div>
			</section>

			<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
				<div class="mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
					<h3 class="text-lg font-bold text-slate-800 uppercase italic">Membership Declaration</h3>
				</div>

				<div class="mb-6 rounded-xl border-l-4 border-emerald-500 bg-slate-50 p-4">
					<p class="text-sm leading-relaxed text-slate-600">
						By completing this section, I/We wish to confirm the above information provided is true
						and pledge to support the objectives of the <span class="font-bold text-emerald-900"
							>National Toilet Association</span
						>.
					</p>
				</div>

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

			<!-- <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
			</div> -->

			<Button
				type="button"
				onclick={handleShowReview}
				class="mx-auto w-full max-w-md px-4 py-3 text-base shadow-lg disabled:cursor-not-allowed disabled:bg-green-200 sm:text-lg lg:text-xl "
			>
				Review Application
			</Button>
		</form>

		<div
			class="animate-in fade-in slide-in-from-bottom-6 duration-500 {isReviewing
				? 'block'
				: 'hidden'}"
		>
			<header class="mb-8 flex items-center justify-between border-b border-slate-200 pb-8">
				<div>
					<h2 class="text-3xl font-black tracking-tight text-slate-900">Review Application</h2>
					<p class="font-medium text-slate-500">Confirm your details before final submission.</p>
				</div>
				<span
					class="hidden items-center rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold tracking-widest text-emerald-700 uppercase md:inline-flex"
				>
					Final Step
				</span>
			</header>

			<div class="space-y-6">
				<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h4 class="mb-4 text-xs font-black tracking-widest text-emerald-600 uppercase">
						Entity & Contact
					</h4>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div class="md:col-span-1">{@render ReviewItem('Company Name', $data.companyName)}</div>
						{@render ReviewItem('Phone Number', $data.phone)}
						{@render ReviewItem('Email Address', $data.email)}
					</div>
				</div>

				<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h4 class="mb-4 text-xs font-black tracking-widest text-emerald-600 uppercase">
						Registration & Services
					</h4>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						{@render ReviewItem('Register As', $data.registerAs)}
						{@render ReviewItem('Ghana Card No.', $data.ghCardNumber)}
						<div class="md:col-span-1">
							{@render ReviewItem(
								'Scope of Services',
								Array.isArray($data.scopeOfServices)
									? $data.scopeOfServices.join(', ')
									: $data.scopeOfServices
							)}
						</div>
					</div>
				</div>

				<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

				<!-- After Physical Address section -->
				<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h4 class="mb-4 text-xs font-black tracking-widest text-emerald-600 uppercase">
						Operational Details
					</h4>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						{@render ReviewItem('Operational Area', $data.operationalArea)}
						{@render ReviewItem('Year Established', String($data.yearEstablished ?? '—'))}
						{@render ReviewItem('Company Reg. No.', $data.regNo)}
					</div>
					<div class="mt-4">
						{@render ReviewItem('Description', $data.description)}
					</div>
				</div>

				<!-- After Operational Details -->
				<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h4 class="mb-4 text-xs font-black tracking-widest text-emerald-600 uppercase">
						Employee Details
					</h4>
					<div
						class="hidden grid-cols-4 gap-4 px-2 pb-2 text-[10px] font-black tracking-wider text-slate-400 uppercase md:grid"
					>
						<div>Category</div>
						<div>Total</div>
						<div>Trained</div>
						<div>Certified Names</div>
					</div>
					<div class="space-y-3">
						{#each ['Mason', 'Carpenter', 'Tiler', 'Painter', 'Plumber'] as cat}
							<div
								class="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 md:grid-cols-4"
							>
								<span class="text-xs font-black tracking-widest text-slate-400 uppercase md:hidden"
									>Category</span
								>
								<span class="font-bold text-slate-700">{cat}</span>
								{@render ReviewItem('Total', String($data.employees?.[cat]?.total ?? 0))}
								{@render ReviewItem('Trained', String($data.employees?.[cat]?.trained ?? 0))}
								{@render ReviewItem('Certified', $data.employees?.[cat]?.certified || '—')}
							</div>
						{/each}
					</div>
				</div>

				<div class="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
					<h4 class="mb-4 text-xs font-black text-slate-900 uppercase">Declaration Details</h4>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{@render ReviewItem('Signed By', $data.declarantName)}
						{@render ReviewItem('Position', $data.declarantPosition)}
					</div>
				</div>

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
		</div>
	</div>
</div>
