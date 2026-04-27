<script lang="ts" module>
	import { registerPlugin } from 'svelte-filepond';
	import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
	import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

	registerPlugin(
		FilePondPluginImageExifOrientation,
		FilePondPluginImagePreview,
		FilePondPluginFileValidateType
	);
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import FilePond from 'svelte-filepond';
	import { nanoid } from 'nanoid';
	import { fade } from 'svelte/transition';

	interface FileUploaderProps {
		title?: string;
		subTitle?: string;
		url?: string;
		name?: string;
		label?: string;
		allowMultiple?: boolean;
		acceptedFileTypes?: string[];
		files?: any[];
		required?: boolean;
		showError?: boolean;
		imageOnly?: boolean;
		hasError?: boolean;
		error?: string;
		onChange?: (detail: { name: string; value: any } | null) => void;
	}

	let {
		title = 'Click Browse or drop the file to upload',
		subTitle = '',
		url = '',
		name = 'file',
		label = '',
		allowMultiple = false,
		acceptedFileTypes = [
			'image/png',
			'image/jpeg',
			'application/pdf',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		],
		files = [],
		required = false,
		showError = false,
		imageOnly = false,
		hasError = false,
		error = '',
		onChange = (detail: { name: string; value: any } | null) => {}
	} = $props();
	let loaded = false;
	let pond: any;
	let id = nanoid();

	function handleFilesUpdate(fileItems: any[]) {
		if (allowMultiple) {
			onChange({ name, value: fileItems.map((item) => item.file) });
		} else if (fileItems.length === 1) {
			onChange({ name, value: fileItems[0].file });
		} else {
			onChange(null);
		}
	}

	function customFileTypeDetection(source: File, type: string): Promise<string> {
		return new Promise((resolve) => {
			const fileName = source.name;
			if (fileName.endsWith('.frx')) {
				resolve('.frx');
			} else {
				resolve(type);
			}
		});
	}

	const uploadServerConfig = {};

	onMount(() => {
		loaded = true;
	});
</script>

<div class="mx-auto flex w-full flex-col gap-2">
	{#if label}
		<label for={id} class="text-sm font-semibold text-gray-700">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative">
		<FilePond
			{name}
			{required}
			allowReplace
			instantUpload={false}
			server={uploadServerConfig}
			{allowMultiple}
			allowRevert
			allowImagePreview
			allowImageResize
			bind:this={pond}
			onupdatefiles={handleFilesUpdate}
			{files}
			{acceptedFileTypes}
			fileValidateTypeDetectType={customFileTypeDetection}
			credits={false}
			class="rounded-md border border-gray-200 bg-white transition  "
		/>

		{#if hasError}
			<div transition:fade class="absolute top-0 right-0 mt-2 mr-2 flex items-center gap-1 text-sm">
				<span class="hidden rounded bg-red-50 px-2 py-1 text-red-500 backdrop-blur-sm sm:block">
					{error}
				</span>
				<iconify-icon
					icon="solar:danger-circle-bold-duotone"
					class="cursor-pointer text-lg text-red-500 hover:text-red-600"
				></iconify-icon>
			</div>
		{/if}
	</div>

	{#if subTitle}
		<p class="mt-1 text-xs text-gray-500">{subTitle}</p>
	{/if}
</div>

<!-- <style>
	:global(.filepond--root) {
		min-height: 150px;
	}
</style> -->
