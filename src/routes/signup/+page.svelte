<!-- src/routes/signup/+page.svelte -->
<div class="flex min-h-[70vh] items-center justify-center p-4 py-12">
	<div
		class="w-full max-w-md rounded-3xl border border-emerald-50 bg-white p-8 shadow-2xl shadow-emerald-100 md:p-12"
	>
		<div class="mb-10 text-center">
			<h2 class="text-3xl font-bold text-slate-900">Create Account</h2>
			<p class="mt-2 text-slate-500">Start your membership application</p>
		</div>

		<form class="space-y-5" onsubmit={(e) => e.preventDefault()}>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="mb-2 block text-xs font-bold text-slate-500 uppercase">First Name</label>
					<input
						type="text"
						class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
					/>
				</div>
				<div>
					<label class="mb-2 block text-xs font-bold text-slate-500 uppercase">Last Name</label>
					<input
						type="text"
						class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
					/>
				</div>
			</div>

			<div>
				<label class="mb-2 block text-xs font-bold text-slate-500 uppercase">Email</label>
				<input
					type="email"
					class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
				/>
			</div>

			<div>
				<label class="mb-2 block text-xs font-bold text-slate-500 uppercase">Create Password</label>
				<input
					type="password"
					class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
				/>
				<p class="mt-1 text-[10px] text-slate-400 italic">Minimum 8 characters with numbers.</p>
			</div>

			<div class="pt-4">
				<button
					type="submit"
					class="w-full rounded-xl bg-emerald-600 py-4 font-bold text-white transition-all hover:bg-emerald-700"
				>
					Create Account & Continue
				</button>
			</div>

			<div class="relative py-4">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-slate-100"></div>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-white px-2 text-slate-400">Already Registered?</span>
				</div>
			</div>

			<a
				href="/login"
				class="block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
			>
				Login to Portal
			</a>
		</form>
	</div>
</div>
