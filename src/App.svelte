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
		console.log("ID:", id);

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
		trackers = [{ name: formName, id: formName, duration: 0 }, ...trackers];
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
			trackers = parsedTrackers;
		}
	}

	onMount(() => {
		setInterval(() => {
			tick.update((t) => t + 1);
		}, 1000);
		restoreBackup();
	});
</script>

<main>
	<h1
		class="items-baseline px-4 py-2 uppercase bg-blue-600 text-white rounded flex flex-row justify-between"
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
	</h1>
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

	<!-- NEW FORM -->
	<form class="mt-4" on:submit|preventDefault={() => handleSubmit()}>
		<input type="text" bind:value={formName} />
		<button type="submit"><Icon data={faPlus} /> Add</button>
	</form>

	<!-- BACKUP BUTTONS -->
	<div class="absolute bottom-4 left-8">
		<button
			class="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-4 py-2 shadow-xl border-none"
			on:click={() => backup()}>Backup</button
		>
		<button
			class="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-4 py-2 shadow-xl border-none"
			on:click={() => restoreBackup()}>Restore</button
		>
	</div>
</main>

<style>
	:global(button) {
		@apply px-4;
		@apply py-2;
		@apply rounded-2xl;
	}
	:global(button:hover) {
		@apply bg-gray-200;
	}
</style>
