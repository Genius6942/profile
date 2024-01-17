<script lang="ts">
	import '$css/global.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
</script>

<!-- header -->
<div
	class="pl-3 flex fixed top-0 left-0 h-12 bg-orange-900 text-white z-10 w-screen shadow-lg items-center"
>
	<div class="w-60 items-center flex">
		<a href="/" class="flex items-center text-white">
			<!-- Icon -->
			<img src="/favicon.ico" class="h-12 w-12 p-2 -ml-2 rounded-full" alt="site icon" />
			<!-- Title -->
			<h1 class="text-xl p-2 italic fira-code text-center">haelp.dev</h1>
		</a>
	</div>
	<div class="flex-grow flex justify-center items-center"></div>
	<div class="w-60 flex items-center justify-end text-xl pr-3 gap-3">
		<a href="https://ch.tetr.io/u/haelp" target="_blank" rel="noopener noreferrer"
			><img src="/icons/tetrio.png" alt="" class="w-5 h-5 -mb-[3px]" />
		</a>
		<a href="https://github.com/Genius6942" target="_blank" rel="noopener noreferrer"
			><i class="fa-brands fa-github" />
		</a>
	</div>
</div>

<div class="flex flex-col overflow-hidden h-screen w-screen">
	<!-- header holder -->
	<div class="h-12"></div>
	<!-- content -->

	<div class="overflow-auto flex-grow">
		<slot />
	</div>
	<!-- footer -->
</div>
