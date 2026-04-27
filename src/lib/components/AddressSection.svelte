<script lang="ts">
	import InputField from './ui/InputField.svelte';
	import SelectField from './ui/SelectField.svelte';
	import ghanaData from '$lib/data/regionsAndDistricts.json';
	let { errors } = $props();

	let selectedRegion = $state('');

	const regionOptions = ghanaData.regions.map((r) => ({
		value: r.label,
		name: r.label
	}));

	const districtOptions = $derived.by(() => {
		const region = ghanaData.regions.find((r) => r.label === selectedRegion);
		if (!region) return [];

		return region.districts.map((d) => ({
			value: d.label,
			name: d.label
		}));
	});

	function handleRegionChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedRegion = target.value;
	}
</script>

<div class="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
	<div class="mb-2 flex items-center gap-3">
		<h3 class="text-xl font-bold tracking-tight text-slate-800">Location Details</h3>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<InputField
			label="House/Property No."
			name="houseNo"
			placeholder="HSE 123..."
			errors={errors.houseNo}
		/>
		<InputField
			label="Street Name"
			name="streetName"
			placeholder="Main St."
			errors={errors.streetName}
		/>

		<InputField label="Town" name="town" errors={errors.town} />
		<InputField label="Suburb" name="suburb" errors={errors.suburb} />
		<InputField label="Ghana Post GPS" name="gps" placeholder="GA-000-0000" errors={errors.gps} />
		<div class="md:col-span-2">
			<InputField
				label="Nearest Landmark"
				name="landmark"
				placeholder="e.g. Opposite the Central Market"
				errors={errors.landmark}
			/>
		</div>
		<SelectField
			label="Region"
			name="region"
			options={regionOptions}
			errors={errors.region}
			onchange={handleRegionChange}
		/>

		<SelectField
			label="District Assembly"
			name="assembly"
			options={districtOptions}
			errors={errors.assembly}
			disabled={!selectedRegion}
			placeholder={selectedRegion ? 'Select District' : 'Select a region first'}
		/>
	</div>
</div>
