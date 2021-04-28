<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { flip } from "svelte/animate";
    import { backInOut } from "svelte/easing";

    import type { ITracker } from "../models/ITracker";

    import Tracker from "./Tracker.svelte";

    const dispatch = createEventDispatcher();

    export let trackers: ITracker[] = [];
    export let id:string;
    export let name:string;

    $: sum = trackers.reduce((acc, tracker) => acc + tracker.duration, 0);
    $: sumFormatted = new Date(sum * 1000).toISOString().substr(11, 8);
    $: sumStyled = `<strong>${sumFormatted.substr(
        0,
        5
    )}</strong>:${sumFormatted.substr(6, 2)}`;

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

    //#region DRAG & DROP
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
    //#endregion
</script>

<section>
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
                    on:dragstart={(e) => handleDragStart(e.detail.event, index)}
                    on:drop={(e) => handleDrop(e.detail.event, index)}
                />
            </div>
        {/each}
    </ul>
</section>
