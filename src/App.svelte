<script lang="ts">
	import { onMount } from "svelte";
	import { faCoffee } from "@fortawesome/free-solid-svg-icons";
	import Icon from "svelte-awesome";

	import type { ITracker } from "./models/ITracker";

	import { tick } from "./store";

	import Tracker from "./Tracker.svelte";
	import Form from "./components/Form.svelte";
	import { BUTTON } from "./styles/theme";

	let trackers: any[] = [];

	$: sum = trackers.reduce((acc, tracker) => acc + tracker.duration, 0);
	$: sumFormatted = new Date(sum * 1000).toISOString().substr(11, 8);
	$: sumStyled = `<strong>${sumFormatted.substr(
		0,
		5
	)}</strong>:${sumFormatted.substr(6, 2)}`;
	$: isAnyTrackerActive = trackers.findIndex((t) => t.active) > -1;
	$: activeIcon = isAnyTrackerActive ? "🔴" : "⏸️";

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
		console.log(id);

		trackers = trackers.filter((t) => t.id !== id);
		backup();
	}

	function handleSubmit(newTracker: ITracker) {
		trackers = [newTracker, ...trackers];
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
			class="items-baseline px-4 py-2 uppercase bg-blue-600 text-white rounded flex flex-row justify-between bg-gradient-to-r dark:from-purple-600 dark:via-red-500 dark:to-yellow-400"
		>
			<div>
				Active trackings {trackers.length}
			</div>

			<span>
				{@html sumStyled}
			</span>

			<button
				on:click={() => stopTheCount()}
				class={`${BUTTON} bg-red-500 hover:bg-red-400 uppercase border-none`}
				><Icon data={faCoffee} /> Stop the Count</button
			>
		</header>
	</div>

	<!-- CONTENT -->
	<section class="pt-16 pb-14">
		<!-- TRACKER LIST -->
		<ul>
			{#each trackers as tracker (tracker.id)}
				<Tracker
					{...tracker}
					on:delete={(e) => handleDelete(e.detail)}
					on:start={(e) => handleStartTracking(e.detail.id)}
					on:newDuration={(e) => handleNewDuration(e.detail)}
					on:nameChange={(e) => handleNameChanged(e.detail)}
				/>
			{/each}
		</ul>
	</section>

	<div
		class="fixed bottom-0 left-0 w-full px-8 py-4 flex flex-row justify-between items-end"
	>
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
</style>
