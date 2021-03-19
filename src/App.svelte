<script lang="ts">
	import { onMount } from "svelte";
	import { faCoffee, faPlus } from "@fortawesome/free-solid-svg-icons";
	import Icon from "svelte-awesome";

	import { tick } from "./store";
	import Tracker from "./Tracker.svelte";

	let trackers: any[] = [];
	let formName: string;

	$: sum = trackers.reduce((acc, tracker) => acc + tracker.duration, 0);
	$: sumFormatted = new Date(sum * 1000).toISOString().substr(11, 8);
	$: sumStyled = `<strong>${sumFormatted.substr(
		0,
		5
	)}</strong>:${sumFormatted.substr(6, 2)}`;

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

	function handleSubmit() {
		if (trackers.find((t) => t.name === formName)) {
			alert(`Name: ${formName} alsready in list, name has to be unique.`);
			return;
		}
		trackers = [
			{ name: formName, id: formName, duration: 0, active: true },
			...trackers,
		];
		formName = "";
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
				class="bg-red-500 hover:bg-red-400 uppercase border-none"
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
		<form
			class="bg-gray-300 dark:bg-gray-700 rounded-2xl px-4 py-2"
			on:submit|preventDefault={() => handleSubmit()}
		>
			<input
				class="dark:bg-gray-600 dark:border-gray-600 text-gray-100"
				placeholder="new tracker"
				type="text"
				bind:value={formName}
			/>
			<button
				disabled={!formName}
				class="ml-1 bg-gray-300 hover:bg-gray-200 disabled:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-700 dark:text-gray-100 rounded-full"
				type="submit"><Icon data={faPlus} /></button
			>
		</form>

		<!-- BACKUP BUTTONS -->
		<div>
			<button
				disabled
				class="bg-blue-600 line-through text-white rounded-2xl px-4 py-2 shadow-xl border-none dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-700 dark:text-gray-100"
				on:click={() => {}}>Export</button
			>
			<button
				disabled
				class="bg-blue-600 line-through text-white rounded-2xl px-4 py-2 shadow-xl border-none dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-700 dark:text-gray-100"
				on:click={() => {}}>Import</button
			>
		</div>
	</div>
</main>

<style>
	:global(*) {
		outline: none !important;
	}
	:global(body) {
		@apply bg-gray-200 dark:bg-gray-900;
	}

	:global(input, textarea) {
		@apply border;
		@apply px-2;
		@apply py-1;
		@apply rounded-2xl;
	}
	:global(input:focus, textarea:focus, button:focus) {
		@apply ring;
	}
	:global(button) {
		@apply px-4;
		@apply py-2;
		@apply rounded-2xl;
		@apply bg-gray-50;
	}
	:global(button:hover) {
		@apply bg-gray-200;
	}
	:global(button:disabled) {
		@apply text-gray-500;
		@apply bg-gray-100;
	}
</style>
