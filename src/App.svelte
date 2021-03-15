<script lang="ts">
	import { onMount } from "svelte";
	import { faCoffee } from "@fortawesome/free-solid-svg-icons";
	import Icon from "svelte-awesome";

	import { tick } from "./store";
	import Tracker from "./Tracker.svelte";

	let trackers: any[] = [];
	let formName: string;

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

	function handleDelete(deleteDetail: any) {
		const { id } = deleteDetail;
		console.log(id);

		trackers = trackers.filter((t) => t.id !== id);
	}

	function handleSubmit() {
		trackers = [{ name: formName, id: formName }, ...trackers];
		formName = "";
	}

	function handleNewDuration({ id, duration }) {
		const i = trackers.findIndex((t) => t.id === id);
		if (i > -1) {
			trackers[i].duration = duration;
		}
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
		class="px-4 py-2 uppercase bg-blue-600 text-white rounded flex flex-row justify-between"
	>
		<div>
			Active trackings {trackers.length}
		</div>

		<button
			on:click={() => stopTheCount()}
			class="px-1 bg-red-500 uppercase"
			><Icon data={faCoffee} /> Stop the Count</button
		>
	</h1>
	<ul>
		{#each trackers as tracker (tracker.id)}
			<Tracker
				{...tracker}
				on:delete={(e) => handleDelete(e.detail)}
				on:startTracking={(e) => stopTheCount(e.detail.id)}
				on:newDuration={(e) => handleNewDuration(e.detail)}
			/>
		{/each}
	</ul>

	<form class="mt-4" on:submit|preventDefault={() => handleSubmit()}>
		<input type="text" bind:value={formName} />
		<button type="submit">Add</button>
	</form>

	<div>
		<button class="px-2 py-1" on:click={() => backup()}>Backup</button>
		<button class="px-2 py-1" on:click={() => restoreBackup()}
			>Restore</button
		>
	</div>
</main>
