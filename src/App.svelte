<script lang="ts">
	import { onMount } from "svelte";
	import { faCoffee } from "@fortawesome/free-solid-svg-icons";
	import Icon from "svelte-awesome";
	
	import { ITracker } from "./ITracker";

	import Tracker from "./Tracker.svelte";

	let trackers: ITracker[] = [];
	let formName: string;

	function stopTheCount() {
		trackers.forEach((tracker) => tracker.stop());
	}

	function handleDelete(deleteDetail: any) {
		const { id } = deleteDetail;
		console.log(id);

		trackers = trackers.filter((t) => t.id !== id);
	}

	function handleSubmit() {
		trackers = [new ITracker(undefined, formName, true), ...trackers];
		formName = "";
	}

	function restoreBackup() {
		const backup = localStorage.getItem("backup");
		if (backup) {
			console.log("Found backup", JSON.parse(backup));
			const parsedTrackers = JSON.parse(backup);
			trackers = [
				parsedTrackers.map((t) => {
					return new ITracker(t.name, t.active, t.duration);
				}),
			];
		}
	}

	onMount(() => {
		// restoreBackup();
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
			<Tracker {tracker} on:delete={(e) => handleDelete(e.detail)} />
		{/each}
	</ul>

	<form on:submit|preventDefault={() => handleSubmit()}>
		<input type="text" bind:value={formName} />
		<button type="submit">Add</button>
	</form>

	<div>
		<button class="px-2 py-1" on:click={() => restoreBackup()}
			>Restore</button
		>
	</div>
</main>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
