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

	import Tracker from "./components/Tracker.svelte";
	import Form from "./components/Form.svelte";
	import Menu from "./components/Menu.svelte";
	import TrackerGroup from "./components/TrackerGroup.svelte";
	//#endregion

	let trackers: (ITracker | ITrackerGroup)[] = [];

	$: sum = trackers.reduce((acc, tracker) => acc + tracker.duration, 0);
	$: sumFormatted = new Date(sum * 1000).toISOString().substr(11, 8);
	$: sumStyled = `<strong>${sumFormatted.substr(
		0,
		5
	)}</strong>:${sumFormatted.substr(6, 2)}`;
	$: isAnyTrackerActive = trackers.findIndex((t) => t.active) > -1;
	$: activeIcon = isAnyTrackerActive ? "🔴" : "⏸️";

	//#region TRACKING
	function stopTheCount(id?: string) {
		trackers = [
			...trackers.map((t) => {
				if (t.id === id) {
					return { ...t, active: true };
				}
				return {
					...t,
					active: false,
				};
			}),
		];
	}

	function handleStartTracking(id: string) {
		// stop all
		stopTheCount();
		// restart current
		const i = trackers.findIndex((t) => t.id === id);
		if (i > -1) {
			trackers[i].active = true;
		}
		trackers = [...trackers];
	}

	function handleDelete(deleteDetail: any) {
		const { id } = deleteDetail;

		trackers = trackers.filter((t) => t.id !== id);
		backup();
	}

	function handleSubmit(newTracker: ITracker) {
		trackers = [newTracker, ...trackers];
		backup();
	}

	function isIdFree(id: string): boolean {
		return trackers.findIndex((t) => t.id === id) === -1;
	}

	function handleNewDuration({ id, duration }) {
		const i = trackers.findIndex((t) => t.id === id);
		if (i > -1) {
			trackers[i].duration = duration;
		}
		backup();
	}

	function handleNameChanged({ name, id }) {
		const i = trackers.findIndex((t) => t.id === id);
		if (i > -1) {
			trackers[i].name = name;
		}
		backup();
	}
	//#endregion

	//#region BACKUP
	function backup() {
		localStorage.setItem(
			"backup",
			JSON.stringify({ date: new Date().toISOString(), data: trackers })
		);
	}

	function restoreBackup() {
		const backup = JSON.parse(localStorage.getItem("backup"));
		if (backup) {
			console.log("Found backup", backup);
			const parsedTrackers = backup.data;
			trackers = parsedTrackers.map((t) => {
				return { ...t, active: false };
			});
		}
	}
	//#endregion

	function handleDragStart(event, sourceIndex: number) {
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.dropEffect = "move";
		event.dataTransfer.setData("trackerId", sourceIndex);
	}

	function handleDrop(event, targetIndex: number) {
		event.dataTransfer.dropEffect = "move";
		const sourceIndex = Number(event.dataTransfer.getData("trackerId"));

		const newTrackers = trackers;

		if (sourceIndex < targetIndex) {
			newTrackers.splice(targetIndex + 1, 0, newTrackers[sourceIndex]);
			newTrackers.splice(sourceIndex, 1);
		} else {
			newTrackers.splice(targetIndex, 0, newTrackers[sourceIndex]);
			newTrackers.splice(sourceIndex + 1, 1);
		}
		trackers = newTrackers;
	}

	onMount(() => {
		setInterval(() => {
			tick.update((t) => t + 1);
		}, 1000);
		restoreBackup();

		// window.onbeforeunload = function () {
		// 	return "Your tracker will stop working when you leave this page";
		// };
	});
</script>

<svelte:head>
	<title>JJ-Tracker - {sumFormatted} {activeIcon}</title>
</svelte:head>

<main class="w-full h-full px-2 py-1">
	<!-- HEADROW -->
	<div class="fixed z-10 w-full top-0 left-0 px-2 py-1">
		<header
			class="items-baseline px-4 py-2 uppercase bg-blue-600 text-gray-50 rounded flex flex-row justify-between bg-gradient-to-r dark:from-purple-600 dark:via-red-500 dark:to-yellow-400"
		>
			<div class="hidden md:block">
				Active trackings {trackers.length}
			</div>

			<span>
				{@html sumStyled}
			</span>

			<!-- BUTTONS -->
			<div>
				<button
					on:click={() => stopTheCount()}
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
			{#each trackers as trackingUnit, index (trackingUnit.id)}
				<div animate:flip={{ easing: backInOut, duration: 400 }}>
					{#if trackingUnit.hasOwnProperty("trackers")}
						<!-- TRACKER GROUP -->
						<TrackerGroup
							{...trackingUnit}
							draggable={true}
							on:nameChange={(e) => handleNameChanged(e.detail)}
							on:delete={(e) => handleDelete(e.detail)}
						/>
					{:else}
						<!-- TRACKER -->
						<Tracker
							{...trackingUnit}
							draggable={true}
							on:delete={(e) => handleDelete(e.detail)}
							on:start={(e) => handleStartTracking(e.detail.id)}
							on:newDuration={(e) => handleNewDuration(e.detail)}
							on:nameChange={(e) => handleNameChanged(e.detail)}
							on:dragstart={(e) =>
								handleDragStart(e.detail.event, index)}
							on:drop={(e) => handleDrop(e.detail.event, index)}
						/>
					{/if}
				</div>
			{/each}
		</ul>
	</section>

	<div class="fixed bottom-0 left-0 w-full px-8 py-4">
		<!-- NEW FORM -->
		<Form
			submit={(newTracker) => handleSubmit(newTracker)}
			checkID={(id) => isIdFree(id)}
		/>
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
