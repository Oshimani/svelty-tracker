<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { fly, scale } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { backInOut } from "svelte/easing";

    import Icon from "svelte-awesome";
    import {
        faHourglass,
        faPlayCircle,
    } from "@fortawesome/free-regular-svg-icons";
    import {
        faUndo,
        faTrash,
        faCrosshairs,
    } from "@fortawesome/free-solid-svg-icons";
    import type { ITracker } from "../models/ITracker";
    import { hideTarget } from "../stores/settings-store";

    import Tracker from "./Tracker.svelte";

    const dispatch = createEventDispatcher();

    export let trackers: ITracker[] = [];
    export let id: string;
    export let name: string;
    export let duration: number = 0;
    export let target: number = 0;
    export let active: boolean = false;

    export let draggable: boolean;

    $: sum = trackers.reduce((acc, tracker) => acc + tracker.duration, 0);
    $: sumFormatted = new Date(sum * 1000).toISOString().substr(11, 8);
    $: sumStyled = `<strong>${sumFormatted.substr(
        0,
        5
    )}</strong>:${sumFormatted.substr(6, 2)}`;

    $: targetFormatted = formatDate(target);
    $: targetStyled = styleDate(targetFormatted);
    $: precentUsed =
        (duration / target) * 100 <= 100 ? (duration / target) * 100 : 100;

    let inputValue: string = "";

    function formatDate(value: number) {
        return new Date(value * 1000).toISOString().substr(11, 8);
    }

    function styleDate(value: string) {
        return `<strong>${value.substr(0, 5)}</strong>:${value.substr(6, 2)}`;
    }

    onMount(() => {
        inputValue = name;
    });

    //#region TRACKER GROUP FUNCTIONS
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
        // todo: stop other TGs count
    }
    function handleDeleteClick() {
        if (confirm(`Delete ${name}?`)) {
            dispatch("delete", { id });
        }
    }
    //#endregion

    //#region TRACKER FUNCTIONS
    function handleTrackerStartTracking(id: string) {
        // stop all
        stopTheCount();
        // restart current
        const i = trackers.findIndex((t) => t.id === id);
        if (i > -1) {
            trackers[i].active = true;
        }
        trackers = [...trackers];
    }

    function handleTrackerDelete(deleteDetail: any) {
        const { id } = deleteDetail;

        trackers = trackers.filter((t) => t.id !== id);
        // backup();
    }

    function handleTrackerNewDuration({ id, duration }) {
        const i = trackers.findIndex((t) => t.id === id);
        if (i > -1) {
            trackers[i].duration = duration;
        }
        // backup();
    }

    function handleTrackerNameChanged({ name, id }) {
        const i = trackers.findIndex((t) => t.id === id);
        if (i > -1) {
            trackers[i].name = name;
        }
        // backup();
    }

    function handleTrackerDragStart(event, sourceIndex: number) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.dropEffect = "move";
        event.dataTransfer.setData("trackerId", sourceIndex);
    }

    function handleTrackerDrop(event, targetIndex: number) {
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

<!-- TRACKER LIST -->
<li
    {draggable}
    on:dragstart={(event) => dispatch("dragstart", { event })}
    on:dragover|preventDefault={() => false}
    on:drop|preventDefault={(event) => dispatch("drop", { event })}
    class="py-2"
    transition:fly={{ y: -100, duration: 400, easing: backInOut }}
>
    <div
        class={`${
            target > 0 ? "rounded-b-none" : ""
        } flex-wrap px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 flex flex-row gap-4 shadow-md rounded justify-between items-center`}
    >
        <input
            class={`input flex-grow overflow-hidden`}
            type="text"
            bind:value={inputValue}
            on:change={() => dispatch("nameChange", { name: inputValue, id })}
        />

        <section class="flex flex-row gap-4 justify-evenly w-full md:w-auto">
            <!-- TARGET -->
            {#if !$hideTarget}
                <div
                    class={`${
                        target === 0 ? "opacity-30" : ""
                    } flex flex-row gap-1`}
                >
                    <div class="flex items-center">
                        <Icon data={faCrosshairs} />
                    </div>
                    {@html targetStyled}
                </div>
            {/if}

            <!-- TIMER -->
            <div
                class={`${
                    duration === 0 ? "opacity-30" : ""
                } flex flex-row gap-1`}
            >
                <div class={`${active ? "spin" : ""} flex items-center`}>
                    <Icon data={faHourglass} />
                </div>
                {@html sumStyled}
            </div>
        </section>

        <!-- BUTTONS -->
        <div class="flex flex-row gap-1 justify-evenly w-full md:w-auto">
            <button disabled class={`btn secondary-btn`} on:click={() => false}
                ><Icon data={faUndo} /></button
            >
            <button
                class={`btn secondary-btn`}
                on:click={() => handleDeleteClick()}
                ><Icon data={faTrash} /></button
            >
        </div>
    </div>
    <ul>
        {#each trackers as tracker, index (tracker.id)}
            <div animate:flip={{ easing: backInOut, duration: 400 }}>
                <Tracker
                    {...tracker}
                    draggable={true}
                    on:delete={(e) => handleTrackerDelete(e.detail)}
                    on:start={(e) => handleTrackerStartTracking(e.detail.id)}
                    on:newDuration={(e) => handleTrackerNewDuration(e.detail)}
                    on:nameChange={(e) => handleTrackerNameChanged(e.detail)}
                    on:dragstart={(e) =>
                        handleTrackerDragStart(e.detail.event, index)}
                    on:drop={(e) => handleTrackerDrop(e.detail.event, index)}
                />
            </div>
        {/each}
    </ul>
</li>

<style>
</style>
