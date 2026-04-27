<div class="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="text-center sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="text-3xl font-extrabold text-slate-900">Welcome Back</h2>
		<p class="mt-2 text-sm text-slate-600">Login to your member dashboard</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="rounded-2xl border border-slate-100 bg-white px-4 py-8 shadow-xl sm:px-10">
			<form class="space-y-6" onsubmit={(e) => e.preventDefault()}>
				<div>
					<label for="email" class="block text-sm font-medium text-slate-700">Email Address</label>
					<input
						id="email"
						type="email"
						required
						class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-slate-700">Password</label>
					<input
						id="password"
						type="password"
						required
						class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
					/>
				</div>

				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<input
							id="remember"
							type="checkbox"
							class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
						/>
						<label for="remember" class="ml-2 block text-sm text-slate-600">Remember me</label>
					</div>
					<a href="#" class="text-sm font-medium text-emerald-600 hover:text-emerald-500"
						>Forgot password?</a
					>
				</div>

				<button
					type="submit"
					class="flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
				>
					Sign In
				</button>
			</form>
		</div>
	</div>
</div>
