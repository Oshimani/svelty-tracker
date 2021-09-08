<script lang="ts">
	import { flip } from "svelte/animate";
	import { backInOut } from "svelte/easing";
	
    import type { ITracker } from "../models/ITracker";
	
    import Tracker from "./Tracker.svelte";
	
    let trackers: ITracker[] = [];
	
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
		// backup();
	}

    function handleNewDuration({ id, duration }) {
		const i = trackers.findIndex((t) => t.id === id);
		if (i > -1) {
			trackers[i].duration = duration;
		}
		// backup();
	}

	function handleNameChanged({ name, id }) {
		const i = trackers.findIndex((t) => t.id === id);
		if (i > -1) {
			trackers[i].name = name;
		}
		// backup();
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
</script>

<!-- TRACKER LIST -->
<ul>
    {#each trackers as tracker, index (tracker.id)}
        <div animate:flip={{ easing: backInOut, duration: 400 }}>
            <Tracker
                {...tracker}
                draggable={true}
                on:delete={(e) => handleDelete(e.detail)}
                on:start={(e) => handleStartTracking(e.detail.id)}
                on:newDuration={(e) => handleNewDuration(e.detail)}
                on:nameChange={(e) => handleNameChanged(e.detail)}
                on:dragstart={(e) =>
                    handleDragStart(e.detail.event, index)}
                on:drop={(e) => handleDrop(e.detail.event, index)}
            />
        </div>
    {/each}
</ul>

<style>
</style>