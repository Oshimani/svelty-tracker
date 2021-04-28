<script lang="ts">
	//#region IMPORTS
	import { onMount } from "svelte";
	import { flip } from "svelte/animate";
	import { backInOut } from "svelte/easing";

	import { faCoffee } from "@fortawesome/free-solid-svg-icons";
	import Icon from "svelte-awesome";

	import type { ITracker } from "./models/ITracker";
	import type { ITrackerGroup } from "./models/ITrackerGroup";

	import { tick } from "./store";

	import TrackerGroup from "./components/TrackerGroup.svelte";
	import Form from "./components/Form.svelte";
	import Menu from "./components/Menu.svelte";
	//#endregion

	let trackerGroups: ITrackerGroup[] = [];

	// TODO: fix later
	// $: isAnyTrackerActive = trackers.findIndex((t) => t.active) > -1;
	// $: activeIcon = isAnyTrackerActive ? "🔴" : "⏸️";

	//#region BACKUP
	// function backup() {
	// 	localStorage.setItem(
	// 		"backup",
	// 		JSON.stringify({ date: new Date().toISOString(), data: trackers })
	// 	);
	// }

	// function restoreBackup() {
	// 	const backup = JSON.parse(localStorage.getItem("backup"));
	// 	if (backup) {
	// 		console.log("Found backup", backup);
	// 		const parsedTrackers = backup.data;
	// 		trackers = parsedTrackers.map((t) => {
	// 			return { ...t, active: false };
	// 		});
	// 	}
	// }
	//#endregion

	function handleSubmitNewGroup(){
		
	}

	onMount(() => {
		setInterval(() => {
			tick.update((t) => t + 1);
		}, 1000);
		// restoreBackup();

		// window.onbeforeunload = function () {
		// 	return "Your tracker will stop working when you leave this page";
		// };
	});
</script>

<svelte:head>
	<!-- TODO: Fix later -->
	<!-- <title>JJ-Tracker - {sumFormatted} {activeIcon}</title> -->
</svelte:head>

<main class="w-full h-full px-2 py-1">
	<!-- HEADROW -->
	<div class="fixed z-10 w-full top-0 left-0 px-2 py-1">
		<header
			class="items-baseline px-4 py-2 uppercase bg-blue-600 text-gray-50 rounded flex flex-row justify-between bg-gradient-to-r dark:from-purple-600 dark:via-red-500 dark:to-yellow-400"
		>
			<div class="hidden md:block">
				<!-- Active trackings {trackers.length} -->
			</div>

			<span>
				<!-- {@html sumStyled} -->
			</span>

			<!-- BUTTONS -->
			<div>
				<button
					class={`btn bg-red-500 hover:bg-red-400 uppercase border-none`}
					><Icon data={faCoffee} /><span
						class={`ml-1 hidden md:inline`}>Stop the Count</span
					></button
				>
				<Menu />
			</div>
		</header>
	</div>

	<!-- CONTENT -->
	<section class="pt-16 pb-14">
		<!-- TRACKER LIST -->
		<ul>
			{#each trackerGroups as group, index (group.id)}
				<TrackerGroup {...group} />
			{:else}
				Use input at the bottom left to add trackers.
			{/each}
		</ul>
	</section>

	<div
		class="fixed bottom-0 left-0 w-full px-8 py-4 flex flex-row justify-between items-end"
	>
		<!-- NEW FORM -->
		<!-- <Form
			submit={(newTracker) => handleSubmit(newTracker)}
			checkID={(id) => isIdFree(id)}
		/> -->

		<form>
			<input type="text">
			<button class="btn" on:click|preventDefault={()=>{handleSubmitNewGroup()}}>Add Group</button>
		</form>
	</div>
</main>

<style>
	:global(*) {
		outline: none !important;
	}
	:global(body) {
		@apply bg-gray-200 dark:bg-gray-900;
	}
	:global(input:focus, textarea:focus, button:focus) {
		@apply ring;
	}

	:global(.btn) {
		/* general */
		@apply rounded-2xl px-4 py-2;
		/* general dark */
		@apply dark:text-gray-100;
		/* disabled */
		@apply disabled:cursor-default disabled:bg-gray-100 disabled:text-gray-500 !important;
		/* disabled dark */
		@apply dark:disabled:bg-gray-700 dark:disabled:from-gray-700 dark:disabled:to-gray-700 dark:disabled:text-gray-400 !important;
	}
	/* .btn, */
	:global(.primary-btn) {
		/* general */
		@apply bg-blue-600 hover:bg-blue-500 text-white;
		/* general dark */
		@apply bg-gradient-to-r dark:from-red-600 dark:via-red-500 dark:to-yellow-400 dark:hover:from-red-500 dark:hover:via-red-400 dark:hover:to-yellow-400;
	}
	/* .btn, */
	:global(.secondary-btn) {
		/* general */
		@apply bg-gray-50 hover:bg-gray-100;
		/* general dark */
		@apply dark:bg-gray-800 dark:hover:bg-gray-700;
	}

	:global(.input) {
		/* general */
		@apply px-4 py-1 rounded-2xl shadow-inner;
		/* general dark */
		@apply dark:bg-gray-600 dark:border-gray-600 dark:text-gray-100;
	}
</style>
